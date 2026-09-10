"""
ai/rag.py — Retrieval-Augmented Generation: fetch top-K knowledge chunks.

Flow:
  1. Receive report embedding
  2. Cosine similarity against knowledge_embeddings (pgvector <=> operator)
  3. Return top K knowledge chunks
  4. Chunks are injected into the Gemini prompt in classifier.py

PostgreSQL + pgvector is the ONLY vector store. No separate vector database.
"""
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings

# TODO: import KnowledgeChunk model and pgvector query


async def retrieve_relevant_chunks(
    report_embedding: List[float],
    db: AsyncSession,
    top_k: int = None,
) -> List[dict]:
    """
    Query knowledge_embeddings by cosine similarity and return top-K chunks.
    Uses pgvector's <=> (cosine distance) operator.
    """
    top_k = top_k or settings.RAG_TOP_K
    # TODO: implement pgvector similarity query
    raise NotImplementedError
