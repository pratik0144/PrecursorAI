"""
api/patterns.py — Pattern listing and detail endpoints (Tier 2 output)
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.pattern import PatternDetail, PatternListItem

router = APIRouter(prefix="/patterns", tags=["Patterns"])


@router.get("", response_model=List[PatternListItem])
async def list_patterns(
    status: str = "ACTIVE",
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List detected patterns from Tier 2 cognition."""
    # TODO: call pattern_service.list_patterns(status, skip, limit, db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.get("/{pattern_id}", response_model=PatternDetail)
async def get_pattern(pattern_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Get full pattern detail including contributing reports (via pattern_reports).
    This answers: "Why did the system create this pattern?"
    """
    # TODO: call pattern_service.get_pattern(pattern_id, db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
