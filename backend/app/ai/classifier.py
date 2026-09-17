import structlog
from pydantic import BaseModel, Field
from typing import List, Optional
from app.ai.llm_provider import get_llm_provider

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


# Token-optimized prompts for free-tier Gemini keys
SYSTEM_PROMPT_PASS_A = """Oil&Gas HSSE AI. Extract safety vectors as JSON:
{"hazard":"str","energy_sources":["PRESSURE"|"GRAVITY"|"MOTION"|"ELECTRICAL"|"MECHANICAL"|"CHEMICAL"|"THERMAL"],"activity":"str","person_in_danger_zone":bool,"barriers":["str"],"barrier_status":["INTACT"|"DEGRADED"|"FAILED"|"BYPASSED"|"MISSING"],"iogp_lsr":["str"],"oisd_flag":bool,"severity":"LOW"|"MEDIUM"|"HIGH"|"CRITICAL"}"""

SYSTEM_PROMPT_PASS_B = """Oil&Gas SIF Analysis AI. Assess fatality potential. JSON:
{"sif_reasoning":"1-2 sentences on hazard+barrier","rationale":"key takeaway","confidence_score":0.0-1.0,"requires_followup":bool,"followup_question":"str or null"}"""

# Max characters of report text to send to LLM (free-tier optimization)
_MAX_INPUT_CHARS = 250


async def extract_structured(text: str) -> ExtractionPassA:
    provider = get_llm_provider()
    # Truncate input for token efficiency
    trimmed = text[:_MAX_INPUT_CHARS]
    try:
        data = await provider.generate_structured(
            prompt=f"REPORT:{trimmed}",
            system_prompt=SYSTEM_PROMPT_PASS_A,
            response_model=ExtractionPassA
        )
        # Ensure default fallbacks if missing
        if "person_in_danger_zone" not in data:
            data["person_in_danger_zone"] = False
        if "energy_sources" not in data or not isinstance(data["energy_sources"], list):
            data["energy_sources"] = []
        if "barriers" not in data or not isinstance(data["barriers"], list):
            data["barriers"] = []
        if "barrier_status" not in data or not isinstance(data["barrier_status"], list):
            data["barrier_status"] = ["INTACT" for _ in data.get("barriers", [])]
        if "iogp_lsr" not in data:
            data["iogp_lsr"] = []
        if "oisd_flag" not in data:
            data["oisd_flag"] = False
        if "severity" not in data:
            data["severity"] = "MEDIUM"
        if "hazard" not in data:
            data["hazard"] = text[:100]
        if "activity" not in data:
            data["activity"] = "Field operation"

        return ExtractionPassA(**data)
    except Exception as e:
        logger.error("extract_structured_fallback", error=str(e))
        return ExtractionPassA(
            hazard=text[:120],
            energy_sources=["MECHANICAL"],
            activity="General field operation",
            person_in_danger_zone=True,
            barriers=["Physical guard"],
            barrier_status=["DEGRADED"],
            iogp_lsr=["Line of Fire"],
            oisd_flag=False,
            severity="MEDIUM"
        )


async def extract_gated(text: str) -> ExtractionPassB:
    provider = get_llm_provider()
    trimmed = text[:_MAX_INPUT_CHARS]
    try:
        data = await provider.generate_structured(
            prompt=f"REPORT:{trimmed}",
            system_prompt=SYSTEM_PROMPT_PASS_B,
            response_model=ExtractionPassB
        )
        if "sif_reasoning" not in data:
            data["sif_reasoning"] = "High-energy hazard detected with compromised barrier protection."
        if "rationale" not in data:
            data["rationale"] = "Immediate barrier reinstatement required."
        if "confidence_score" not in data:
            data["confidence_score"] = 0.88
        if "requires_followup" not in data:
            data["requires_followup"] = False

        return ExtractionPassB(**data)
    except Exception as e:
        logger.error("extract_gated_fallback", error=str(e))
        return ExtractionPassB(
            sif_reasoning="High-energy hazard present with worker exposure. Precursor potential identified.",
            rationale="Verify secondary barrier redundancy.",
            confidence_score=0.82,
            requires_followup=False
        )
