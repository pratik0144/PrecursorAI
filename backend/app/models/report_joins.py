import uuid
from typing import Optional

from sqlalchemy import text, ForeignKey, PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class ReportEnergySource(Base):
    __tablename__ = "report_energy_sources"
    __table_args__ = (
        PrimaryKeyConstraint("report_id", "energy_source_id"),
        {"comment": "Join table for reports and energy sources."},
    )

    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    energy_source_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("energy_sources.id", ondelete="RESTRICT"))
    magnitude: Mapped[Optional[str]] = mapped_column()
    is_high_energy: Mapped[Optional[bool]] = mapped_column()


class ReportBarrier(Base):
    __tablename__ = "report_barriers"
    __table_args__ = (
        PrimaryKeyConstraint("report_id", "barrier_id"),
        {"comment": "Join table for reports and barriers."},
    )

    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    barrier_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("barriers.id", ondelete="RESTRICT"))
    status: Mapped[str] = mapped_column() # maps to barrier_status ENUM


class ReportIOGPRule(Base):
    __tablename__ = "report_iogp_rules"
    __table_args__ = (
        PrimaryKeyConstraint("report_id", "iogp_rule_id"),
        {"comment": "Join table for reports and IOGP rules."},
    )

    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    iogp_rule_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("iogp_rules.id", ondelete="RESTRICT"))


class ReportOISDReference(Base):
    __tablename__ = "report_oisd_references"
    __table_args__ = (
        PrimaryKeyConstraint("report_id", "oisd_reference_id"),
        {"comment": "Join table for reports and OISD references."},
    )

    report_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("reports.id", ondelete="CASCADE"))
    oisd_reference_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("oisd_references.id", ondelete="RESTRICT"))
    is_hipo: Mapped[bool] = mapped_column(server_default=text("false"))
