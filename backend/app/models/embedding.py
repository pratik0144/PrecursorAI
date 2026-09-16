import uuid
from typing import Optional, Any

from sqlalchemy import text, ForeignKey, UniqueConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class ReportEmbedding(Base):
    __tablename__ = "report_embeddings"
    __table_args__ = (
        UniqueConstraint("report_id", "model", name="uq_report_embeddings_report_model"),
        Index(
            "ix_report_embeddings_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
        {"comment": "Vector embeddings for reports."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    embedding: Mapped[Optional[Any]] = mapped_column(Vector(1536))
    model: Mapped[str] = mapped_column()
    dimension: Mapped[Optional[int]] = mapped_column()
    embedding_status: Mapped[Optional[str]] = mapped_column() # maps to embedding_status ENUM

    report: Mapped["Report"] = relationship("Report", back_populates="embedding")
