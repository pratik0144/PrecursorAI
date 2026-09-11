"""
services/alert_service.py — Create and manage alerts for Tier 1 SIF events and Tier 2 patterns.
"""
import uuid
from typing import List

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.alert import Alert
from app.models.analysis import ReportAnalysis
from app.models.report import Report
from app.schemas.alert import AlertResponse


async def create_sif_alert(report: Report, analysis: ReportAnalysis, db: AsyncSession):
    """Create an alert for a high-risk Tier 1 report."""
    title = f"{analysis.risk_level} Detected: {analysis.hazard}"
    
    # Build a readable message from the analysis
    message = f"Activity: {analysis.activity}\n"
    message += f"Energy Source: {analysis.energy_source}\n"
    message += f"Barrier: {analysis.barrier} ({analysis.barrier_status})\n"
    if analysis.iogp_rule:
        message += f"Rule: {analysis.iogp_rule}\n\n"
    else:
        message += "\n"
    message += f"Rationale: {analysis.rationale}"

    alert = Alert(
        report_id=report.id,
        alert_type="SIF",
        severity=analysis.severity,
        title=title,
        message=message,
        is_read=False
    )
    db.add(alert)


async def list_alerts(unread_only: bool, skip: int, limit: int, db: AsyncSession) -> List[AlertResponse]:
    """Retrieve alerts, optionally filtered by unread status."""
    stmt = select(Alert).order_by(Alert.created_at.desc())
    if unread_only:
        stmt = stmt.where(Alert.is_read == False)
    stmt = stmt.offset(skip).limit(limit)
    
    result = await db.execute(stmt)
    alerts = result.scalars().all()
    return [AlertResponse.model_validate(a) for a in alerts]


async def mark_read(alert_id: uuid.UUID, db: AsyncSession) -> AlertResponse:
    """Mark a specific alert as read and set linked report status to RESOLVED."""
    stmt = select(Alert).where(Alert.id == alert_id)
    result = await db.execute(stmt)
    alert = result.scalars().first()
    
    if not alert:
        raise ValueError("Alert not found")
        
    alert.is_read = True
    
    # If alert is linked to a report, set report status to RESOLVED (green state)
    if alert.report_id:
        r_stmt = select(Report).where(Report.id == alert.report_id)
        r_result = await db.execute(r_stmt)
        linked_report = r_result.scalars().first()
        if linked_report:
            linked_report.status = "RESOLVED"
            
    await db.commit()
    await db.refresh(alert)
    return AlertResponse.model_validate(alert)

