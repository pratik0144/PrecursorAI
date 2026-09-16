import uuid
from typing import Optional

from sqlalchemy import text, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class ReportAnalysis(Base):
    __tablename__ = "report_analysis"
    __table_args__ = (
        Index("ix_report_analysis_escalation_level", "escalation_level"),
        Index("ix_report_analysis_sif_classification", "sif_classification"),
        Index("ix_report_analysis_risk_score", "risk_score"),
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="chk_risk_score_range"),
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="chk_confidence_range"),
        {"comment": "Analysis and SIF classification for reports."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"), unique=True)
    
    # Core deterministic booleans
    high_energy_present: Mapped[Optional[bool]] = mapped_column()
    person_in_danger_zone: Mapped[Optional[bool]] = mapped_column()
    barrier_compromised: Mapped[Optional[bool]] = mapped_column()
    
    sif_classification: Mapped[Optional[str]] = mapped_column() # maps to sif_classification ENUM
    escalation_level: Mapped[Optional[str]] = mapped_column() # maps to escalation_level ENUM
    ruleset_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("ruleset_versions.id", ondelete="RESTRICT"))

    confidence: Mapped[float] = mapped_column()
    risk_score: Mapped[float] = mapped_column()
    severity: Mapped[str] = mapped_column()
    rationale: Mapped[Optional[str]] = mapped_column()
    requires_followup: Mapped[bool] = mapped_column(server_default=text("false"))
    followup_question: Mapped[Optional[str]] = mapped_column()

    # Legacy back-compat single-value columns
    energy_source: Mapped[Optional[str]] = mapped_column()
    barrier: Mapped[Optional[str]] = mapped_column()
    barrier_status: Mapped[Optional[str]] = mapped_column()
    iogp_rule: Mapped[Optional[str]] = mapped_column()

    report: Mapped["Report"] = relationship("Report", back_populates="analysis")
