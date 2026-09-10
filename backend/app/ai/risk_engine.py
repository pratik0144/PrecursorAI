"""
ai/risk_engine.py — Deterministic risk scoring and escalation logic.

Python (not Gemini) is responsible for:
  - Computing risk_score (0–100)
  - Determining final risk_level: ROUTINE | REVIEW | HIGH | SIF
  - Confidence threshold check → human review routing
  - IOGP rule mapping
  - All escalation decisions

The LLM MUST NOT independently determine the final risk level.
"""
from app.core.config import settings
from app.schemas.analysis import GeminiAnalysisOutput


BARRIER_STATUS_WEIGHTS = {
    "FAILED": 40,
    "DEGRADED": 20,
    "INTACT": 0,
    "UNKNOWN": 10,
}

SIF_BONUS = 30


def compute_risk_score(analysis: GeminiAnalysisOutput) -> int:
    """
    Compute a deterministic 0–100 risk score from Gemini output fields.
    Does NOT use the LLM's severity field as the sole input.
    """
    # TODO: implement scoring formula
    raise NotImplementedError


def determine_risk_level(risk_score: int) -> str:
    """Map numeric score to categorical risk level."""
    if risk_score >= 80:
        return "SIF"
    elif risk_score >= 60:
        return "HIGH"
    elif risk_score >= 40:
        return "REVIEW"
    else:
        return "ROUTINE"


def needs_human_review(analysis: GeminiAnalysisOutput) -> bool:
    """Return True if report must be routed to a Safety Officer."""
    return (
        analysis.confidence_score < settings.CONFIDENCE_THRESHOLD
        or analysis.requires_followup
    )
