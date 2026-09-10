"""
api/alerts.py — Alert listing and mark-as-read endpoints
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.alert import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=List[AlertResponse])
async def list_alerts(
    unread_only: bool = False,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List alerts. Optionally filter to unread only."""
    # TODO: call alert_service.list_alerts(unread_only, skip, limit, db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.patch("/{alert_id}/read", response_model=AlertResponse)
async def mark_alert_read(alert_id: UUID, db: AsyncSession = Depends(get_db)):
    """Mark a specific alert as read."""
    # TODO: call alert_service.mark_read(alert_id, db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
