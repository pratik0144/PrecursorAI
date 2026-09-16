from arq import create_pool
from arq.connections import RedisSettings
from app.core.config import settings

async def run_pattern_sweep(ctx, org_id: str, params: dict = None):
    """Background job: run Tier-2 pattern sweep."""
    from app.services.pattern_service import run_sweep
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await run_sweep(db, org_id, params)
    return result

async def backfill_embeddings(ctx, report_ids: list[str] = None):
    """Background job: re-embed reports with DEGRADED/PENDING status."""
    from app.services.embedding_service import backfill
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await backfill(db, report_ids)
    return result

async def escalate_sla_alerts(ctx):
    """Background job: escalate alerts past SLA deadline."""
    from app.services.alert_service import escalate_overdue
    from app.core.database import AsyncSessionLocal
    async with AsyncSessionLocal() as db:
        result = await escalate_overdue(db)
    return result

class WorkerSettings:
    functions = [run_pattern_sweep, backfill_embeddings, escalate_sla_alerts]
    redis_settings = RedisSettings.from_dsn(settings.REDIS_URL)
    cron_jobs = [
        # Weekly pattern sweep
        # cron(run_pattern_sweep, weekday=0, hour=2, minute=0),
    ]
