import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import text, TIMESTAMP, ForeignKey, Index, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"
    __table_args__ = (
        Index("ix_alerts_status", "status"),
        Index("ix_alerts_assignee_id", "assignee_id"),
        Index("ix_alerts_created_at_desc", text("created_at DESC")),
        Index("ix_alerts_severity", "severity"),
        CheckConstraint(
            "(report_id IS NOT NULL AND pattern_id IS NULL AND source = 'REPORT') OR "
            "(report_id IS NULL AND pattern_id IS NOT NULL AND source = 'PATTERN')",
            name="chk_alert_source_consistency"
        ),
        {"comment": "Alerts triggered by reports or patterns."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    report_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    pattern_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("patterns.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column()
    message: Mapped[str] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    # Lifecycle and Routing
    status: Mapped[str] = mapped_column() # maps to alert_status ENUM
    severity: Mapped[str] = mapped_column() # maps to severity ENUM
    source: Mapped[str] = mapped_column() # maps to alert_source ENUM
    assignee_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    
    sla_due_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True))
    acknowledged_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True))
    escalated_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True))
    closed_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True))

    # Legacy is_read removed or not needed, mapped to status now


class AlertEvent(Base):
    __tablename__ = "alert_events"
    __table_args__ = (
        {"comment": "Audit trail of alert lifecycle changes."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    alert_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("alerts.id", ondelete="CASCADE"))
    from_status: Mapped[Optional[str]] = mapped_column()
    to_status: Mapped[str] = mapped_column()
    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    note: Mapped[Optional[str]] = mapped_column()
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))
