"""Report seed script."""
import asyncio
import random
import uuid
from datetime import datetime, timedelta
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

def generate_messy_narrative(base_text):
    typos = [("the", "teh"), ("and", "adn"), ("operator", "oprtr"), ("pressure", "pressur"), ("valve", "valv")]
    for orig, typo in typos:
        if random.random() < 0.2:
            base_text = base_text.replace(orig, typo)
    if random.random() < 0.3:
        base_text = base_text.lower()
    return base_text

async def run_report_seed():
    async with AsyncSessionLocal() as session:
        # Get demo org id
        org_result = await session.execute(text("SELECT id FROM organizations WHERE slug = 'oil-india-demo'"))
        org_id = org_result.scalar()
        
        if not org_id:
            print("Demo org not found.")
            return
            
        ruleset_result = await session.execute(text("SELECT id FROM ruleset_versions LIMIT 1"))
        ruleset_id = ruleset_result.scalar()

        # Get assets
        assets_result = await session.execute(text("SELECT id, name, location_id FROM assets"))
        assets = [(row[0], row[1], row[2]) for row in assets_result.fetchall()]
        
        well_44_asset = next(a for a in assets if "Well #44" in a[1])
        well_44_id = well_44_asset[0]
        well_44_loc = well_44_asset[2]
        
        bop_asset = next((a for a in assets if "BOP" in a[1]), assets[0])
        bop_id = bop_asset[0]
        bop_loc = bop_asset[2]
        
        # Get reference keys
        iogp_rules = (await session.execute(text("SELECT id, code FROM iogp_rules"))).fetchall()
        iogp_map = {r[1]: r[0] for r in iogp_rules}
        
        barriers = (await session.execute(text("SELECT id, code FROM barriers"))).fetchall()
        barrier_map = {r[1]: r[0] for r in barriers}
        
        energy = (await session.execute(text("SELECT id, code FROM energy_sources"))).fetchall()
        energy_map = {r[1]: r[0] for r in energy}

        reports_to_insert = []
        analyses_to_insert = []
        alerts_to_insert = []
        patterns_to_insert = []
        pattern_reports_to_insert = []

        now = datetime.utcnow()
        
        # Scenario 1: Compounding barrier failure on Well #44 (5-6 reports over 2 months)
        pattern_id = str(uuid.uuid4())
        patterns_to_insert.append({
            "id": pattern_id,
            "org_id": org_id,
            "title": "Compounding Barrier Failure: Well #44 Maintenance",
            "description": "Progressive degradation of safety barriers at Well #44 during maintenance activities.",
            "pattern_type": "COMPOUNDING",
            "pattern_priority": "CRITICAL",
            "status": "OPEN",
            "asset_uuid": well_44_id,
            "location_id": well_44_loc,
            "ruleset_version_id": ruleset_id
        })
        
        scenario_1_reports = [
            ("LOTO procedure was bypassed to save time while checking pump. Pump was left running.", "REVIEW", False, True, True, "ENERGY_ISOLATION_LOTO", "BYPASSED", "ENERGY_ISOLATION", "ELECTRICAL_LV", 60),
            ("Permit to work found without valid signatures at Well #44 site.", "REVIEW", False, False, True, "WORK_PERMIT_PTW", "DEGRADED", "WORK_AUTHORISATION", None, 50),
            ("Gas detector showing fault, work continued despite offline sensor.", "REVIEW", False, True, True, "GAS_DETECTION", "FAILED", "BYPASSING_SAFETY_CONTROLS", "CHEMICAL_H2S", 55),
            ("Worker crossed exclusion zone boundary while equipment was being lowered.", "REVIEW", True, True, True, "EXCLUSION_ZONE", "FAILED", "LINE_OF_FIRE", "GRAVITY_SUSPENDED_LOAD", 70),
            ("Multiple missing barriers noticed at Well #44. Urgent intervention required.", "CRITICAL", True, True, True, "ENERGY_ISOLATION_LOTO", "MISSING", "ENERGY_ISOLATION", "PRESSURE_WELLBORE", 95)
        ]

        base_time = now - timedelta(days=60)
        for i, (narrative, esc, he, pdz, bc, bar, b_stat, iogp, en_src, r_score) in enumerate(scenario_1_reports):
            rpt_id = str(uuid.uuid4())
            rep_time = base_time + timedelta(days=i*10)
            
            reports_to_insert.append({
                "id": rpt_id, "org_id": org_id, "report_text": generate_messy_narrative(narrative),
                "report_type": "UNSAFE_ACT", "created_at": rep_time, "status": "ANALYZED",
                "location_id": well_44_loc, "asset_uuid": well_44_id, "is_synthetic": True
            })
            
            analyses_to_insert.append({
                "id": str(uuid.uuid4()), "report_id": rpt_id, "high_energy_present": he,
                "person_in_danger_zone": pdz, "barrier_compromised": bc,
                "sif_classification": "PSIF" if esc == "CRITICAL" else "CAPACITY",
                "escalation_level": esc, "risk_score": r_score, "ruleset_version_id": ruleset_id,
                "severity": "HIGH", "confidence": 0.85
            })
            
            pattern_reports_to_insert.append({"pattern_id": pattern_id, "report_id": rpt_id, "similarity_score": 0.9})
            
            # Additional logic to insert join tables would go here, simplified for script
            # In a full run, we'd batch insert to report_barriers, report_energy_sources, etc.

        # Scenario 2: Baghjan-style BOP removal
        bop_rpt_id = str(uuid.uuid4())
        reports_to_insert.append({
            "id": bop_rpt_id, "org_id": org_id, 
            "report_text": "BOP stack was taken offline for maint without a confirmed secondary well barrier tested. Crew was actively working on well pad in line of fire.",
            "report_type": "HIPO_NEAR_MISS", "created_at": now - timedelta(days=2), "status": "ANALYZED",
            "location_id": bop_loc, "asset_uuid": bop_id, "is_synthetic": True
        })
        analyses_to_insert.append({
            "id": str(uuid.uuid4()), "report_id": bop_rpt_id, "high_energy_present": True,
            "person_in_danger_zone": True, "barrier_compromised": True,
            "sif_classification": "HSIF", "escalation_level": "CRITICAL", "risk_score": 98,
            "ruleset_version_id": ruleset_id, "severity": "CRITICAL", "confidence": 0.95
        })
        alerts_to_insert.append({
            "id": str(uuid.uuid4()), "report_id": bop_rpt_id, "org_id": org_id,
            "title": "CRITICAL: Secondary Barrier Missing during BOP Maintenance",
            "status": "OPEN", "severity": "CRITICAL", "source": "REPORT"
        })

        # Generate 194 more random reports
        for i in range(194):
            rpt_id = str(uuid.uuid4())
            ast_id, ast_name, loc_id = random.choice(assets)
            he = random.choice([True, False])
            pdz = random.choice([True, False])
            bc = random.choice([True, False])
            
            sif = "LOW_ENERGY"
            if he and not pdz and not bc: sif = "EXPOSURE"
            elif he and pdz and not bc: sif = "CAPACITY"
            elif he and pdz and bc: sif = "PSIF"
            
            reports_to_insert.append({
                "id": rpt_id, "org_id": org_id,
                "report_text": f"Routine observation at {ast_name}. Some minor issues with equipment.",
                "report_type": "SAFETY_OBSERVATION", "created_at": now - timedelta(days=random.randint(1, 30)),
                "status": "ANALYZED", "location_id": loc_id, "asset_uuid": ast_id, "is_synthetic": True
            })
            
            analyses_to_insert.append({
                "id": str(uuid.uuid4()), "report_id": rpt_id, "high_energy_present": he,
                "person_in_danger_zone": pdz, "barrier_compromised": bc,
                "sif_classification": sif, "escalation_level": "ROUTINE" if sif in ["LOW_ENERGY", "EXPOSURE"] else "REVIEW",
                "risk_score": random.randint(10, 60), "ruleset_version_id": ruleset_id,
                "severity": "LOW", "confidence": random.uniform(0.6, 0.9)
            })

        # Insert everything
        # Bulk insert reports
        for rep in reports_to_insert:
            await session.execute(text("""
                INSERT INTO reports (id, org_id, report_text, report_type, status, location_id, asset_uuid, is_synthetic, created_at)
                VALUES (:id, :org_id, :report_text, :report_type, :status, :location_id, :asset_uuid, :is_synthetic, :created_at)
                ON CONFLICT (id) DO NOTHING;
            """), rep)
            
        for ana in analyses_to_insert:
            await session.execute(text("""
                INSERT INTO report_analysis (id, report_id, high_energy_present, person_in_danger_zone, barrier_compromised, sif_classification, escalation_level, risk_score, ruleset_version_id, severity, confidence)
                VALUES (:id, :report_id, :high_energy_present, :person_in_danger_zone, :barrier_compromised, :sif_classification, :escalation_level, :risk_score, :ruleset_version_id, :severity, :confidence)
                ON CONFLICT (report_id) DO NOTHING;
            """), ana)

        for pat in patterns_to_insert:
            await session.execute(text("""
                INSERT INTO patterns (id, org_id, title, description, pattern_type, pattern_priority, status, asset_uuid, location_id, ruleset_version_id)
                VALUES (:id, :org_id, :title, :description, :pattern_type, :pattern_priority, :status, :asset_uuid, :location_id, :ruleset_version_id)
                ON CONFLICT DO NOTHING;
            """), pat)
            
        for pr in pattern_reports_to_insert:
            await session.execute(text("""
                INSERT INTO pattern_reports (pattern_id, report_id, similarity_score)
                VALUES (:pattern_id, :report_id, :similarity_score)
                ON CONFLICT DO NOTHING;
            """), pr)
            
        for alert in alerts_to_insert:
            await session.execute(text("""
                INSERT INTO alerts (id, report_id, org_id, title, status, severity, source)
                VALUES (:id, :report_id, :org_id, :title, :status, :severity, :source)
                ON CONFLICT DO NOTHING;
            """), alert)

        await session.commit()
        print("Reports and analysis seeded successfully.")

if __name__ == "__main__":
    asyncio.run(run_report_seed())
