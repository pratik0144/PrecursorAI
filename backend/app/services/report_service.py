
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.classifier import extract_structured, extract_gated
from app.ai.risk_engine import evaluate_risk

logger = structlog.get_logger(__name__)

async def submit_and_analyze(session: AsyncSession, report_text: str):
    logger.info("submitting_report")
    pass_a = await extract_structured(report_text)
    
    high_energy = bool(pass_a.energy_sources)
    
    if high_energy:
        pass_b = await extract_gated(report_text)
    else:
        pass_b = None
        
    result = evaluate_risk(pass_a, pass_b) if pass_b else None
    return result
