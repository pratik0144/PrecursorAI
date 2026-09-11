"""
schemas/pattern.py — Pydantic schemas for Tier 2 patterns
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


# ── Gemini output schema (Tier 2 multi-report reasoning) ──────────────────────

class GeminiPatternOutput(BaseModel):
    """
    Schema for Gemini's JSON output when analysing a cluster of grouped reports.
    Gemini reasons about the pattern; the rules engine cross-checks priority
    against deterministic thresholds before final persistence (Phase E).
    """
    pattern_type: Literal["RECURRING", "EMERGING", "COMPOUNDING", "SYSTEMIC"]
    hazard: str
    ai_priority: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"] = Field(
        alias="priority",
        description="AI-suggested priority — cross-checked against count threshold before use.",
    )
    conclusion: str = Field(
        description="Plain-English explanation of the recurring or compounding pattern."
    )
    evidence: List[str] = Field(
        default_factory=list,
        description="Specific supporting facts extracted from the reports.",
    )
    confidence: float = Field(..., ge=0.0, le=1.0)

    model_config = {"populate_by_name": True}


class PatternListItem(BaseModel):
    id: uuid.UUID
    pattern_type: str
    title: str
    asset_id: Optional[str]
    location: Optional[str]
    hazard: Optional[str]
    priority: str
    confidence: Optional[float]
    report_count: int
    first_seen: Optional[datetime]
    last_seen: Optional[datetime]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ContributingReport(BaseModel):
    report_id: uuid.UUID
    similarity_score: Optional[float]

    model_config = {"from_attributes": True}


class PatternDetail(PatternListItem):
    description: str
    barrier: Optional[str]
    evidence: Optional[List[Any]]
    contributing_reports: List[ContributingReport] = []


# ── Sweep response ────────────────────────────────────────────────────────────

class SweepResult(BaseModel):
    """Response returned by POST /patterns/sweep."""
    candidates_found: int
    clusters_analysed: int
    patterns_saved: int
    pattern_ids: List[uuid.UUID] = Field(default_factory=list)
    message: str
