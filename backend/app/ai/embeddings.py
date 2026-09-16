
import structlog
from typing import List
from app.ai.gemini import LLMProvider

logger = structlog.get_logger(__name__)

async def generate_embeddings(text: str, dimensions: int = 1536) -> List[float]:
    try:
        return await LLMProvider.embed(text, dimensions=dimensions)
    except Exception as e:
        logger.error("embedding_failed", error=str(e))
        raise
