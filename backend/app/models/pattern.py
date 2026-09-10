"""
models/pattern.py — Pattern and PatternReport ORM models
"""
import uuid

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Pattern(Base):
    __tablename__ = "patterns"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pattern_type = Column(String(100), nullable=False)  # RECURRING | EMERGING | TREND
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    asset_id = Column(String(100), nullable=True)
    location = Column(String(255), nullable=True)
    hazard = Column(String(255), nullable=True)
    barrier = Column(String(255), nullable=True)
    priority = Column(String(20), nullable=False, default="MEDIUM")  # LOW | MEDIUM | HIGH | CRITICAL
    confidence = Column(Float, nullable=True)
    report_count = Column(Integer, nullable=False, default=0)
    first_seen = Column(DateTime(timezone=True), nullable=True)
    last_seen = Column(DateTime(timezone=True), nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")  # ACTIVE | RESOLVED | DISMISSED
    evidence = Column(JSON, nullable=True)  # Gemini-provided evidence snippets
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report_links = relationship("PatternReport", back_populates="pattern")
    alerts = relationship("Alert", back_populates="pattern")


class PatternReport(Base):
    """Join table enabling traceability: which reports contributed to a pattern."""
    __tablename__ = "pattern_reports"

    pattern_id = Column(UUID(as_uuid=True), ForeignKey("patterns.id"), primary_key=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id"), primary_key=True)
    similarity_score = Column(Float, nullable=True)

    pattern = relationship("Pattern", back_populates="report_links")
    report = relationship("Report", back_populates="pattern_links")
