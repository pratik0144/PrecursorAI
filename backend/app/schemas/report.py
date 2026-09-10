"""
schemas/report.py — Pydantic request/response schemas for reports
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


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


class ReportDetail(ReportListItem):
    report_text: str
