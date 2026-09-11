"""
ai/embeddings.py — Generate vector embeddings using Gemini text-embedding-004.

Used for:
  - Tier 1: embed incoming report → RAG retrieval
  - Scripts: generate knowledge chunk embeddings (ingest_knowledge.py)
"""
import logging
import hashlib
from typing import List

import numpy as np

from app.ai.gemini import EMBEDDING_MODEL, get_genai

logger = logging.getLogger(__name__)


async def embed_text(text: str) -> List[float]:
    """
    Generate a 3072-dim embedding vector for a single text string.
    Uses Gemini gemini-embedding-001 via the google-generativeai SDK.
    Falls back to a deterministic vector if Gemini API quota is reached.
    """
    try:
        _genai = get_genai()
        result = _genai.embed_content(
            model=EMBEDDING_MODEL,
            content=text,
            task_type="retrieval_document",
        )
        return result["embedding"]
    except Exception as e:
        logger.warning("Gemini embedding API quota/call failed (%s). Generating fallback vector.", e)
        h = hashlib.sha256(text.encode("utf-8")).digest()
        vec = []
        for i in range(3072):
            val = (h[i % len(h)] / 255.0) * 2 - 1
            vec.append(val)
        return vec


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    va = np.array(a)
    vb = np.array(b)
    norm = np.linalg.norm(va) * np.linalg.norm(vb)
    if norm == 0:
        return 0.0
    return float(np.dot(va, vb) / norm)


