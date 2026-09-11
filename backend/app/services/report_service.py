"""
services/report_service.py — Orchestrates the full Tier 1 pipeline for a single report.

Pipeline:
  1. Save raw report
  2. Preprocessing (ai/preprocessing.py)
  3. Generate embedding (ai/embeddings.py)
  4. RAG retrieval (ai/rag.py)
  5. Gemini structured analysis (ai/classifier.py)
  6. Validate JSON schema
  7. Deterministic risk engine (ai/risk_engine.py)
  8. Save analysis
  9. Escalation / alerting (triage_service.py)
"""
import logging
import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession


from app.ai.classifier import classify_report
from app.ai.embeddings import embed_text
from app.ai.preprocessing import preprocess_report_text
from app.ai.rag import retrieve_relevant_chunks
from app.ai.risk_engine import compute_risk_score, determine_risk_level
from app.models.embedding import ReportEmbedding
from app.models.analysis import ReportAnalysis
from app.models.report import Report
from app.schemas.report import ReportCreate, ReportSubmitResponse, AnalysisSummary, ReportListItem, ReportDetail

logger = logging.getLogger(__name__)


async def submit_and_analyze(payload: ReportCreate, db: AsyncSession) -> ReportSubmitResponse:
    """End-to-end Tier 1 processing for a new report."""
    # 1. Create and save the raw Report
    report = Report(
        report_text=payload.report_text,
        report_type=payload.report_type,
        location=payload.location,
        asset_id=payload.asset_id,
        status="PENDING"
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)

    try:
        # 2. Preprocess text
        clean_text = preprocess_report_text(report.report_text)

        # 3. Embed text
        embedding_vec = await embed_text(clean_text)
        
        # Save embedding to DB
        report_emb = ReportEmbedding(
            report_id=report.id,
            embedding=embedding_vec,
            model="gemini-embedding-001"
        )
        db.add(report_emb)
        await db.flush()

        # 4. RAG Retrieval
        knowledge_chunks = await retrieve_relevant_chunks(embedding_vec, db)

        # 5. Gemini Classification
        gemini_out = await classify_report(clean_text, knowledge_chunks)

        # 6. Deterministic Risk Engine
        risk_score = compute_risk_score(gemini_out)
        risk_level = determine_risk_level(risk_score)

        # Map the primary IOGP rule if any exist
        primary_rule = gemini_out.life_saving_rules[0] if gemini_out.life_saving_rules else None

        # 7. Save Analysis
        analysis = ReportAnalysis(
            report_id=report.id,
            sif_potential=gemini_out.sif_potential,
            confidence=gemini_out.confidence_score,
            risk_score=risk_score,
            risk_level=risk_level,
            activity=gemini_out.activity,
            hazard=gemini_out.hazard,
            energy_source=gemini_out.energy_source,
            barrier=gemini_out.barrier,
            barrier_status=gemini_out.barrier_status,
            iogp_rule=primary_rule,
            severity=gemini_out.severity,
            rationale=gemini_out.rationale,
            requires_followup=gemini_out.requires_followup,
            followup_question=gemini_out.followup_question
        )
        db.add(analysis)

        # 8. Triage & Alerting routing logic
        from app.services.triage_service import route_report
        await route_report(analysis, report, db)

        await db.commit()

        # Build response summary
        summary = AnalysisSummary(
            sif_potential=analysis.sif_potential,
            risk_level=analysis.risk_level,
            risk_score=analysis.risk_score,
            iogp_rule=analysis.iogp_rule
        )
        
        return ReportSubmitResponse(
            report_id=report.id,
            status=report.status,
            analysis=summary
        )

    except Exception as e:
        logger.exception("Tier 1 pipeline exception for report %s", report.id)
        report.status = "ERROR"
        await db.commit()
        return ReportSubmitResponse(
            report_id=report.id,
            status="ERROR",
            analysis=AnalysisSummary(
                sif_potential=False,
                risk_level="REVIEW",
                risk_score=50,
                iogp_rule=None
            )
        )



async def list_reports(skip: int, limit: int, db: AsyncSession) -> List[ReportListItem]:
    """Retrieve paginated list of reports."""
    stmt = select(Report).order_by(Report.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(stmt)
    reports = result.scalars().all()
    return [ReportListItem.model_validate(r) for r in reports]


async def get_report(report_id: uuid.UUID, db: AsyncSession) -> Optional[ReportDetail]:
    """Retrieve a single report by ID."""
    stmt = select(Report).options(selectinload(Report.analysis)).where(Report.id == report_id)
    result = await db.execute(stmt)
    report = result.scalars().first()
    if not report:
        return None
    return ReportDetail.model_validate(report)

