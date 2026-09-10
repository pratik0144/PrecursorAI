"""
models/embedding.py — ReportEmbedding ORM model
"""
import uuid

from sqlalchemy import Column, DateTime, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base

EMBEDDING_DIM = 3072  # gemini-embedding-001 output dimension


class ReportEmbedding(Base):
    __tablename__ = "report_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id"), nullable=False, unique=True)
    embedding = Column(Vector(EMBEDDING_DIM), nullable=False)
    model = Column(String(100), nullable=False, default="gemini-embedding-001")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="embedding")
