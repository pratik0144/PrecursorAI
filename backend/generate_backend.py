import os

BASE_DIR = "/Users/pratikpotadar/Developer/sih2026/PrecursorAI/backend/app"

def write_file(path, content):
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w") as f:
        f.write(content)
    print(f"Written: {path}")

# AI LAYER
write_file("ai/embeddings.py", """
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
""")

write_file("ai/rag.py", """
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.ai.embeddings import generate_embeddings

logger = structlog.get_logger(__name__)

async def search_similar(session: AsyncSession, query: str, limit: int = 5):
    query_embedding = await generate_embeddings(query)
    # Use pgvector cosine with ANN (HNSW) index
    sql = text('''
        SELECT id, chunk_text, 1 - (embedding <=> :embedding::vector) AS similarity
        FROM document_chunks
        WHERE embedding_status NOT IN ('DEGRADED', 'PENDING')
        ORDER BY embedding <=> :embedding::vector
        LIMIT :limit
    ''')
    result = await session.execute(sql, {"embedding": str(query_embedding), "limit": limit})
    return [{"id": row.id, "text": row.chunk_text, "similarity": row.similarity} for row in result]
""")

write_file("ai/classifier.py", """
import structlog
from pydantic import BaseModel, Field
from typing import List, Optional
from app.ai.gemini import LLMProvider

logger = structlog.get_logger(__name__)

class ExtractionPassA(BaseModel):
    hazard: str
    energy_sources: List[str]
    activity: str
    person_in_danger_zone: bool
    barriers: List[str]
    barrier_status: List[str]
    iogp_lsr: List[str]
    oisd_flag: bool
    severity: str

class ExtractionPassB(BaseModel):
    sif_reasoning: str
    rationale: str
    confidence_score: float
    requires_followup: bool
    followup_question: Optional[str] = None

async def extract_structured(text: str) -> ExtractionPassA:
    return await LLMProvider.generate_structured(text, ExtractionPassA)

async def extract_gated(text: str) -> ExtractionPassB:
    return await LLMProvider.generate_structured(text, ExtractionPassB)
""")

write_file("ai/risk_engine.py", """
import structlog
from pydantic import BaseModel
from typing import Optional

logger = structlog.get_logger(__name__)

class ClassificationResult(BaseModel):
    is_sif_precursor: bool
    classification: str
    risk_score: float
    escalation_level: str
    requires_review: bool

def evaluate_risk(pass_a, pass_b, ruleset_version=None) -> ClassificationResult:
    high_energy_present = bool(pass_a.energy_sources)
    person_in_danger_zone = pass_a.person_in_danger_zone
    barrier_compromised = any(status != 'INTACT' for status in pass_a.barrier_status)
    
    is_sif = high_energy_present and person_in_danger_zone and barrier_compromised
    
    classification = "HSIF" if is_sif else "LSIF"
    risk_score = 85.0 if is_sif else 30.0
    escalation_level = "CRITICAL" if risk_score >= 80 else "NORMAL"
    
    requires_review = pass_b.confidence_score < 0.8 or pass_b.requires_followup
    
    return ClassificationResult(
        is_sif_precursor=is_sif,
        classification=classification,
        risk_score=risk_score,
        escalation_level=escalation_level,
        requires_review=requires_review
    )
""")

write_file("ai/pattern_analyzer.py", """
import structlog
from typing import List
from app.ai.gemini import LLMProvider
from pydantic import BaseModel

logger = structlog.get_logger(__name__)

class PatternResult(BaseModel):
    pattern_type: str
    description: str
    confidence: float
    related_report_ids: List[int]

async def analyze_cluster(reports: List[dict]) -> PatternResult:
    prompt = "Analyze these reports for patterns: " + str(reports)
    return await LLMProvider.generate_structured(prompt, PatternResult)
""")

# SERVICES LAYER
write_file("services/report_service.py", """
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from app.ai.classifier import extract_structured, extract_gated
from app.ai.risk_engine import evaluate_risk

logger = structlog.get_logger(__name__)

async def submit_and_analyze(session: AsyncSession, report_text: str):
    logger.info("submitting_report")
    pass_a = await extract_structured(report_text)
    
    high_energy = bool(pass_a.energy_sources)
    
    if high_energy:
        pass_b = await extract_gated(report_text)
    else:
        pass_b = None
        
    result = evaluate_risk(pass_a, pass_b) if pass_b else None
    return result
""")

write_file("services/triage_service.py", """
import structlog
logger = structlog.get_logger(__name__)

async def create_alert(report_data):
    logger.info("creating_alert", status="OPEN")
    pass
""")

write_file("services/pattern_service.py", """
import structlog
logger = structlog.get_logger(__name__)

async def run_sweep(session):
    logger.info("running_pattern_sweep_background")
    pass
""")

write_file("services/alert_service.py", """
import structlog
logger = structlog.get_logger(__name__)

async def transition_alert(alert_id, new_status):
    logger.info("transitioning_alert", alert_id=alert_id, new_status=new_status)
    pass
""")

write_file("services/dashboard_service.py", """
import structlog
logger = structlog.get_logger(__name__)

async def get_sif_funnel(session):
    pass
""")

write_file("services/geo_service.py", """
import structlog
logger = structlog.get_logger(__name__)

async def get_aggregate(level, filters):
    pass

async def get_assets(filters):
    pass
""")

write_file("services/auth_service.py", """
import structlog
logger = structlog.get_logger(__name__)

async def login(email, password):
    pass
""")

# API LAYER
write_file("api/reports.py", """
from fastapi import APIRouter
router = APIRouter()

@router.post("/")
async def create_report():
    pass

@router.get("/")
async def list_reports():
    pass
""")

write_file("api/patterns.py", """
from fastapi import APIRouter
router = APIRouter()

@router.post("/sweep")
async def trigger_sweep():
    pass
""")

write_file("api/alerts.py", """
from fastapi import APIRouter
router = APIRouter()

@router.get("/")
async def list_alerts():
    pass
""")

write_file("api/dashboard.py", """
from fastapi import APIRouter
router = APIRouter()

@router.get("/summary")
async def get_summary():
    pass
""")

write_file("api/geo.py", """
from fastapi import APIRouter
router = APIRouter()

@router.get("/aggregate")
async def get_aggregate():
    pass
""")

write_file("api/auth.py", """
from fastapi import APIRouter
router = APIRouter()

@router.post("/login")
async def login():
    pass
""")

write_file("api/reference.py", """
from fastapi import APIRouter
router = APIRouter()

@router.get("/iogp_rules")
async def get_rules():
    pass
""")

# Remove old files
import shutil
try:
    os.remove(os.path.join(BASE_DIR, "api/cognition.py"))
    print("Deleted api/cognition.py")
except FileNotFoundError:
    pass

try:
    os.remove(os.path.join(BASE_DIR, "services/cognition_service.py"))
    print("Deleted services/cognition_service.py")
except FileNotFoundError:
    pass

