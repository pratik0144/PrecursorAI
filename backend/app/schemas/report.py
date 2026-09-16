"""
schemas/report.py — Pydantic request/response schemas for reports
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, Field
from app.schemas.analysis import ExtractionPassA, ExtractionPassB

# ── Request ──────────────────────────────────────────────────────────────────

class ReportCreate(BaseModel):
    report_type: Literal["UNSAFE_ACT", "UNSAFE_CONDITION", "NEAR_MISS"]
    report_text: str = Field(..., min_length=10)
    location: Optional[str] = None
    asset_id: Optional[str] = None


# ── Nested analysis summary (used in submit response) ─────────────────────

class AnalysisSummary(BaseModel):
    sif_potential: Optional[bool] = None
    risk_level: Optional[str] = None
    risk_score: Optional[int] = None
    iogp_rule: Optional[str] = None


class ClassificationResult(BaseModel):
    high_energy_present: bool
    person_in_danger_zone: bool
    barrier_compromised: bool
    sif_classification: str
    risk_score: int
    escalation_level: str
    ruleset_version_id: Optional[uuid.UUID]


class ReportAnalysisDetail(BaseModel):
    id: Optional[uuid.UUID] = None
    sif_potential: Optional[bool] = None
    confidence: Optional[float] = None
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None
    activity: Optional[str] = None
    hazard: Optional[str] = None
    energy_source: Optional[str] = None
    barrier: Optional[str] = None
    barrier_status: Optional[str] = None
    iogp_rule: Optional[str] = None
    severity: Optional[str] = None
    rationale: Optional[str] = None
    requires_followup: Optional[bool] = None
    followup_question: Optional[str] = None
    pass_a: Optional[ExtractionPassA] = None
    pass_b: Optional[ExtractionPassB] = None
    classification: Optional[ClassificationResult] = None

    model_config = {"from_attributes": True}


# ── Responses ────────────────────────────────────────────────────────────────

class ReportSubmitResponse(BaseModel):
    report_id: uuid.UUID
    status: str
    analysis: Optional[AnalysisSummary] = None


class ReportListItem(BaseModel):
    id: uuid.UUID
    report_type: str
    asset_id: Optional[str]
    location: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ReportDetailResponse(ReportListItem):
    report_text: str
    analysis: Optional[ReportAnalysisDetail] = None
    rag_evidence_chunk_ids: List[str] = Field(default_factory=list)
