"""
services/dashboard_service.py — Dashboard metrics aggregation.
"""
from datetime import datetime, timedelta
from typing import Dict, Any

from sqlalchemy import func, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.analysis import ReportAnalysis
from app.models.report import Report
from app.schemas.dashboard import DashboardSummary, RiskBreakdown


async def get_summary(db: AsyncSession) -> DashboardSummary:
    """Compute aggregated metrics for the main dashboard."""
    
    # 1. Basic counts
    total_reports = await db.scalar(select(func.count()).select_from(Report)) or 0
    
    # Time-based counts
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    
    reports_today = await db.scalar(
        select(func.count()).select_from(Report).where(Report.created_at >= today_start)
    ) or 0
    
    reports_7d = await db.scalar(
        select(func.count()).select_from(Report).where(Report.created_at >= week_ago)
    ) or 0

    # 2. SIF Potential (from analysis)
    sif_count = await db.scalar(
        select(func.count()).select_from(ReportAnalysis).where(ReportAnalysis.sif_potential == True)
    ) or 0

    # 3. Alerts
    active_alerts = await db.scalar(
        select(func.count()).select_from(Alert)
    ) or 0
    
    unread_alerts = await db.scalar(
        select(func.count()).select_from(Alert).where(Alert.is_read == False)
    ) or 0

    # 4. Risk Breakdown
    risk_stats = await db.execute(
        select(ReportAnalysis.risk_level, func.count(ReportAnalysis.id))
        .group_by(ReportAnalysis.risk_level)
    )
    risk_dict = {row[0]: row[1] for row in risk_stats.all() if row[0]}
    
    breakdown = RiskBreakdown(
        routine=risk_dict.get("ROUTINE", 0),
        review=risk_dict.get("REVIEW", 0),
        high=risk_dict.get("HIGH", 0),
        sif=risk_dict.get("SIF", 0)
    )

    # 5. Top Assets (from raw reports)
    asset_stats = await db.execute(
        select(Report.asset_id, func.count(Report.id))
        .where(Report.asset_id.is_not(None))
        .group_by(Report.asset_id)
        .order_by(func.count(Report.id).desc())
        .limit(5)
    )
    top_assets = [{"asset": row[0], "count": row[1]} for row in asset_stats.all()]

    # 6. Top Hazards (from analysis)
    hazard_stats = await db.execute(
        select(ReportAnalysis.hazard, func.count(ReportAnalysis.id))
        .where(ReportAnalysis.hazard.is_not(None))
        .group_by(ReportAnalysis.hazard)
        .order_by(func.count(ReportAnalysis.id).desc())
        .limit(5)
    )
    top_hazards = [{"hazard": row[0], "count": row[1]} for row in hazard_stats.all()]

    return DashboardSummary(
        total_reports=total_reports,
        reports_today=reports_today,
        reports_7d=reports_7d,
        sif_potential_count=sif_count,
        active_alerts=active_alerts,
        unread_alerts=unread_alerts,
        active_patterns=0,  # Tier 2 placeholder
        risk_breakdown=breakdown,
        top_assets_by_reports=top_assets,
        top_hazards=top_hazards
    )
