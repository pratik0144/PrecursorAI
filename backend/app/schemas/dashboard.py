"""
schemas/dashboard.py — Dashboard summary response schema
"""
from __future__ import annotations

from typing import Dict, List

from pydantic import BaseModel


class RiskBreakdown(BaseModel):
    routine: int = 0
    review: int = 0
    high: int = 0
    sif: int = 0


class DashboardSummary(BaseModel):
    total_reports: int
    reports_today: int
    reports_7d: int
    sif_potential_count: int
    active_alerts: int
    unread_alerts: int
    active_patterns: int
    risk_breakdown: RiskBreakdown
    top_assets_by_reports: List[Dict] = []
    top_hazards: List[Dict] = []
