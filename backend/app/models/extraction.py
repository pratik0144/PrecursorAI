import uuid
from datetime import datetime
from typing import Optional, Any

from sqlalchemy import text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB, ARRAY, UUID

from app.core.database import Base


class ReportExtraction(Base):
    __tablename__ = "report_extractions"
    __table_args__ = (
        {"comment": "Raw LLM extraction passes for auditability."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), unique=True)
    pass_a_json: Mapped[dict[str, Any]] = mapped_column(JSONB)
    pass_b_json: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    rag_chunk_ids: Mapped[Optional[list[uuid.UUID]]] = mapped_column(ARRAY(UUID))
    llm_invocation_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("llm_invocations.id", ondelete="SET NULL"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))
