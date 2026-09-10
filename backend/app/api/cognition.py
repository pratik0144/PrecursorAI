"""
api/cognition.py — Tier 2 cognition sweep trigger and status endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db

router = APIRouter(prefix="/cognition", tags=["Cognition"])


class SweepResponse(BaseModel):
    job_id: str
    status: str
    message: str


class CognitionStatus(BaseModel):
    last_sweep: str | None
    status: str  # IDLE | RUNNING | COMPLETED | FAILED
    patterns_found_last_sweep: int
    total_patterns: int


@router.post("/sweep", response_model=SweepResponse, status_code=status.HTTP_202_ACCEPTED)
async def trigger_sweep(db: AsyncSession = Depends(get_db)):
    """
    Trigger a Tier 2 cognition sweep.

    Flow: SQL stats → cosine similarity → connected components → Gemini cognition
    → deterministic validation → store patterns → create HSSE alerts.
    """
    # TODO: call cognition_service.trigger_sweep(db) (async background task)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.get("/status", response_model=CognitionStatus)
async def get_cognition_status(db: AsyncSession = Depends(get_db)):
    """Get the status of the most recent Tier 2 cognition sweep."""
    # TODO: call cognition_service.get_status(db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
