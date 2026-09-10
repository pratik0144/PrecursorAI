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

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings


async def retrieve_relevant_chunks(
    report_embedding: List[float],
    db: AsyncSession,
    top_k: int = None,
) -> List[dict]:
    """
    Query knowledge_embeddings by cosine similarity and return top-K chunks.
    Uses pgvector's <=> (cosine distance) operator.
    Returns list of dicts: {chunk_id, title, chunk_text, source, similarity}
    """
    top_k = top_k or settings.RAG_TOP_K

    # Cast the Python list to a pgvector literal
    embedding_str = "[" + ",".join(str(x) for x in report_embedding) + "]"

    sql = text("""
        SELECT
            kc.chunk_id,
            kc.title,
            kc.chunk_text,
            kc.source,
            1 - (ke.embedding <=> CAST(:embedding AS vector)) AS similarity
        FROM knowledge_embeddings ke
        JOIN knowledge_chunks kc ON kc.chunk_id = ke.chunk_id
        ORDER BY ke.embedding <=> CAST(:embedding AS vector)
        LIMIT :top_k
    """)

    result = await db.execute(sql, {"embedding": embedding_str, "top_k": top_k})
    rows = result.fetchall()

    return [
        {
            "chunk_id": row.chunk_id,
            "title": row.title,
            "chunk_text": row.chunk_text,
            "source": row.source,
            "similarity": round(float(row.similarity), 4),
        }
        for row in rows
    ]

