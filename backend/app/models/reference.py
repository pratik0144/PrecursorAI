import uuid
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class IOGPRule(Base):
    __tablename__ = "iogp_rules"
    __table_args__ = ({"comment": "IOGP Life-Saving Rules reference."},)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    code: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    icon: Mapped[Optional[str]] = mapped_column()


class OISDReference(Base):
    __tablename__ = "oisd_references"
    __table_args__ = ({"comment": "OISD standard references and concepts."},)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    standard_no: Mapped[str] = mapped_column(unique=True)
    title: Mapped[str] = mapped_column()
    summary: Mapped[str] = mapped_column()
    concept_tag: Mapped[Optional[str]] = mapped_column()
    url: Mapped[Optional[str]] = mapped_column()
    verified: Mapped[bool] = mapped_column(server_default=text("false"))


class EnergySource(Base):
    __tablename__ = "energy_sources"
    __table_args__ = ({"comment": "Energy source taxonomy."},)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    code: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column()
    energy_type: Mapped[str] = mapped_column() # maps to energy_type ENUM
    typical_context: Mapped[Optional[str]] = mapped_column()
    is_high_energy: Mapped[bool] = mapped_column(server_default=text("false"))
    threshold_joules: Mapped[Optional[float]] = mapped_column()


class Barrier(Base):
    __tablename__ = "barriers"
    __table_args__ = ({"comment": "Barrier and control catalog."},)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    code: Mapped[str] = mapped_column(unique=True)
    name: Mapped[str] = mapped_column()
    description: Mapped[str] = mapped_column()
    is_direct_control: Mapped[bool] = mapped_column(server_default=text("false"))
    related_energy_type: Mapped[Optional[str]] = mapped_column() # maps to energy_type ENUM
