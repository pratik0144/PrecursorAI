"""
ai/embeddings.py — Generate vector embeddings using Gemini text-embedding-004.

Used for:
  - Tier 1: embed incoming report → RAG retrieval
  - Scripts: generate knowledge chunk embeddings (ingest_knowledge.py)
"""
from typing import List

import numpy as np

# TODO: import and configure genai from ai/gemini.py

EMBEDDING_DIM = 768


async def embed_text(text: str) -> List[float]:
    """Generate an embedding vector for a single text string."""
    # TODO: call genai.embed_content(model="text-embedding-004", content=text)
    raise NotImplementedError


def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Compute cosine similarity between two embedding vectors."""
    va = np.array(a)
    vb = np.array(b)
    norm = np.linalg.norm(va) * np.linalg.norm(vb)
    if norm == 0:
        return 0.0
    return float(np.dot(va, vb) / norm)
