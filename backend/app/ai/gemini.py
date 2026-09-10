"""
ai/gemini.py — Gemini client initialization and shared configuration.

Provides a configured Gemini client used by classifier.py and embeddings.py.
Initialization is lazy — configure() is a no-op if called multiple times.
"""
import google.generativeai as genai

from app.core.config import settings

GENERATION_MODEL = "gemini-3.6-flash"
EMBEDDING_MODEL = "models/gemini-embedding-001"


def get_client() -> genai.GenerativeModel:
    """Return a configured GenerativeModel, initializing the SDK if needed."""
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(GENERATION_MODEL)


def get_genai() -> genai:
    """Return the configured genai module (for embed_content calls)."""
    if settings.GEMINI_API_KEY:
        genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai
