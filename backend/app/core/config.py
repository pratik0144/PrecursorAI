import pathlib
from typing import List, Optional

from pydantic_settings import BaseSettings, SettingsConfigDict


# Resolve path to .env
ENV_PATH = pathlib.Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=str(ENV_PATH), extra="ignore")

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/precursorai"
    USE_CREATE_ALL: bool = False

    # Gemini & LLM Provider
    LLM_PROVIDER: str = "gemini" # gemini/ollama
    LLM_MODEL: str = "gemini-2.0-flash"
    EMBEDDING_MODEL: str = "gemini-embedding-001"
    EMBEDDING_DIMENSIONS: int = 1536
    GEMINI_API_KEY: str = ""

    # App
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"

    # Security & Auth
    JWT_SECRET: str = "SUPER_SECRET_CHANGE_ME"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CORS_ORIGINS: List[str] = ["http://localhost:5173"]

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Tier 1
    CONFIDENCE_THRESHOLD: float = 0.75
    RAG_TOP_K: int = 5

    # Tier 2
    COGNITION_SIMILARITY_THRESHOLD: float = 0.80
    COGNITION_MIN_REPORTS: int = 3


settings = Settings()
