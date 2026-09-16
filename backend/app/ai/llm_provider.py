import json
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
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel(settings.LLM_MODEL)
    
    async def generate_structured(self, prompt: str, system_prompt: str, response_model: Any) -> Dict[str, Any]:
        generation_config = genai.types.GenerationConfig(
            response_mime_type="application/json",
        )
        full_prompt = f"{system_prompt}\n\n{prompt}"
        
        response = await self.model.generate_content_async(
            full_prompt,
            generation_config=generation_config
        )
        
        try:
            return json.loads(response.text)
        except json.JSONDecodeError as e:
            logger.error("gemini_json_parse_error", error=str(e), text=response.text)
            raise ValueError("Failed to parse LLM response as JSON")

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
