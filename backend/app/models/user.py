import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import CITEXT

from app.core.database import Base


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        {"comment": "User accounts with RBAC roles and tenant association."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    org_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column()
    email: Mapped[str] = mapped_column(unique=True)
    role: Mapped[str] = mapped_column(server_default=text("'USER'")) # Maps to user_role ENUM
    password_hash: Mapped[str] = mapped_column()
    is_active: Mapped[bool] = mapped_column(server_default=text("true"))
    last_login_at: Mapped[Optional[datetime]] = mapped_column(TIMESTAMP(timezone=True))
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))

    organization: Mapped["Organization"] = relationship(back_populates="users")
