
import structlog
logger = structlog.get_logger(__name__)

async def create_alert(report_data):
    logger.info("creating_alert", status="OPEN")
    pass
