
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
    
    # Granular risk scoring based on factor count
    factor_count = sum([high_energy_present, person_in_danger_zone, barrier_compromised])
    
    if is_sif:  # All 3 factors
        classification = "HSIF"
        risk_score = 92.0
        escalation_level = "CRITICAL"
    elif factor_count == 2:
        classification = "PSIF"
        risk_score = 72.0
        escalation_level = "HIGH"
    elif factor_count == 1:
        classification = "LSIF"
        risk_score = 45.0
        escalation_level = "REVIEW"
    else:
        classification = "LOW_ENERGY"
        risk_score = 15.0
        escalation_level = "ROUTINE"
    
    requires_review = pass_b.confidence_score < 0.8 or pass_b.requires_followup
    
    return ClassificationResult(
        is_sif_precursor=is_sif,
        classification=classification,
        risk_score=risk_score,
        escalation_level=escalation_level,
        requires_review=requires_review
    )
