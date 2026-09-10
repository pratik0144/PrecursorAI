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


# ── Scoring weights ───────────────────────────────────────────────────────────

BARRIER_STATUS_WEIGHTS = {
    "FAILED":   40,
    "DEGRADED": 20,
    "INTACT":    0,
    "UNKNOWN":  10,
}

SEVERITY_WEIGHTS = {
    "CRITICAL": 30,
    "HIGH":     20,
    "MEDIUM":   10,
    "LOW":       5,
}

SIF_BONUS = 30  # Added when sif_potential is True


def compute_risk_score(analysis: GeminiAnalysisOutput) -> int:
    """
    Compute a deterministic 0–100 risk score from Gemini output fields.

    Formula:
        score = barrier_weight + severity_weight + sif_bonus
                - confidence_penalty
        capped at [0, 100]

    confidence_penalty: if confidence < 0.6, subtract up to 10 points
    (low-confidence analyses are down-weighted; the human-review flag
    handles the routing, the score handles the dashboard ranking).
    """
    score = 0

    # 1. Barrier status (how badly was the safety control broken?)
    score += BARRIER_STATUS_WEIGHTS.get(analysis.barrier_status, 10)

    # 2. Severity of the potential outcome
    score += SEVERITY_WEIGHTS.get(analysis.severity, 5)

    # 3. SIF potential bonus (confirms energy + proximity + barrier failure)
    if analysis.sif_potential:
        score += SIF_BONUS

    # 4. Confidence penalty — low-confidence analyses are ranked slightly lower
    #    so ambiguous reports don't crowd out confirmed SIF reports on the dashboard
    if analysis.confidence_score < 0.6:
        penalty = int((0.6 - analysis.confidence_score) * 20)  # max −12 pts at 0.0
        score -= penalty

    return max(0, min(100, score))


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


def needs_human_review(analysis) -> bool:
    """Return True if report must be routed to a Safety Officer.

    Accepts either GeminiAnalysisOutput (confidence_score) or
    ReportAnalysis ORM model (confidence) — handles both gracefully.
    """
    confidence = getattr(analysis, "confidence_score", None) or getattr(analysis, "confidence", 1.0)
    requires_followup = getattr(analysis, "requires_followup", False)
    return (
        confidence < settings.CONFIDENCE_THRESHOLD
        or requires_followup
    )

