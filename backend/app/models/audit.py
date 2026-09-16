import uuid
from datetime import datetime
from typing import Optional, Any

from sqlalchemy import text, TIMESTAMP, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_entity_desc", "entity_type", "entity_id", text("created_at DESC")),
        {"comment": "Append-only audit trail for compliance and RLS verification."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    actor_role: Mapped[Optional[str]] = mapped_column()
    action: Mapped[str] = mapped_column()
    entity_type: Mapped[str] = mapped_column()
    entity_id: Mapped[str] = mapped_column()
    before: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    after: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    ruleset_version_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    request_id: Mapped[Optional[str]] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))


class LLMInvocation(Base):
    __tablename__ = "llm_invocations"
    __table_args__ = (
        Index("ix_llm_invocations_report_id", "report_id"),
        Index("ix_llm_invocations_created_at_desc", text("created_at DESC")),
        {"comment": "Append-only log of AI calls for cost and performance tracking."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    report_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("reports.id", ondelete="SET NULL"))
    provider: Mapped[str] = mapped_column()
    model: Mapped[str] = mapped_column()
    purpose: Mapped[str] = mapped_column() # EXTRACT_A, EXTRACT_B, PATTERN, EMBED
    prompt_hash: Mapped[Optional[str]] = mapped_column()
    prompt_tokens: Mapped[Optional[int]] = mapped_column()
    completion_tokens: Mapped[Optional[int]] = mapped_column()
    latency_ms: Mapped[Optional[int]] = mapped_column()
    cost_estimate: Mapped[Optional[float]] = mapped_column()
    status: Mapped[str] = mapped_column()
    fallback_used: Mapped[bool] = mapped_column(server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))
