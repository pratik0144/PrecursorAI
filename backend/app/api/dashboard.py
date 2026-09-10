"""
api/dashboard.py — Dashboard summary endpoint (polled every 5–10s by frontend)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.dashboard import DashboardSummary
from app.services.dashboard_service import get_summary

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummary)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    """
    Returns aggregated metrics for the dashboard.
    Frontend polls this endpoint every 5–10 seconds.
    No WebSocket — pure REST polling.
    """
    return await get_summary(db)
