import uuid
from datetime import datetime
from typing import Optional, Any

from sqlalchemy import text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class RulesetVersion(Base):
    __tablename__ = "ruleset_versions"
    __table_args__ = (
        {"comment": "Versioning for classification thresholds, weights, and mappings to ensure determinism."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    version: Mapped[str] = mapped_column(unique=True)
    weights: Mapped[dict[str, Any]] = mapped_column(JSONB)
    thresholds: Mapped[dict[str, Any]] = mapped_column(JSONB)
    classification_map: Mapped[dict[str, Any]] = mapped_column(JSONB)
    is_active: Mapped[bool] = mapped_column(server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))
    created_by: Mapped[Optional[uuid.UUID]] = mapped_column()
