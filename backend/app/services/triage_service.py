"""
services/triage_service.py — Human-in-the-loop routing.

Rules:
  - IF confidence < settings.CONFIDENCE_THRESHOLD → route to REVIEW
  - IF requires_followup == True → route to REVIEW
  - IF risk_level in (HIGH, SIF) → create alert + route to dashboard
  - ELSE → ROUTINE storage

The LLM does NOT decide the final risk level.
Python (risk_engine) computes it deterministically.
"""
# TODO: implement triage logic
