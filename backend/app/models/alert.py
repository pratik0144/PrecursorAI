"""
models/alert.py — Alert ORM model
"""
import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id"), nullable=True)
    pattern_id = Column(UUID(as_uuid=True), ForeignKey("patterns.id"), nullable=True)
    alert_type = Column(String(50), nullable=False)  # SIF | PATTERN | REVIEW_REQUIRED
    severity = Column(String(20), nullable=False)  # LOW | MEDIUM | HIGH | CRITICAL
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    report = relationship("Report", back_populates="alerts")
    pattern = relationship("Pattern", back_populates="alerts")
