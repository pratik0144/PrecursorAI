
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.ai.embeddings import generate_embeddings

logger = structlog.get_logger(__name__)

async def search_similar(session: AsyncSession, query: str, limit: int = 5):
    query_embedding = await generate_embeddings(query)
    # Use pgvector cosine with ANN (HNSW) index
    sql = text('''
        SELECT id, chunk_text, 1 - (embedding <=> :embedding::vector) AS similarity
        FROM document_chunks
        WHERE embedding_status NOT IN ('DEGRADED', 'PENDING')
        ORDER BY embedding <=> :embedding::vector
        LIMIT :limit
    ''')
    result = await session.execute(sql, {"embedding": str(query_embedding), "limit": limit})
    return [{"id": row.id, "text": row.chunk_text, "similarity": row.similarity} for row in result]
