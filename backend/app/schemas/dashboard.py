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

class SIFFunnel(BaseModel):
    all_reports: int = 0
    high_energy: int = 0
    sif_potential: int = 0
    escalated: int = 0

class DashboardSummary(BaseModel):
    total_reports: int
    reports_today: int
    reports_7d: int
    sif_potential_count: int
    active_alerts: int
    unread_alerts: int
    active_patterns: int
    risk_breakdown: RiskBreakdown
    sif_funnel: SIFFunnel
    top_assets_by_reports: List[Dict] = []
    top_hazards: List[Dict] = []
    energy_distributions: List[Dict] = []
    barrier_distributions: List[Dict] = []
    geo_aggregates: List[Dict] = []
