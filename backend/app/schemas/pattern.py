"""
schemas/pattern.py — Pydantic schemas for Tier 2 patterns
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


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
    report_type: str
    asset_id: Optional[str]
    location: Optional[str]
    created_at: datetime


class PatternDetail(PatternListItem):
    description: str
    barrier: Optional[str]
    evidence: Optional[Dict[str, Any]]
    contributing_reports: List[ContributingReport] = []
