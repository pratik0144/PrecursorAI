"""
api/alerts.py — Alert listing and mark-as-read endpoints
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.alert import AlertResponse
from app.services.alert_service import list_alerts as list_alerts_service
from app.services.alert_service import mark_read as mark_read_service

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List alerts. Optionally filter to unread only."""
    return await list_alerts_service(unread_only, skip, limit, db)


@router.patch("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_read(alert_id: UUID, db: AsyncSession = Depends(get_db)):
    """Mark a specific alert as read."""
    try:
        return await mark_read_service(alert_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
