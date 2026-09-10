"""
ai/gemini.py — Gemini client initialization and shared configuration.

Provides a configured Gemini client used by classifier.py and cognition.py.
"""
import google.generativeai as genai

from app.core.config import settings

# TODO: initialize client when settings.GEMINI_API_KEY is set
# genai.configure(api_key=settings.GEMINI_API_KEY)

GENERATION_MODEL = "gemini-1.5-flash"
EMBEDDING_MODEL = "text-embedding-004"
