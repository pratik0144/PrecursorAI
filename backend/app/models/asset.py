import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import text, TIMESTAMP, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = (
        Index("ix_assets_location_id", "location_id"),
        Index("ix_assets_asset_type", "asset_type"),
        Index("ix_assets_org_id", "org_id"),
        {"comment": "Assets associated with sites."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    location_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("locations.id", ondelete="CASCADE"))
    asset_type: Mapped[str] = mapped_column() # maps to asset_type ENUM
    name: Mapped[str] = mapped_column()
    code: Mapped[Optional[str]] = mapped_column()
    latitude: Mapped[Optional[float]] = mapped_column()
    longitude: Mapped[Optional[float]] = mapped_column()
    status: Mapped[Optional[str]] = mapped_column()
    metadata_json: Mapped[Optional[dict]] = mapped_column("metadata", JSONB)
    is_synthetic: Mapped[bool] = mapped_column(server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    location: Mapped["Location"] = relationship()
