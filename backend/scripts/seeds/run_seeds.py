"""Master script to run all seeds in order."""
import asyncio
from scripts.seeds.reference_seed import run_reference_seed
from scripts.seeds.location_seed import run_location_seed
from scripts.seeds.report_seed import run_report_seed

async def run_all():
    print("Running reference seed...")
    await run_reference_seed()
    
    print("Running location & asset seed...")
    await run_location_seed()
    
    print("Running report seed...")
    await run_report_seed()
    
    print("All seeds completed successfully.")

if __name__ == "__main__":
    asyncio.run(run_all())
