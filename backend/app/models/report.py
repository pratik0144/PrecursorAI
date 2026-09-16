import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import text, TIMESTAMP, ForeignKey, Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        Index("ix_reports_org_id", "org_id"),
        Index("ix_reports_created_at_desc", text("created_at DESC")),
        Index("ix_reports_status", "status"),
        Index("ix_reports_report_type", "report_type"),
        Index("ix_reports_asset_uuid", "asset_uuid"),
        Index("ix_reports_location_id", "location_id"),
        Index("ix_reports_status_review", "status", postgresql_where=text("status = 'REVIEW'")),
        {"comment": "Safety reports submitted by personnel."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    report_text: Mapped[str] = mapped_column()
    cleaned_text: Mapped[Optional[str]] = mapped_column()
    report_type: Mapped[str] = mapped_column() # maps to report_type ENUM
    
    # Legacy location and asset tracking
    location: Mapped[Optional[str]] = mapped_column(String)
    asset_id: Mapped[Optional[str]] = mapped_column(String)

    # New relational tracking
    location_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("locations.id", ondelete="SET NULL"))
    asset_uuid: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"))

    reporter_name: Mapped[Optional[str]] = mapped_column()
    reporter_role: Mapped[Optional[str]] = mapped_column()
    is_synthetic: Mapped[bool] = mapped_column(server_default=text("false"))
    source: Mapped[Optional[str]] = mapped_column() # manual/batch/api

    status: Mapped[str] = mapped_column(server_default=text("'PENDING'")) # maps to report_status ENUM
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    analysis: Mapped[Optional["ReportAnalysis"]] = relationship("ReportAnalysis", back_populates="report", uselist=False)
    embedding: Mapped[Optional["ReportEmbedding"]] = relationship("ReportEmbedding", back_populates="report", uselist=False)
