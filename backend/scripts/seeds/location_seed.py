"""Location and asset seed script."""
import asyncio
from sqlalchemy import text
from app.core.database import AsyncSessionLocal

async def run_location_seed():
    async with AsyncSessionLocal() as session:
        # Get demo org id
        org_result = await session.execute(text("SELECT id FROM organizations WHERE slug = 'oil-india-demo'"))
        org_id = org_result.scalar()

        if not org_id:
            print("Demo organization not found. Please run reference_seed first.")
            return

        # Insert WORLD
        await session.execute(text("""
            INSERT INTO locations (id, org_id, level, name, code, latitude, longitude, is_synthetic)
            VALUES ('11111111-1111-1111-1111-111111111111', :org_id, 'WORLD', 'WORLD', 'WRLD', 0, 0, true)
            ON CONFLICT DO NOTHING;
        """), {"org_id": org_id})

        # Insert COUNTRY
        await session.execute(text("""
            INSERT INTO locations (id, org_id, parent_id, level, name, code, latitude, longitude, is_synthetic)
            VALUES ('22222222-2222-2222-2222-222222222222', :org_id, '11111111-1111-1111-1111-111111111111', 'COUNTRY', 'India', 'IND', 20.5937, 78.9629, true)
            ON CONFLICT DO NOTHING;
        """), {"org_id": org_id})

        # Insert REGIONS
        regions = [
            ("Assam", "ASM", 26.2006, 92.9376, "33333333-3333-3333-3333-000000000001"),
            ("Rajasthan", "RAJ", 27.0238, 74.2179, "33333333-3333-3333-3333-000000000002"),
            ("Gujarat", "GUJ", 22.2587, 71.1924, "33333333-3333-3333-3333-000000000003"),
            ("Andhra Pradesh Offshore", "APO", 16.5, 82.0, "33333333-3333-3333-3333-000000000004")
        ]
        
        for name, code, lat, lon, lid in regions:
            await session.execute(text("""
                INSERT INTO locations (id, org_id, parent_id, level, name, code, latitude, longitude, is_synthetic)
                VALUES (:lid, :org_id, '22222222-2222-2222-2222-222222222222', 'REGION', :name, :code, :lat, :lon, true)
                ON CONFLICT DO NOTHING;
            """), {"lid": lid, "org_id": org_id, "name": name, "code": code, "lat": lat, "lon": lon})
            
        # Insert FIELDS
        fields = [
            ("Duliajan", "FLD-DUL", 27.3667, 95.3167, "44444444-4444-4444-4444-000000000001", "33333333-3333-3333-3333-000000000001"),
            ("Moran", "FLD-MOR", 27.17, 94.92, "44444444-4444-4444-4444-000000000002", "33333333-3333-3333-3333-000000000001"),
            ("Rudrasagar", "FLD-RUD", 26.98, 94.63, "44444444-4444-4444-4444-000000000003", "33333333-3333-3333-3333-000000000001"),
            ("Jorhat", "FLD-JOR", 26.75, 94.22, "44444444-4444-4444-4444-000000000004", "33333333-3333-3333-3333-000000000001"),
            ("Barmer Basin", "FLD-BAR", 25.75, 71.38, "44444444-4444-4444-4444-000000000005", "33333333-3333-3333-3333-000000000002"),
            ("Ankleshwar", "FLD-ANK", 21.63, 73.0, "44444444-4444-4444-4444-000000000006", "33333333-3333-3333-3333-000000000003"),
            ("KG Basin Offshore", "FLD-KGB", 16.2, 82.3, "44444444-4444-4444-4444-000000000007", "33333333-3333-3333-3333-000000000004")
        ]

        for name, code, lat, lon, lid, pid in fields:
            await session.execute(text("""
                INSERT INTO locations (id, org_id, parent_id, level, name, code, latitude, longitude, is_synthetic)
                VALUES (:lid, :org_id, :pid, 'FIELD', :name, :code, :lat, :lon, true)
                ON CONFLICT DO NOTHING;
            """), {"lid": lid, "org_id": org_id, "pid": pid, "name": name, "code": code, "lat": lat, "lon": lon})

        # Insert SITES
        sites = [
            ("Duliajan Main Site", "SIT-DUL-M", 27.3667, 95.3167, "55555555-5555-5555-5555-000000000001", "44444444-4444-4444-4444-000000000001"),
            ("Duliajan North", "SIT-DUL-N", 27.38, 95.33, "55555555-5555-5555-5555-000000000002", "44444444-4444-4444-4444-000000000001"),
            ("Moran Well Pad A", "SIT-MOR-A", 27.17, 94.92, "55555555-5555-5555-5555-000000000003", "44444444-4444-4444-4444-000000000002"),
            ("Rudrasagar Central", "SIT-RUD-C", 26.98, 94.63, "55555555-5555-5555-5555-000000000004", "44444444-4444-4444-4444-000000000003"),
            ("Barmer Site Alpha", "SIT-BAR-A", 25.75, 71.38, "55555555-5555-5555-5555-000000000005", "44444444-4444-4444-4444-000000000005"),
            ("Ankleshwar Main", "SIT-ANK-M", 21.63, 73.0, "55555555-5555-5555-5555-000000000006", "44444444-4444-4444-4444-000000000006"),
            ("KG-D6 Platform", "SIT-KGD6", 16.2, 82.35, "55555555-5555-5555-5555-000000000007", "44444444-4444-4444-4444-000000000007")
        ]

        for name, code, lat, lon, lid, pid in sites:
            await session.execute(text("""
                INSERT INTO locations (id, org_id, parent_id, level, name, code, latitude, longitude, is_synthetic)
                VALUES (:lid, :org_id, :pid, 'SITE', :name, :code, :lat, :lon, true)
                ON CONFLICT DO NOTHING;
            """), {"lid": lid, "org_id": org_id, "pid": pid, "name": name, "code": code, "lat": lat, "lon": lon})

        # Insert Assets
        assets = [
            ("Well #44", "WELLHEAD", "55555555-5555-5555-5555-000000000001", "AST-W44"),
            ("Well #12", "WELLHEAD", "55555555-5555-5555-5555-000000000002", "AST-W12"),
            ("Drilling Rig DR-7", "DRILLING_RIG", "55555555-5555-5555-5555-000000000003", "AST-DR7"),
            ("Workover Rig WO-3", "WORKOVER_RIG", "55555555-5555-5555-5555-000000000004", "AST-WO3"),
            ("BOP Stack BOP-1", "BOP_WELL_CONTROL", "55555555-5555-5555-5555-000000000001", "AST-BOP1"),
            ("GGS-Duliajan", "GGS", "55555555-5555-5555-5555-000000000001", "AST-GGS1"),
            ("Compressor Station CS-4", "COMPRESSOR_STATION", "55555555-5555-5555-5555-000000000003", "AST-CS4"),
            ("Pumping Unit PU-9", "PUMPING_UNIT", "55555555-5555-5555-5555-000000000002", "AST-PU9"),
            ("Oil Collection Station OCS-2", "OIL_COLLECTION_STATION", "55555555-5555-5555-5555-000000000004", "AST-OCS2"),
            ("Pipeline Segment PL-101", "PIPELINE", "55555555-5555-5555-5555-000000000004", "AST-PL101"),
            ("Drilling Rig DR-11", "DRILLING_RIG", "55555555-5555-5555-5555-000000000005", "AST-DR11"),
            ("Well #67", "WELLHEAD", "55555555-5555-5555-5555-000000000006", "AST-W67"),
            ("Offshore Platform OP-1", "PRODUCTION_FIELD", "55555555-5555-5555-5555-000000000007", "AST-OP1"),
            ("BOP Stack BOP-2", "BOP_WELL_CONTROL", "55555555-5555-5555-5555-000000000007", "AST-BOP2")
        ]

        for name, atype, loc_id, code in assets:
            await session.execute(text("""
                INSERT INTO assets (id, org_id, location_id, asset_type, name, code, status, is_synthetic)
                VALUES (gen_random_uuid(), :org_id, :loc_id, :atype, :name, :code, 'ACTIVE', true)
                ON CONFLICT DO NOTHING;
            """), {"org_id": org_id, "loc_id": loc_id, "atype": atype, "name": name, "code": code})

        await session.commit()
        print("Location and assets seeded successfully.")

if __name__ == "__main__":
    asyncio.run(run_location_seed())
