"""
api/reports.py — Report submission and retrieval endpoints (Tier 1 entry point)
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.report import ReportCreate, ReportDetail, ReportListItem, ReportSubmitResponse

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportSubmitResponse, status_code=status.HTTP_202_ACCEPTED)
async def submit_report(payload: ReportCreate, db: AsyncSession = Depends(get_db)):
    """
    Submit a new safety report for Tier 1 analysis.

    The report is saved, preprocessed, embedded, and run through
    RAG + Gemini + the deterministic risk engine.
    Returns a summary of the analysis result.
    """
    # TODO: call report_service.submit_and_analyze(payload, db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.get("", response_model=List[ReportListItem])
async def list_reports(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """List all reports, newest first."""
    # TODO: call report_service.list_reports(skip, limit, db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")


@router.get("/{report_id}", response_model=ReportDetail)
async def get_report(report_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get full details of a single report including its analysis."""
    # TODO: call report_service.get_report(report_id, db)
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Not implemented yet")
