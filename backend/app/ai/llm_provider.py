import json
import asyncio
import structlog
from abc import ABC, abstractmethod
from typing import Any, Dict, List
import google.generativeai as genai
from pydantic import BaseModel

from app.core.config import settings

logger = structlog.get_logger(__name__)


class LLMProvider(ABC):
    @abstractmethod
    async def generate_structured(self, prompt: str, system_prompt: str, response_model: Any) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def embed(self, text: str, dimensions: int = 1536) -> List[float]:
        pass


class GeminiProvider(LLMProvider):
    """Gemini provider with automatic API key rotation on quota exhaustion."""

    def __init__(self):
        # Build ordered key list from env — skip blanks
        self._api_keys: List[str] = [
            k for k in [
                settings.GEMINI_API_KEY,
                settings.GEMINI_API_KEY_2,
                settings.GEMINI_API_KEY_3,
            ] if k
        ]
        if not self._api_keys:
            raise ValueError("No Gemini API keys configured. Set GEMINI_API_KEY in .env")

        self._current_key_idx = 0
        self._configure_key(self._current_key_idx)
        self.model = genai.GenerativeModel(settings.LLM_MODEL)

    def _configure_key(self, idx: int):
        """Activate the key at given index."""
        genai.configure(api_key=self._api_keys[idx])
        logger.info("gemini_key_active", key_index=idx, total_keys=len(self._api_keys))

    def _rotate_key(self) -> bool:
        """Rotate to next available key. Returns False if all exhausted."""
        next_idx = self._current_key_idx + 1
        if next_idx >= len(self._api_keys):
            return False
        self._current_key_idx = next_idx
        self._configure_key(next_idx)
        # Recreate model with new key context
        self.model = genai.GenerativeModel(settings.LLM_MODEL)
        return True

    async def generate_structured(self, prompt: str, system_prompt: str, response_model: Any) -> Dict[str, Any]:
        generation_config = genai.types.GenerationConfig(
            response_mime_type="application/json",
            max_output_tokens=512,  # Free-tier optimization: cap output
        )
        full_prompt = f"{system_prompt}\n\n{prompt}"

        # Try current key, rotate on quota errors
        last_error = None
        attempts = len(self._api_keys)
        for _ in range(attempts):
            try:
                response = await asyncio.wait_for(
                    self.model.generate_content_async(
                        full_prompt,
                        generation_config=generation_config
                    ),
                    timeout=4.0  # Hard 4s cap per LLM call
                )
                raw_text = response.text.strip()
                # Robust JSON extraction: find first { and last }
                json_start = raw_text.find('{')
                json_end = raw_text.rfind('}')
                if json_start != -1 and json_end != -1 and json_end > json_start:
                    raw_text = raw_text[json_start:json_end + 1]
                else:
                    # Fallback: strip code fences
                    if raw_text.startswith("```json"):
                        raw_text = raw_text[7:]
                    elif raw_text.startswith("```"):
                        raw_text = raw_text[3:]
                    if raw_text.endswith("```"):
                        raw_text = raw_text[:-3]
                    raw_text = raw_text.strip()

                try:
                    return json.loads(raw_text)
                except json.JSONDecodeError as e:
                    logger.error("gemini_json_parse_error", error=str(e), text=response.text[:200])
                    raise ValueError(f"Failed to parse LLM response as JSON: {e}")

            except asyncio.TimeoutError:
                logger.warning("gemini_call_timeout", key_index=self._current_key_idx, timeout_s=4.0)
                last_error = TimeoutError("Gemini API call timed out after 4s")
                break  # Don't retry on timeout — use fallback

            except Exception as e:
                err_str = str(e).lower()
                is_quota = any(kw in err_str for kw in ["429", "resource_exhausted", "quota", "rate limit"])
                is_perm = "permission" in err_str or "403" in err_str
                if is_quota or is_perm:
                    logger.warning("gemini_key_quota_hit", key_index=self._current_key_idx, error=str(e))
                    if self._rotate_key():
                        continue  # Retry with next key
                last_error = e
                break

        raise last_error or ValueError("All Gemini API keys exhausted")

    async def embed(self, text: str, dimensions: int = 1536) -> List[float]:
        response = genai.embed_content(
            model=settings.EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document"
        )
        embedding = response['embedding']
        return embedding[:dimensions]


class OllamaProvider(LLMProvider):
    async def generate_structured(self, prompt: str, system_prompt: str, response_model: Any) -> Dict[str, Any]:
        raise NotImplementedError("OllamaProvider not yet implemented")

    async def embed(self, text: str, dimensions: int = 1536) -> List[float]:
        raise NotImplementedError("OllamaProvider not yet implemented")


def get_llm_provider() -> LLMProvider:
    if settings.LLM_PROVIDER.lower() == "gemini":
        return GeminiProvider()
    elif settings.LLM_PROVIDER.lower() == "ollama":
        return OllamaProvider()
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {settings.LLM_PROVIDER}")
