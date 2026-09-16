"""
app/main.py — PrecursorAI FastAPI application entry point.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Update imports as per new modules
from app.api import alerts, auth, dashboard, geo, patterns, reference, reports
from app.core.config import settings
from app.core.database import init_db
from app.core.logging import setup_logging
from app.core.middleware import ErrorHandlerMiddleware, RequestIDMiddleware, RLSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run full DB bootstrap on startup: create DB → enable pgvector → create tables."""
    setup_logging()
    await init_db()
    yield

app = FastAPI(
    title="PrecursorAI",
    description="AI-powered safety intelligence system for OIL — SIF precursor detection and pattern cognition.",
    version="0.1.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom Middleware
app.add_middleware(RLSMiddleware)
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(RequestIDMiddleware)

# Register routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(reports.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(alerts.router, prefix=API_PREFIX)
app.include_router(patterns.router, prefix=API_PREFIX)
app.include_router(geo.router, prefix=API_PREFIX)
app.include_router(reference.router, prefix=API_PREFIX)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready():
    return {"status": "ready", "db": "ok", "llm": "ok"}

@app.get("/version")
async def version():
    return {"version": "0.1.0"}

