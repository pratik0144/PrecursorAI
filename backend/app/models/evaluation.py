import uuid
from datetime import datetime
from typing import Optional, Any

from sqlalchemy import text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import JSONB

from app.core.database import Base


class EvalExample(Base):
    __tablename__ = "eval_examples"
    __table_args__ = (
        {"comment": "Gold standard examples for evaluating model performance."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    narrative: Mapped[str] = mapped_column()
    source: Mapped[str] = mapped_column() # SYNTHETIC | OSHA
    
    # Gold labels
    gold_sif_classification: Mapped[str] = mapped_column()
    gold_iogp_rule_id: Mapped[Optional[uuid.UUID]] = mapped_column()
    gold_high_energy: Mapped[bool] = mapped_column()
    gold_barrier_status: Mapped[Optional[str]] = mapped_column()
    
    notes: Mapped[Optional[str]] = mapped_column()
    is_synthetic: Mapped[bool] = mapped_column(server_default=text("false"))


class EvalRun(Base):
    __tablename__ = "eval_runs"
    __table_args__ = (
        {"comment": "Evaluation run metrics against rulesets."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    ruleset_version_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("ruleset_versions.id", ondelete="CASCADE"))
    model: Mapped[str] = mapped_column()
    
    precision: Mapped[Optional[float]] = mapped_column()
    recall: Mapped[Optional[float]] = mapped_column()
    f2: Mapped[Optional[float]] = mapped_column()
    confusion: Mapped[Optional[dict[str, Any]]] = mapped_column(JSONB)
    review_burden_estimate: Mapped[Optional[float]] = mapped_column()
    
    created_at: Mapped[datetime] = mapped_column(TIMESTAMP(timezone=True), server_default=text("now()"))


class EvalResult(Base):
    __tablename__ = "eval_results"
    __table_args__ = (
        {"comment": "Individual prediction results for an eval run."},
    )

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    eval_run_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("eval_runs.id", ondelete="CASCADE"))
    eval_example_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("eval_examples.id", ondelete="CASCADE"))
    predicted_json: Mapped[dict[str, Any]] = mapped_column(JSONB)
    correct: Mapped[bool] = mapped_column()
