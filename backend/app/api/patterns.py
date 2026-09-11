"""
api/patterns.py — Pattern listing, detail, and sweep endpoints (Tier 2 output)
"""
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.pattern import PatternDetail, PatternListItem, SweepResult, ContributingReport
from app.services.pattern_service import (
    list_patterns as list_patterns_service,
    get_pattern as get_pattern_service,
    run_sweep,
)

router = APIRouter(prefix="/patterns", tags=["Patterns"])


@router.post("/sweep", response_model=SweepResult, status_code=status.HTTP_200_OK)
async def trigger_sweep(db: AsyncSession = Depends(get_db)):
    """
    Trigger a full Tier 2 pattern sweep (Phases B-F).

    Steps executed:
      1. SQL COUNT+GROUP BY to find candidate assets/locations (Phase B)
      2. Cosine-similarity clustering per candidate (Phase C)
      3. Gemini multi-report reasoning per cluster (Phase D)
      4. Deterministic rules engine cross-check of priority (Phase E)
      5. Persist Pattern + PatternReport rows to DB (Phase F)

    Safe to call multiple times — creates new pattern records each sweep.
    In production this would run on a weekly schedule; for the demo, call on demand.
    """
    result = await run_sweep(db)
    message = (
        f"Sweep complete: {result['candidates_found']} candidate group(s) found, "
        f"{result['clusters_analysed']} cluster(s) analysed, "
        f"{result['patterns_saved']} pattern(s) saved."
    )
    return SweepResult(
        candidates_found=result["candidates_found"],
        clusters_analysed=result["clusters_analysed"],
        patterns_saved=result["patterns_saved"],
        pattern_ids=result["pattern_ids"],
        message=message,
    )


@router.get("", response_model=List[PatternListItem])
async def list_patterns(
    status: Optional[str] = "ACTIVE",
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """
    List detected patterns from Tier 2, ordered newest first.

    Filter by status: ACTIVE (default) | RESOLVED | DISMISSED
    Pass status=None to get all patterns.
    """
    patterns = await list_patterns_service(db, skip=skip, limit=limit, status=status or None)
    return [PatternListItem.model_validate(p) for p in patterns]


@router.get("/{pattern_id}", response_model=PatternDetail)
async def get_pattern(pattern_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Get full pattern detail including:
      - AI conclusion and evidence list
      - Contributing report IDs and similarity scores
      - Deterministic counts and final priority

    This answers: 'Why did the system create this pattern?'
    — every field is traceable back to specific source reports.
    """
    pattern = await get_pattern_service(db, pattern_id)
    if not pattern:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pattern not found",
        )

    contributing = [
        ContributingReport.model_validate(link)
        for link in pattern.report_links
    ]

    return PatternDetail(
        id=pattern.id,
        pattern_type=pattern.pattern_type,
        title=pattern.title,
        description=pattern.description,
        asset_id=pattern.asset_id,
        location=pattern.location,
        hazard=pattern.hazard,
        barrier=pattern.barrier,
        priority=pattern.priority,
        confidence=pattern.confidence,
        report_count=pattern.report_count,
        first_seen=pattern.first_seen,
        last_seen=pattern.last_seen,
        status=pattern.status,
        evidence=pattern.evidence,
        created_at=pattern.created_at,
        contributing_reports=contributing,
    )
