import uuid
import asyncio
from typing import List, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.core.database import get_db
from app.models.report import Report
from app.models.analysis import ReportAnalysis
from app.ai.classifier import extract_structured, extract_gated
from app.ai.risk_engine import evaluate_risk

router = APIRouter()

class ReportSubmitRequest(BaseModel):
    report_text: str = Field(..., min_length=5)
    report_type: str = "NEAR_MISS"
    location: Optional[str] = "Assam / Duliajan / Well #44"
    asset_id: Optional[str] = "Wellhead WH-44"

class AnalysisResponse(BaseModel):
    report_id: Optional[str] = None
    report_text: str
    report_type: str
    location: Optional[str] = None
    asset_id: Optional[str] = None
    extraction_pass_a: dict
    extraction_pass_b: Optional[dict] = None
    classification: dict
    status: str = "PROCESSED"

@router.post("/analyze-text", response_model=AnalysisResponse)
async def analyze_text_with_gemini(payload: ReportSubmitRequest):
    """
    Direct endpoint to trigger Gemini LLM extraction (Pass A & Pass B)
    and deterministic 3-factor evaluation on any safety narrative.
    """
    pass_a = await extract_structured(payload.report_text)
    
    high_energy = bool(pass_a.energy_sources)
    pass_b = await extract_gated(payload.report_text) if high_energy else None
    
    eval_res = evaluate_risk(pass_a, pass_b) if pass_b else None
    
    classification_dict = {
        "is_sif_precursor": eval_res.is_sif_precursor if eval_res else False,
        "classification": eval_res.classification if eval_res else "LOW_ENERGY",
        "risk_score": eval_res.risk_score if eval_res else 20.0,
        "escalation_level": eval_res.escalation_level if eval_res else "ROUTINE",
        "requires_review": eval_res.requires_review if eval_res else False,
    }

    return AnalysisResponse(
        report_id=f"REP-{uuid.uuid4().hex[:8].upper()}",
        report_text=payload.report_text,
        report_type=payload.report_type,
        location=payload.location,
        asset_id=payload.asset_id,
        extraction_pass_a=pass_a.model_dump(),
        extraction_pass_b=pass_b.model_dump() if pass_b else None,
        classification=classification_dict,
        status="ANALYZED"
    )

@router.post("/", response_model=AnalysisResponse)
async def create_and_analyze_report(
    payload: ReportSubmitRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Full ingestion pipeline: runs Gemini Pass A & B, deterministic risk engine,
    and commits to PostgreSQL database.
    """
    pass_a = await extract_structured(payload.report_text)
    high_energy = bool(pass_a.energy_sources)
    pass_b = await extract_gated(payload.report_text) if high_energy else None
    eval_res = evaluate_risk(pass_a, pass_b) if pass_b else None

    # Save to database
    report = Report(
        report_text=payload.report_text,
        report_type=payload.report_type,
        location=payload.location,
        asset_id=payload.asset_id,
        status="ANALYZED"
    )
    db.add(report)
    await db.flush()

    if eval_res:
        analysis = ReportAnalysis(
            report_id=report.id,
            high_energy_present=high_energy,
            person_in_danger_zone=pass_a.person_in_danger_zone,
            barrier_compromised=any(s != 'INTACT' for s in pass_a.barrier_status),
            sif_classification=eval_res.classification,
            escalation_level=eval_res.escalation_level,
            confidence=pass_b.confidence_score if pass_b else 0.85,
            risk_score=eval_res.risk_score,
            severity=pass_a.severity,
            rationale=pass_b.rationale if pass_b else "Routine safety analysis"
        )
        db.add(analysis)

    await db.commit()

    classification_dict = {
        "is_sif_precursor": eval_res.is_sif_precursor if eval_res else False,
        "classification": eval_res.classification if eval_res else "LOW_ENERGY",
        "risk_score": eval_res.risk_score if eval_res else 20.0,
        "escalation_level": eval_res.escalation_level if eval_res else "ROUTINE",
        "requires_review": eval_res.requires_review if eval_res else False,
    }

    return AnalysisResponse(
        report_id=f"REP-{str(report.id)[:8].upper()}",
        report_text=report.report_text,
        report_type=report.report_type,
        location=report.location,
        asset_id=report.asset_id,
        extraction_pass_a=pass_a.model_dump(),
        extraction_pass_b=pass_b.model_dump() if pass_b else None,
        classification=classification_dict,
        status="ANALYZED"
    )

@router.get("/")
async def list_reports(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Report).order_by(desc(Report.created_at)).limit(limit)
    result = await db.execute(stmt)
    reports = result.scalars().all()
    return {
        "items": [
            {
                "id": f"REP-{str(r.id)[:8].upper()}",
                "report_text": r.report_text,
                "report_type": r.report_type,
                "location": r.location,
                "asset_id": r.asset_id,
                "status": r.status,
                "created_at": r.created_at.isoformat() if r.created_at else None
            }
            for r in reports
        ],
        "total": len(reports),
        "page": 1,
        "page_size": limit
    }
