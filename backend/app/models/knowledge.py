import uuid
from typing import Optional, Any

from sqlalchemy import text, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"
    __table_args__ = (
        {"comment": "RAG knowledge base chunks."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    chunk_id: Mapped[str] = mapped_column()
    title: Mapped[str] = mapped_column()
    chunk_text: Mapped[str] = mapped_column()
    source: Mapped[str] = mapped_column()
    
    # New fields
    framework: Mapped[Optional[str]] = mapped_column()
    section: Mapped[Optional[str]] = mapped_column()
    token_count: Mapped[Optional[int]] = mapped_column()


class KnowledgeEmbedding(Base):
    __tablename__ = "knowledge_embeddings"
    __table_args__ = (
        Index(
            "ix_knowledge_embeddings_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        {"comment": "Vector embeddings for knowledge chunks."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    chunk_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("knowledge_chunks.id", ondelete="CASCADE"))
    embedding: Mapped[Optional[Any]] = mapped_column(Vector(1536))
    model: Mapped[str] = mapped_column()
    dimension: Mapped[Optional[int]] = mapped_column()
