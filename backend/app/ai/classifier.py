
import structlog
from pydantic import BaseModel, Field
from typing import List, Optional
from app.ai.gemini import LLMProvider

logger = structlog.get_logger(__name__)

class ExtractionPassA(BaseModel):
    hazard: str
    energy_sources: List[str]
    activity: str
    person_in_danger_zone: bool
    barriers: List[str]
    barrier_status: List[str]
    iogp_lsr: List[str]
    oisd_flag: bool
    severity: str

class ExtractionPassB(BaseModel):
    sif_reasoning: str
    rationale: str
    confidence_score: float
    requires_followup: bool
    followup_question: Optional[str] = None

async def extract_structured(text: str) -> ExtractionPassA:
    return await LLMProvider.generate_structured(text, ExtractionPassA)

async def extract_gated(text: str) -> ExtractionPassB:
    return await LLMProvider.generate_structured(text, ExtractionPassB)
