import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import text, TIMESTAMP, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        Index("ix_locations_parent_id", "parent_id"),
        Index("ix_locations_level", "level"),
        Index("ix_locations_lat_lon", "latitude", "longitude"),
        {"comment": "Self-referential hierarchy for locations globally."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("locations.id", ondelete="CASCADE"))
    level: Mapped[str] = mapped_column() # maps to location_level ENUM
    name: Mapped[str] = mapped_column()
    code: Mapped[Optional[str]] = mapped_column()
    latitude: Mapped[Optional[float]] = mapped_column()
    longitude: Mapped[Optional[float]] = mapped_column()
    bbox: Mapped[Optional[dict]] = mapped_column(JSONB)
    is_synthetic: Mapped[bool] = mapped_column(server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    parent: Mapped[Optional["Location"]] = relationship("Location", remote_side=[id], back_populates="children")
    children: Mapped[list["Location"]] = relationship("Location", back_populates="parent")
