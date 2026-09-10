"""
ai/cognition.py — Gemini-powered Tier 2 pattern cognition.

Responsibilities (Gemini):
  - Describe recurring issues across a semantic group of reports
  - Identify trends
  - Suggest potential contributing factors (NOT proven causality)
  - Generate human-readable pattern title and description

NOT Gemini's responsibility:
  - Clustering (done via cosine similarity + connected components in cognition_service.py)
  - Statistics gating (done deterministically before this module is called)
  - Storing patterns
  - Creating alerts

IMPORTANT: If relationships between events are identified, describe them
as "potential contributing factors". Never claim proven causality.
"""
from typing import List

# TODO: implement Gemini cognition prompt and structured output


async def analyze_pattern_group(
    report_texts: List[str],
    stats: dict,
) -> dict:
    """
    Given a connected-component group of semantically similar reports
    and their deterministic statistics, ask Gemini to describe the pattern.

    Returns a dict with: title, description, pattern_type, evidence
    """
    # TODO: build prompt, call Gemini with response_mime_type="application/json"
    raise NotImplementedError
