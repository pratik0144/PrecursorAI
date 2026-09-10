"""
models/knowledge.py — KnowledgeChunk and KnowledgeEmbedding ORM models
"""
import uuid

from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base

EMBEDDING_DIM = 768


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chunk_id = Column(String(255), unique=True, nullable=False, index=True)
    title = Column(String(500), nullable=False)
    chunk_text = Column(Text, nullable=False)
    source = Column(String(500), nullable=False)  # e.g. "IOGP Life-Saving Rules v4"

    embedding = relationship("KnowledgeEmbedding", back_populates="chunk", uselist=False)


class KnowledgeEmbedding(Base):
    __tablename__ = "knowledge_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chunk_id = Column(String(255), nullable=False, index=True)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=False)
    model = Column(String(100), nullable=False, default="text-embedding-004")

    chunk = relationship("KnowledgeChunk", back_populates="embedding", foreign_keys=[chunk_id],
                         primaryjoin="KnowledgeChunk.chunk_id == KnowledgeEmbedding.chunk_id")
