"""
ai/preprocessing.py — Text preprocessing before embedding and analysis.

Responsibilities:
- Normalize whitespace and casing
- Strip control characters
- Truncate to a safe length for LLM context limits
"""
import re

MAX_REPORT_LENGTH = 4000  # Characters (plenty for a single HSSE report, guards against huge pastes)


def preprocess_report_text(text: str) -> str:
    """Normalize and clean raw report text before embedding and classification."""
    if not text:
        return ""

    # Remove non-printable control characters (except common whitespace)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', '', text)
    
    # Collapse multiple whitespace/newlines to single space
    text = re.sub(r'\s+', ' ', text)
    
    # Trim to max length and strip ends
    text = text[:MAX_REPORT_LENGTH].strip()
    
    return text
