"""
scripts/seed_reports.py — Seed the database with synthetic safety reports
for demo and testing purposes.

Because passing 120 reports through Gemini live would take ~10 minutes
and consume API quota, this script seeds the database with PRE-COMPUTED
reports and analyses.

Usage:
    python -m scripts.seed_reports
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parents[2]
BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from dotenv import load_dotenv

from app.models.report import Report
from app.models.analysis import ReportAnalysis
from app.models.alert import Alert

load_dotenv(BACKEND / ".env")

# Convert SQLAlchemy-style asyncpg URL to plain asyncpg DSN or keep it if using engine
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://postgres:postgres@localhost:5432/precursorai")

# Synthetic data
LOCATIONS = ["Duliajan", "Nazira", "Jorhat", "Makum"]
ASSETS = ["Rig #4", "Separator Unit", "HV Transformer", "Mud Pit", "Vehicle-12"]

SIF_REPORTS = [
    {
        "type": "NEAR_MISS",
        "text": "During pipe rack installation at Duliajan rig #4, a 400 kg pipe joint slipped from the crane hook while a rigger was directly below completing the tag-line connection. The secondary sling was missing. The pipe fell 6 metres but fortunately missed the worker.",
        "hazard": "Falling object / suspended load",
        "energy": "Gravitational — 400 kg pipe joint at 6 m elevation",
        "barrier": "Secondary sling / tag-line protocol",
        "barrier_status": "FAILED",
        "rule": "SAFE MECHANICAL LIFTING",
        "score": 100,
        "level": "SIF",
        "rationale": "Gravitational energy (400 kg at 6 m), person directly below load, secondary sling absent. Near-fatality."
    },
    {
        "type": "UNSAFE_ACT",
        "text": "Operator entered the separator area at Nazira without checking H2S monitor reading. Monitor was found to be reading 45 ppm. Operator had no breathing apparatus.",
        "hazard": "Toxic gas exposure — H2S",
        "energy": "Chemical — Hydrogen sulphide at 45 ppm",
        "barrier": "H2S monitor check + breathing apparatus",
        "barrier_status": "FAILED",
        "rule": "H2S",
        "score": 100,
        "level": "SIF",
        "rationale": "H2S at 45 ppm with no SCBA and no pre-entry monitor check. Lethal concentrations possible within seconds."
    },
    {
        "type": "UNSAFE_CONDITION",
        "text": "Maintenance technician began work on the HV transformer at Jorhat substation before the LOTO permit was signed. The equipment was still energised at 11 kV.",
        "hazard": "Electrical shock / electrocution",
        "energy": "Electrical — 11 kV high voltage",
        "barrier": "LOTO (Lockout-Tagout) permit",
        "barrier_status": "FAILED",
        "rule": "ENERGY ISOLATION",
        "score": 100,
        "level": "SIF",
        "rationale": "Worker in direct contact with live 11 kV equipment. LOTO procedure completely bypassed."
    }
]

ROUTINE_REPORTS = [
    {
        "type": "UNSAFE_CONDITION",
        "text": "Oil spill of approximately 2 litres found near the mud pit area. Area was cordoned off and cleaned within 30 minutes. No personnel were in the area.",
        "hazard": "Slip / environmental contamination",
        "energy": "None significant",
        "barrier": "Area cordoning",
        "barrier_status": "INTACT",
        "rule": None,
        "score": 5,
        "level": "ROUTINE",
        "rationale": "No person was in proximity, spill was minor and quickly contained."
    },
    {
        "type": "UNSAFE_ACT",
        "text": "Driver observed not wearing seatbelt while driving OIL vehicle. He was stopped and counselled. Seatbelt was worn for remainder of journey.",
        "hazard": "Road traffic / vehicle accident",
        "energy": "Kinetic — moving vehicle",
        "barrier": "Seatbelt",
        "barrier_status": "FAILED",
        "rule": "DRIVING",
        "score": 35,
        "level": "ROUTINE",
        "rationale": "Barrier was missing but corrective action was immediate. No near-miss event occurred."
    }
]

async def seed():
    print("PrecursorAI — Seeding synthetic reports")
    engine = create_async_engine(DATABASE_URL)
    SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    async with SessionLocal() as db:
        reports_added = 0
        alerts_added = 0
        
        # Add SIF reports
        for i, data in enumerate(SIF_REPORTS * 5):  # 15 SIFs
            report = Report(
                report_text=data["text"],
                report_type=data["type"],
                location=LOCATIONS[i % len(LOCATIONS)],
                asset_id=ASSETS[i % len(ASSETS)],
                status="ANALYZED",
                created_at=datetime.utcnow() - timedelta(days=i % 7)
            )
            db.add(report)
            await db.flush()
            
            analysis = ReportAnalysis(
                report_id=report.id,
                sif_potential=True,
                confidence=0.95,
                risk_score=data["score"],
                risk_level=data["level"],
                activity="Maintenance/Operations",
                hazard=data["hazard"],
                energy_source=data["energy"],
                barrier=data["barrier"],
                barrier_status=data["barrier_status"],
                iogp_rule=data["rule"],
                severity="CRITICAL",
                rationale=data["rationale"]
            )
            db.add(analysis)
            
            alert = Alert(
                report_id=report.id,
                alert_type="SIF",
                severity="CRITICAL",
                title=f"SIF Detected: {data['hazard']}",
                message=f"Activity: Maintenance\nBarrier: {data['barrier']}\nRationale: {data['rationale']}",
                is_read=False
            )
            db.add(alert)
            reports_added += 1
            alerts_added += 1

        # Add Routine reports
        for i, data in enumerate(ROUTINE_REPORTS * 20):  # 40 Routine
            report = Report(
                report_text=data["text"],
                report_type=data["type"],
                location=LOCATIONS[i % len(LOCATIONS)],
                asset_id=ASSETS[i % len(ASSETS)],
                status="ANALYZED",
                created_at=datetime.utcnow() - timedelta(days=i % 7)
            )
            db.add(report)
            await db.flush()
            
            analysis = ReportAnalysis(
                report_id=report.id,
                sif_potential=False,
                confidence=0.90,
                risk_score=data["score"],
                risk_level=data["level"],
                activity="General",
                hazard=data["hazard"],
                energy_source=data["energy"],
                barrier=data["barrier"],
                barrier_status=data["barrier_status"],
                iogp_rule=data["rule"],
                severity="LOW",
                rationale=data["rationale"]
            )
            db.add(analysis)
            reports_added += 1
            
        await db.commit()
        print(f"Successfully seeded {reports_added} reports and {alerts_added} alerts.")

if __name__ == "__main__":
    asyncio.run(seed())
