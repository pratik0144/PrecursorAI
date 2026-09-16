import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal
import bcrypt

async def run_reference_seed():
    async with AsyncSessionLocal() as session:
        # Seed organizations
        await session.execute(text("""
            INSERT INTO organizations (id, name, slug, is_demo)
            VALUES (gen_random_uuid(), 'Oil India Limited (DEMO)', 'oil-india-demo', true)
            ON CONFLICT (slug) DO NOTHING;
        """))
        
        # Get demo org id
        org_result = await session.execute(text("SELECT id FROM organizations WHERE slug = 'oil-india-demo'"))
        org_id = org_result.scalar()

        # Seed Users
        password_hash = bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode("utf-8")
        demo_users = [
            ("hsse_officer@demo.oil.in", "HSSE_OFFICER", "HSSE Officer"),
            ("site_manager@demo.oil.in", "SITE_MANAGER", "Site Manager"),
            ("ops_manager@demo.oil.in", "OPS_MANAGER", "Ops Manager"),
            ("leadership@demo.oil.in", "CORPORATE_LEADERSHIP", "Leadership"),
            ("admin@demo.oil.in", "ADMIN", "Admin"),
        ]
        
        for email, role, name in demo_users:
            await session.execute(text("""
                INSERT INTO users (id, org_id, email, password_hash, role, name, is_active)
                VALUES (gen_random_uuid(), :org_id, :email, :password_hash, :role, :name, true)
                ON CONFLICT (email) DO NOTHING;
            """), {"org_id": org_id, "email": email, "password_hash": password_hash, "role": role, "name": name})

        # Seed ruleset_versions
        await session.execute(text("""
            INSERT INTO ruleset_versions (id, version, weights, thresholds, classification_map, is_active, created_by)
            VALUES (
                gen_random_uuid(), '1.0.0', 
                '{"barrier_failed": 40, "barrier_degraded": 30, "barrier_missing": 25, "barrier_bypassed": 35, "barrier_unknown": 10, "barrier_intact": 0, "severity_critical": 30, "severity_high": 20, "severity_medium": 10, "severity_low": 5, "sif_bonus": 30, "confidence_penalty_max": 12}'::jsonb,
                '{"escalation_critical": 80, "escalation_high": 60, "escalation_review": 40, "confidence_threshold": 0.75, "similarity_threshold": 0.80, "min_reports": 3, "high_energy_joules": 1500}'::jsonb,
                '{"high_energy+danger_zone+barrier_compromised": "PSIF", "high_energy+danger_zone+barrier_compromised+serious_outcome": "HSIF"}'::jsonb,
                true, NULL
            )
            ON CONFLICT (version) DO NOTHING;
        """))

        # Seed IOGP Life-Saving Rules
        iogp_rules = [
            ("BYPASSING_SAFETY_CONTROLS", "Bypassing Safety Controls", "Never disable or bypass a safety-critical device or system"),
            ("CONFINED_SPACE", "Confined Space", "Obtain authorization before entering a confined space"),
            ("DRIVING", "Driving", "Follow safe driving rules"),
            ("ENERGY_ISOLATION", "Energy Isolation", "Verify isolation and zero energy before work begins"),
            ("HOT_WORK", "Hot Work", "Control flammables and ignition sources"),
            ("LINE_OF_FIRE", "Line of Fire", "Keep yourself and others out of the line of fire"),
            ("SAFE_MECHANICAL_LIFTING", "Safe Mechanical Lifting", "Plan lifting operations and control the area"),
            ("WORK_AUTHORISATION", "Work Authorisation", "Work with a valid permit when required"),
            ("WORKING_AT_HEIGHT", "Working at Height", "Protect yourself against a fall when working at height")
        ]
        
        for code, name, desc in iogp_rules:
            await session.execute(text("""
                INSERT INTO iogp_rules (id, code, name, description)
                VALUES (gen_random_uuid(), :code, :name, :desc)
                ON CONFLICT (code) DO NOTHING;
            """), {"code": code, "name": name, "desc": desc})

        # Seed Energy Sources taxonomy
        energy_sources = [
            ("GRAVITY_SUSPENDED_LOAD", "Suspended derrick load, crane load", "GRAVITY", True, None),
            ("GRAVITY_FALL_FROM_HEIGHT", "Personnel fall from derrick, platform", "GRAVITY", True, None),
            ("MOTION_VEHICLE", "Heavy vehicle/equipment movement", "MOTION", True, None),
            ("MOTION_ROTATING_EQUIPMENT", "Rotating drill string, pumps, compressors", "MECHANICAL", True, None),
            ("PRESSURE_WELLBORE", "Well pressure/kick, BOP scenario", "PRESSURE", True, 1500),
            ("PRESSURE_PIPELINE", "High-pressure pipeline/vessel", "PRESSURE", True, None),
            ("ELECTRICAL_HV", "High-voltage equipment, transformers", "ELECTRICAL", True, None),
            ("CHEMICAL_H2S", "H2S release, toxic gas exposure", "CHEMICAL", True, None),
            ("CHEMICAL_HYDROCARBON", "Hydrocarbon leak/spill", "CHEMICAL", True, None),
            ("TEMPERATURE_STEAM", "Steam, hot surfaces, thermal burns", "TEMPERATURE", True, None),
            ("FIRE_EXPLOSION", "Fire, explosion, hot work ignition", "FIRE_EXPLOSION", True, None),
            ("RADIATION_IONIZING", "Well-logging radioactive sources", "RADIATION", False, None),
            ("SOUND_NOISE", "High-noise environments", "SOUND", False, None),
            ("BIOLOGICAL_HAZARD", "Snake bites, insect stings in remote fields", "BIOLOGICAL", False, None),
            ("GRAVITY_LOW_LEVEL", "Slips, trips at ground level", "GRAVITY", False, None),
            ("ELECTRICAL_LV", "Low-voltage hand tools", "ELECTRICAL", False, None)
        ]
        
        for code, name, etype, high_energy, threshold in energy_sources:
            await session.execute(text("""
                INSERT INTO energy_sources (id, code, name, energy_type, typical_context, is_high_energy, threshold_joules)
                VALUES (gen_random_uuid(), :code, :name, :etype, :name, :high_energy, :threshold)
                ON CONFLICT (code) DO NOTHING;
            """), {"code": code, "name": name, "etype": etype, "high_energy": high_energy, "threshold": threshold})

        # Seed Barriers
        barriers = [
            ("ENERGY_ISOLATION_LOTO", "Energy Isolation / LOTO", True),
            ("WORK_PERMIT_PTW", "Permit to Work (PTW)", False),
            ("BOP_WELL_BARRIER", "BOP / Well Barrier", True),
            ("SECONDARY_WELL_BARRIER", "Secondary Well Barrier", True),
            ("FALL_ARREST", "Fall Arrest System", True),
            ("GAS_DETECTION", "Gas Detection System", True),
            ("EXCLUSION_ZONE", "Exclusion Zone / Line of Fire Positioning", True),
            ("LIFTING_PLAN", "Lifting Plan & Rigging", False),
            ("CONFINED_SPACE_CONTROLS", "Confined Space Entry Controls", False),
            ("HOT_WORK_CONTROLS", "Hot Work Controls", False),
            ("PRESSURE_RELIEF", "Pressure Relief Valve/System", True),
            ("FIRE_SUPPRESSION", "Fire Suppression System", True)
        ]
        
        for code, name, direct in barriers:
            await session.execute(text("""
                INSERT INTO barriers (id, code, name, is_direct_control)
                VALUES (gen_random_uuid(), :code, :name, :direct)
                ON CONFLICT (code) DO NOTHING;
            """), {"code": code, "name": name, "direct": direct})

        # Seed OISD References
        oisd_refs = [
            ("OISD-CONCEPT-HIPO", "High-Potential (Hi-Po) Near Miss", "HIPO_NEAR_MISS", True),
            ("OISD-STD-105", "Work Permit", NULL, False),
            ("OISD-STD-116", "Fire Protection", NULL, False),
            ("OISD-STD-154", "Safety Instrumented Systems", NULL, False),
            ("OISD-STD-189", "Standard on Onshore Well Pad Design", NULL, False)
        ]
        
        for std_no, title, tag, verified in oisd_refs:
            await session.execute(text("""
                INSERT INTO oisd_references (id, standard_no, title, concept_tag, verified)
                VALUES (gen_random_uuid(), :std_no, :title, :tag, :verified)
                ON CONFLICT (standard_no) DO NOTHING;
            """), {"std_no": std_no, "title": title, "tag": tag, "verified": verified})

        await session.commit()
        print("Reference data seeded successfully.")

if __name__ == "__main__":
    asyncio.run(run_reference_seed())
