import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import text, TIMESTAMP
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Organization(Base):
    __tablename__ = "organizations"
    __table_args__ = (
        {"comment": "Tenants in the multi-tenant system."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    name: Mapped[str] = mapped_column()
    slug: Mapped[str] = mapped_column(unique=True)
    is_demo: Mapped[bool] = mapped_column(server_default=text("false"))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    users: Mapped[list["User"]] = relationship(back_populates="organization")
