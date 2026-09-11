"""
scripts/seed_tier2_reports.py — Seed reports designed to trigger Tier 2 pattern detection.

This script submits reports via the LIVE API (POST /api/v1/reports), which means:
  - Each report goes through the full Tier 1 pipeline
  - Embeddings are stored in report_embeddings (required for Tier 2 clustering)
  - Reports are clustered around 2 assets and 1 location deliberately

Three pattern groups seeded:
  1. PUMP-102      — 5 reports about pressure/valve failures (RECURRING)
  2. Compressor C3 — 4 reports about hydrocarbon smell/gas readings (EMERGING)
  3. Deck-B        — 4 reports about PTW/LOTO procedural bypasses (SYSTEMIC)

Usage (backend must be running on port 8000):
    python scripts/seed_tier2_reports.py
"""

import time
import sys
import urllib.request
import urllib.error
import json

BASE_URL = "http://localhost:8000/api/v1"

# ── Pattern Group 1: RECURRING — Pressure valve failures on PUMP-102 ─────────
# 5 different phrasings of the same degrading valve problem
PUMP_REPORTS = [
    {
        "report_type": "UNSAFE_CONDITION",
        "report_text": "Pressure relief valve on PUMP-102 found stuck in open position during routine inspection at Duliajan. Valve would not reseat after multiple attempts. Temporarily isolated.",
        "asset_id": "PUMP-102",
        "location": "Duliajan",
    },
    {
        "report_type": "UNSAFE_CONDITION",
        "report_text": "PUMP-102 pressure relief valve did not reset correctly after the scheduled pressure test. Had to manually reset it. Valve seat appears worn and may not hold under high-pressure conditions.",
        "asset_id": "PUMP-102",
        "location": "Duliajan",
    },
    {
        "report_type": "NEAR_MISS",
        "report_text": "Abnormal vibration and noise from PUMP-102 pressure relief system during morning shift. On inspection the valve spindle showed visible wear. Engineering notified but not yet attended.",
        "asset_id": "PUMP-102",
        "location": "Duliajan",
    },
    {
        "report_type": "UNSAFE_CONDITION",
        "report_text": "Hydrocarbon leak observed past the seat of PUMP-102 relief valve during high-pressure pump test. Leak rate approximately 0.5 litres per minute. Pump shut down and isolated.",
        "asset_id": "PUMP-102",
        "location": "Duliajan",
    },
    {
        "report_type": "UNSAFE_ACT",
        "report_text": "Night shift operator bypassed the PUMP-102 pressure relief valve using a manual block valve due to repeated spurious lifts causing process interruption. Bypass not permitted under site PTW and removes the sole overpressure protection.",
        "asset_id": "PUMP-102",
        "location": "Duliajan",
    },
]

# ── Pattern Group 2: EMERGING — Gas accumulation near Compressor C3 ───────────
# 4 escalating observations at the same location (different wording)
COMPRESSOR_REPORTS = [
    {
        "report_type": "UNSAFE_CONDITION",
        "report_text": "Faint hydrocarbon smell noticed near Compressor C3 inlet at Nazira processing unit during morning walkround. No alarm activated. Area ventilated and reported to shift supervisor.",
        "asset_id": "COMP-C3",
        "location": "Nazira",
    },
    {
        "report_type": "NEAR_MISS",
        "report_text": "Worker felt briefly dizzy and lightheaded while working near C3 gas compressor at Nazira. Left the area and recovered after 10 minutes in fresh air. No formal gas check was performed at the time.",
        "asset_id": "COMP-C3",
        "location": "Nazira",
    },
    {
        "report_type": "UNSAFE_CONDITION",
        "report_text": "Oil and condensate accumulation found on the floor at the base of Compressor C3 at Nazira. Source appears to be a weeping flange on the suction line. Area cleaned but flange not yet repaired.",
        "asset_id": "COMP-C3",
        "location": "Nazira",
    },
    {
        "report_type": "UNSAFE_CONDITION",
        "report_text": "Fixed gas detector in the Nazira compressor hall recorded a brief reading of 8 percent LEL before self-resetting. Reading was near C3. Detector tested functional. Source of reading not identified.",
        "asset_id": "COMP-C3",
        "location": "Nazira",
    },
]

# ── Pattern Group 3: SYSTEMIC — PTW and LOTO bypasses at Deck-B ───────────────
# 4 procedural violations all at the same location
DECK_REPORTS = [
    {
        "report_type": "UNSAFE_ACT",
        "report_text": "Hot work permit for welding on Deck B at Jorhat was issued 25 minutes after the welding had already started. Permit signed retroactively by supervisor. No gas test performed before ignition.",
        "asset_id": "DECK-B",
        "location": "Jorhat",
    },
    {
        "report_type": "UNSAFE_ACT",
        "report_text": "Energy isolation was not verified before maintenance started on the Deck B instrument air compressor at Jorhat. Technician confirmed equipment was still pressurised when he began work. LOTO was applied only after this was noticed by the HSE officer.",
        "asset_id": "DECK-B",
        "location": "Jorhat",
    },
    {
        "report_type": "UNSAFE_ACT",
        "report_text": "Two workers entered the Deck B cable duct on Jorhat platform without a confined space entry permit. They stated they were not aware a permit was required for this space. Area has visible confined space signage.",
        "asset_id": "DECK-B",
        "location": "Jorhat",
    },
    {
        "report_type": "UNSAFE_ACT",
        "report_text": "Scaffolding inspection certificate for Deck B Jorhat was found to be 3 days overdue. Work at height continued by two contractors who stated the scaffold looked fine. Platform inspection had lapsed without renewal.",
        "asset_id": "DECK-B",
        "location": "Jorhat",
    },
]


def post_report(payload: dict) -> dict:
    """Submit a single report through the live API."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{BASE_URL}/reports",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"  ERROR {e.code}: {body[:200]}")
        return {}
    except Exception as e:
        print(f"  ERROR: {e}")
        return {}


def seed_group(name: str, reports: list, delay: float = 3.0):
    """Submit a group of reports with a small delay between each."""
    print(f"\n{'='*60}")
    print(f"  Seeding group: {name}  ({len(reports)} reports)")
    print(f"{'='*60}")
    for i, payload in enumerate(reports, 1):
        print(f"  [{i}/{len(reports)}] Submitting: {payload['report_text'][:70]}...")
        result = post_report(payload)
        if result.get("report_id"):
            status = result.get("status", "?")
            analysis = result.get("analysis") or {}
            print(f"         -> report_id={result['report_id']}")
            print(f"            status={status}, risk_level={analysis.get('risk_level','?')}, score={analysis.get('risk_score','?')}")
        else:
            print(f"         -> No report_id returned (pipeline may have errored)")
        if i < len(reports):
            print(f"         Waiting {delay}s before next report...")
            time.sleep(delay)
    print(f"\n  Group '{name}' done.")


if __name__ == "__main__":
    print("\nPrecursorAI — Tier 2 Demo Seeder")
    print("Submitting reports through the LIVE pipeline (embeddings will be saved)")
    print("Backend must be running at http://localhost:8000\n")

    # Quick health check
    try:
        with urllib.request.urlopen(f"http://localhost:8000/health", timeout=5) as r:
            health = json.loads(r.read())
            print(f"Backend health: {health}")
    except Exception:
        print("ERROR: Backend not reachable at http://localhost:8000")
        print("Start the backend first: venv\\Scripts\\python.exe -m uvicorn app.main:app --port 8000")
        sys.exit(1)

    seed_group("PUMP-102 — Recurring valve failures (5 reports)", PUMP_REPORTS, delay=4)
    seed_group("COMP-C3  — Emerging gas accumulation (4 reports)", COMPRESSOR_REPORTS, delay=4)
    seed_group("DECK-B   — Systemic PTW bypass (4 reports)", DECK_REPORTS, delay=4)

    print("\n" + "="*60)
    print("  All groups seeded!")
    print("  Now go to http://localhost:5173 -> Dashboard")
    print("  Click 'Run Pattern Analysis' to trigger Tier 2")
    print("="*60 + "\n")
