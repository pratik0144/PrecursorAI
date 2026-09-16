import uuid
from datetime import datetime
from typing import Optional, Any

from sqlalchemy import text, TIMESTAMP, ForeignKey, CheckConstraint, PrimaryKeyConstraint, Index, String
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB
from pgvector.sqlalchemy import Vector

from app.core.database import Base


class Pattern(Base):
    __tablename__ = "patterns"
    __table_args__ = (
        Index("ix_patterns_pattern_type", "pattern_type"),
        Index("ix_patterns_priority", "priority"),
        Index("ix_patterns_last_seen_desc", text("last_seen DESC")),
        Index("ix_patterns_asset_uuid", "asset_uuid"),
        Index("ix_patterns_location_id", "location_id"),
        CheckConstraint("confidence >= 0 AND confidence <= 1", name="chk_pattern_confidence_range"),
        {"comment": "Discovered safety patterns."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    title: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    hazard: Mapped[str] = mapped_column()
    barrier: Mapped[Optional[str]] = mapped_column()
    confidence: Mapped[float] = mapped_column()
    report_count: Mapped[int] = mapped_column()
    first_seen: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True))
    last_seen: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True))
    status: Mapped[str] = mapped_column()
    evidence: Mapped[dict[str, Any]] = mapped_column(JSONB)

    # Replaced and New
    pattern_type: Mapped[str] = mapped_column() # maps to pattern_type ENUM
    priority: Mapped[str] = mapped_column() # maps to pattern_priority ENUM
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    location_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"))
    asset_uuid: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"))
    shared_energy_type: Mapped[Optional[str]] = mapped_column() # maps to energy_type ENUM
    ruleset_version_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("ruleset_versions.id", ondelete="RESTRICT"))
    centroid: Mapped[Optional[Any]] = mapped_column(Vector(1536))

    # Legacy back-compat
    asset_id: Mapped[Optional[str]] = mapped_column(String)
    location: Mapped[Optional[str]] = mapped_column(String)


class PatternReport(Base):
    __tablename__ = "pattern_reports"
    __table_args__ = (
        PrimaryKeyConstraint("pattern_id", "report_id"),
        CheckConstraint("similarity_score >= 0 AND similarity_score <= 1", name="chk_similarity_score_range"),
        {"comment": "Traceability link between patterns and individual reports."},
    )

    pattern_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("patterns.id", ondelete="CASCADE"))
    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    similarity_score: Mapped[float] = mapped_column()


class SweepRun(Base):
    __tablename__ = "sweep_runs"
    __table_args__ = (
        {"comment": "Audit log for Tier-2 pattern sweeps."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    params: Mapped[dict[str, Any]] = mapped_column(JSONB)
    ruleset_version_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ruleset_versions.id", ondelete="RESTRICT"))
    candidates: Mapped[int] = mapped_column()
    clusters_found: Mapped[int] = mapped_column()
    patterns_created: Mapped[int] = mapped_column()
    started_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True))
    finished_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True))
    status: Mapped[str] = mapped_column()
    triggered_by: Mapped[Optional[uuid.UUID]] = mapped_column()
