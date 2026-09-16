"""
schemas/analysis.py — Tier 1 analysis Pydantic schema (full structured output)
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field

class ExtractionPassA(BaseModel):
    """Pass A: Fast structural extraction (cheap & deterministic)."""
    hazard: str
    energy_sources: List[str] = Field(default_factory=list)
    activity: str
    person_in_danger_zone: bool
    barriers: List[str] = Field(default_factory=list)
    barrier_statuses: List[str] = Field(default_factory=list)
    candidate_iogp_rules: List[str] = Field(default_factory=list)
    candidate_oisd_hipo: bool = False
    severity_estimate: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]

class ExtractionPassB(BaseModel):
    """Pass B: Gated reasoning for SIF precursors."""
    sif_potential_reasoning: str
    rationale: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    requires_followup: bool = False
    followup_question: Optional[str] = None

class GeminiAnalysisOutput(BaseModel):
    pass_a: ExtractionPassA
    pass_b: Optional[ExtractionPassB] = None

class AnalysisResponse(BaseModel):
    """Full analysis as returned by the API."""
    id: uuid.UUID
    report_id: uuid.UUID
    sif_potential: Optional[bool]
    confidence: Optional[float]
    risk_score: Optional[int]
    risk_level: Optional[str]
    activity: Optional[str]
    hazard: Optional[str]
    energy_source: Optional[str]
    barrier: Optional[str]
    barrier_status: Optional[str]
    iogp_rule: Optional[str]
    severity: Optional[str]
    rationale: Optional[str]
    requires_followup: Optional[bool]
    followup_question: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
