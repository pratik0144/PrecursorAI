
import structlog
from pydantic import BaseModel
from typing import Optional

logger = structlog.get_logger(__name__)

class ClassificationResult(BaseModel):
    is_sif_precursor: bool
    classification: str
    risk_score: float
    escalation_level: str
    requires_review: bool

def evaluate_risk(pass_a, pass_b, ruleset_version=None) -> ClassificationResult:
    high_energy_present = bool(pass_a.energy_sources)
    person_in_danger_zone = pass_a.person_in_danger_zone
    barrier_compromised = any(status != 'INTACT' for status in pass_a.barrier_status)
    
    is_sif = high_energy_present and person_in_danger_zone and barrier_compromised
    
    classification = "HSIF" if is_sif else "LSIF"
    risk_score = 85.0 if is_sif else 30.0
    escalation_level = "CRITICAL" if risk_score >= 80 else "NORMAL"
    
    requires_review = pass_b.confidence_score < 0.8 or pass_b.requires_followup
    
    return ClassificationResult(
        is_sif_precursor=is_sif,
        classification=classification,
        risk_score=risk_score,
        escalation_level=escalation_level,
        requires_review=requires_review
    )
