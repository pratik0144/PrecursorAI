"""
ai/classifier.py — Gemini-powered Tier 1 SIF analysis.

Responsibilities (Gemini):
  - Understand hazard and activity
  - Identify energy source
  - Identify barrier and barrier status
  - Determine potential SIF precursor
  - Identify relevant IOGP Life-Saving Rule
  - Explain reasoning (rationale)
  - Flag requires_followup if uncertain

NOT Gemini's responsibility:
  - Final risk level (determined by risk_engine.py)
  - Risk score (computed deterministically)
  - Escalation decisions

Output schema: GeminiAnalysisOutput (schemas/analysis.py)
"""
from typing import List

# TODO: implement Gemini prompt construction and structured JSON output parsing

async def classify_report(
    report_text: str,
    knowledge_chunks: List[dict],
) -> dict:
    """
    Send report + RAG context to Gemini and return structured analysis.
    Returns a dict matching GeminiAnalysisOutput schema.
    """
    # TODO: build prompt, call Gemini with response_mime_type="application/json"
    raise NotImplementedError
