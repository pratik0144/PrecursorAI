
import structlog
from typing import List
from app.ai.gemini import LLMProvider
from pydantic import BaseModel

logger = structlog.get_logger(__name__)

class PatternResult(BaseModel):
    pattern_type: str
    description: str
    confidence: float
    related_report_ids: List[int]

async def analyze_cluster(reports: List[dict]) -> PatternResult:
    prompt = "Analyze these reports for patterns: " + str(reports)
    return await LLMProvider.generate_structured(prompt, PatternResult)
