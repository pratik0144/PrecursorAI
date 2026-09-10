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
  8. IOGP rule mapping
  9. Save analysis
  10. Escalation / alerting (alert_service.py)
"""
# TODO: implement Tier 1 pipeline
