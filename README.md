# PrecursorAI — Master Plan (Locked)

_This supersedes all earlier drafts. Everything below is the current, final decision._

## 1. What it is

An AI-powered safety intelligence system for OIL that reads unstructured Unsafe Act, Unsafe Condition, and Near-Miss reports, understands what happened, and determines whether a report contains a **Serious Injury & Fatality (SIF)** precursor.

> **Tier 1 understands individual safety reports in real time. Tier 2 understands the collective story hidden across thousands of reports.**

**One-line pitch:** Tier 1 turns a single messy safety report into structured, RAG-grounded, explainable SIF intelligence. Tier 2 takes accumulated reports and finds recurring or emerging patterns no individual report reveals. **AI prioritizes — safety professionals decide.**

---

## 2. System Architecture (final, trimmed)

```
                         ┌──────────────────────┐
                         │      REACT UI        │
                         │ Submit Report         │
                         │ Dashboard             │
                         │ Alerts                │
                         │ Pattern Intelligence  │
                         └──────────┬────────────┘
                                    │
                              REST (polling, no WebSocket)
                                    │
                                    ▼
                     ┌─────────────────────────┐
                     │        FASTAPI          │
                     │  modular monolith        │
                     └────────────┬────────────┘
                                  │
              ┌───────────────────┴───────────────────┐
              ▼                                       ▼
       ┌───────────────┐                       ┌───────────────┐
       │    TIER 1     │                       │    TIER 2     │
       │ Single Report │                       │ Many Reports  │
       │ Preprocess    │                       │ SQL Stats     │
       │ Embedding     │                       │ Similarity    │
       │ RAG           │                       │ grouping      │
       │ Gemini        │                       │ (cosine +     │
       │ SIF Analysis  │                       │ connected     │
       │ Risk Engine   │                       │ components)   │
       │ IOGP Mapping  │                       │ Gemini        │
       │               │                       │ Cognition     │
       │               │                       │ Patterns      │
       └───────┬───────┘                       └───────┬───────┘
               │                                       │
               └───────────────────┬───────────────────┘
                                   ▼
                         ┌──────────────────┐
                         │   PostgreSQL     │
                         │   + pgvector     │
                         │ Reports          │
                         │ AI Analysis      │
                         │ Embeddings       │
                         │ Knowledge Base   │
                         │ Patterns         │
                         │ Alerts           │
                         └──────────────────┘
```

**What changed from the original design, and why:**

| Original                        | Final decision                                     | Why                                                                                           |
| ------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| WebSockets for live alerts      | Polling every 5–10s                                | Visually identical to a judge, far less to build/debug in 2–3 days                            |
| Redis (cache, pub/sub, locking) | Dropped entirely                                   | Not needed at demo scale (hundreds–low thousands of reports); was already flagged as optional |
| HDBSCAN/k-means clustering      | Cosine similarity threshold + connected components | Simpler to implement and debug, equally demoable, faster to tune                              |
| Separate vector DB              | pgvector inside Postgres                           | One less service to deploy                                                                    |

**Kept exactly as originally designed:** two-tier split, Gemini-for-understanding / Python-for-rules separation, deterministic risk engine gating the LLM, RAG grounding against IOGP Life-Saving Rules, human-in-the-loop review queue, full DB schema, `pattern_reports` traceability table.

---

## 3. Tier 1 — Real-Time SIF Triage

```
Worker submits report
        ↓
FastAPI receives + saves raw report
        ↓
Preprocessing → embedding
        ↓
RAG: cosine similarity → top 3–5 relevant IOGP/knowledge chunks
        ↓
Gemini analysis (structured JSON) using report + retrieved chunks
        ↓
Validation of JSON schema
        ↓
Deterministic Risk Engine (score, confidence threshold)
        ↓
IOGP Rule Mapping
        ↓
Save analysis
        ↓
 ┌───────────────┬─────────────────┐
Routine       Needs Review      High/SIF
 ↓               ↓                 ↓
Store          Human Review      Alert → Dashboard
```

**Gemini's job:** understanding — hazard, activity, energy source, barrier, barrier status, whether this looks like a SIF precursor, which IOGP rule applies, and why.

**Python's job:** rules and thresholds — risk score, confidence threshold, escalation logic. The LLM never decides the final risk level on its own.

**Tier 1 output schema:**

```json
{
  "sif_potential": true,
  "confidence_score": 0.91,
  "hazard": "Hydrocarbon exposure",
  "energy_source": "Pressurized hydrocarbon",
  "activity": "Maintenance",
  "asset": "P-17",
  "location": "Unit 4",
  "barrier": "Isolation",
  "barrier_status": "FAILED",
  "severity": "HIGH",
  "risk_score": 87,
  "life_saving_rules": ["Energy Isolation"],
  "rationale": "...",
  "requires_followup": false
}
```

**Human-in-the-loop:** if `confidence < threshold` or `requires_followup = true`, the report routes to a Safety Officer review queue instead of auto-closing. The system never presents itself as the final safety authority.

---

## 4. Tier 2 — Cognition Layer

```
Thousands of Reports
        ↓
Deterministic Statistics (reports/asset, /location, /hazard, /barrier,
  7-day vs 30-day counts, unique reporters, barrier failure frequency)
        ↓
Candidate Assets/Locations (crosses a min-count / min-frequency-change gate)
        ↓
Cosine similarity on existing embeddings
        ↓
Connected-components grouping → candidate pattern groups
        ↓
Gemini Cognition (given group + stats + counts + time info) →
  recurring issues / trends / potential contributing relationships
        ↓
Deterministic validation → Store Pattern → HSSE Alert
```

Different workers describe the same issue differently ("minor oil seepage," "hydrocarbon residue below P-17," "small leakage during maintenance") — embeddings catch what keyword matching misses. The stats gate runs **before** the LLM sees anything, so Gemini is only ever asked to reason about groups that already look statistically real — it never freelances on noise. Relationships Gemini surfaces are labeled **potential contributing factors**, never proven causality.

---

## 5. Database Schema (Postgres + pgvector)

```
users → reports ─┬─→ report_analysis
                  └─→ report_embeddings
                        ↓
                     (Tier 2)
                        ↓
                     patterns → pattern_reports → alerts

knowledge_chunks → knowledge_embeddings → (RAG)
```

- `users`: id, name, email, role, created_at
- `reports`: id, report_text, report_type, asset_id, location, submitted_by, created_at, status
- `report_analysis`: id, report_id, sif_potential, confidence, risk_score, risk_level, activity, hazard, energy_source, barrier, barrier_status, iogp_rule, severity, rationale, requires_followup, followup_question, created_at
- `report_embeddings`: id, report_id, embedding, model, created_at
- `knowledge_chunks`: id, chunk_id, title, chunk_text, source
- `knowledge_embeddings`: id, chunk_id, embedding, model
- `patterns`: id, pattern_type, title, description, asset_id, location, hazard, barrier, priority, confidence, report_count, first_seen, last_seen, status, evidence, created_at
- `pattern_reports`: pattern_id, report_id, similarity_score — this is what lets you answer "why did the AI create this pattern?" with exact evidence
- `alerts`: id, report_id, pattern_id, alert_type, severity, title, message, is_read, created_at

---

## 6. API Surface (final, no WebSocket)

```
POST /api/v1/reports
GET  /api/v1/reports
GET  /api/v1/reports/{id}

GET  /api/v1/dashboard/summary     ← polled by frontend every 5–10s

GET   /api/v1/alerts
PATCH /api/v1/alerts/{id}/read

GET /api/v1/patterns
GET /api/v1/patterns/{id}

POST /api/v1/cognition/sweep
GET  /api/v1/cognition/status
```

**Example — submit report:**

```json
// POST /api/v1/reports
{
  "report_type": "NEAR_MISS",
  "report_text": "Technician entered tank without gas testing.",
  "location": "Unit 4",
  "asset_id": "TANK-17"
}
```

```json
// Response
{
  "report_id": "abc123",
  "status": "ANALYZED",
  "analysis": {
    "sif_potential": true,
    "risk_level": "HIGH",
    "risk_score": 91,
    "iogp_rule": "Confined Space"
  }
}
```

---

## 7. Tech Stack (final)

- **Frontend:** React (Vite), REST via fetch/axios, polling instead of WebSocket
- **Backend:** FastAPI, modular monolith (`api/`, `services/`, `ai/`, `models/`, `schemas/`, `core/`)
- **DB:** PostgreSQL + pgvector — one database for relational and vector data, no separate vector DB
- **LLM:** Gemini, structured JSON output, used for Tier 1 classification and Tier 2 cognition
- **Explicitly dropped:** Spring Boot, Redis, WebSockets, HDBSCAN/k-means

---

## 8. File Structure

```
precursor-ai/
├── frontend/src/{components,pages,services,hooks,types}, App.jsx
├── backend/app/
│   ├── main.py
│   ├── api/{reports,dashboard,alerts,patterns,cognition}.py
│   ├── models/{report,analysis,embedding,pattern,alert}.py
│   ├── schemas/{report,analysis,pattern,dashboard}.py
│   ├── services/{report,triage,cognition,pattern,alert}_service.py
│   ├── ai/{gemini,preprocessing,embeddings,rag,classifier,risk_engine,cognition}.py
│   └── core/{config,database}.py
├── backend/scripts/{ingest_knowledge,generate_embeddings,seed_reports}.py
├── data/{knowledge,synthetic_reports}/
└── README.md
```

_(no `websocket/` or `redis.py` — cut along with those features)_

---

## 10. Day-by-Day Plan (2–3 days)

**Day 1 — Foundations (parallel):**

- A: FastAPI skeleton, reports endpoints, Gemini structured-extraction prompt, risk engine, stub RAG
- B: Full schema migration, synthetic generator (150–300 reports, 3–4 intentionally injected patterns), start knowledge base ingestion
- C: React scaffold, 4 views routed, Submission form against agreed contract, static Dashboard/Alerts with placeholder data
- D: Repo/CI setup, API contract doc, eval plan (what ground-truth labels the generator needs to emit)
- **Checkpoint:** submit → Gemini analysis → risk score → saved to DB, working end-to-end for one report

**Day 2 — Core intelligence:**

- A: Real embedding + top-k RAG retrieval wired in, human-in-the-loop review queue, error handling for malformed Gemini JSON
- B: Full dataset embedded, Tier 2 deterministic stats, similarity grouping, first pass of Gemini cognition prompt
- C: Dashboard + Alerts wired to real endpoints with polling, Pattern Intelligence view started
- D: Run eval script on Tier 1 output, start deck, pick 2–3 "hero" demo scenarios
- **Checkpoint:** Tier 2 sweep surfaces the injected patterns as real alerts, visible in the UI

**Day 3 — Polish, eval, demo prep (half day if 2.5–3 days total):**

- A: Edge-case bug fixes, tighten rationale text for on-screen readability
- B: False-positive suppression, threshold tuning, polish `pattern_reports` evidence display — your best differentiator
- C: Visual polish, risk-level color coding, working click-throughs on Report Details / View Evidence
- D: Finalize eval numbers in the deck, full dry-run with real seeded data (timed), record a fallback video
- **Checkpoint:** rehearsed run-through — live submit → flagged → contributes visibly to an existing pattern

---

## 11. Demo Script (5–7 min)

1. **Problem (30s)** — thousands of unstructured reports, precursors buried in noise
2. **Live Tier 1 (90s)** — submit a report live, show structured extraction + risk score + IOGP mapping + the RAG-retrieved rule text that justified it
3. **Human-in-the-loop (30s)** — a low-confidence report routed to review; "AI prioritizes, humans decide"
4. **Tier 2 (2 min)** — Pattern Intelligence view, click into a pre-seeded pattern's evidence, show the exact contributing reports
5. **Eval (30s)** — one slide: precision/recall on labeled synthetic data, how many injected patterns Tier 2 caught
6. **Close (30s)** — from recording incidents to preventing them

---

## 12. Risks & Mitigations

| Risk                                               | Mitigation                                                                                                                 |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Gemini returns malformed JSON                      | Strict schema in prompt + retry/repair + Python-side validation before the risk engine sees it                             |
| Synthetic data doesn't produce convincing patterns | Generator built Day 1, not Day 3 — leaves time to strengthen injected patterns                                             |
| Clustering surfaces noise, not real patterns       | Deterministic stats gate runs before Gemini cognition — LLM only reasons about groups that already look statistically real |
| Live demo API failure                              | Recorded fallback run ready by end of Day 2                                                                                |
| WebSocket/Redis creeping back in                   | Stretch goals only, touched solely if A/B/C finish early                                                                   |

---

## 13. Definition of Done

- Tier 1 working end-to-end on live input, with visible rationale and IOGP mapping
- Tier 2 sweep surfacing at least the injected patterns, with traceable evidence via `pattern_reports`
- Dashboard, Alerts, Patterns, Submission views all wired to real data
- One eval slide with real precision/recall numbers
- Rehearsed demo + recorded fallback

---

## Architecture

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React + Vite + Tailwind CSS         |
| Backend  | Python + FastAPI (modular monolith) |
| Database | PostgreSQL + pgvector               |
| AI       | Gemini + Embeddings + RAG           |

## Two-Tier System

- **Tier 1** — Real-time individual report analysis: preprocessing → embedding → RAG → Gemini → deterministic risk engine → SIF verdict
- **Tier 2** — Cognition layer: SQL stats → cosine similarity → connected components → Gemini pattern recognition → HSSE alerts

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 1. Start the database

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/Mac: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
uvicorn app.main:app --reload
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## API

Base URL: `http://localhost:8000/api/v1`

| Method | Endpoint           | Description                            |
| ------ | ------------------ | -------------------------------------- |
| POST   | /reports           | Submit a safety report                 |
| GET    | /reports           | List all reports                       |
| GET    | /reports/{id}      | Get report details                     |
| GET    | /dashboard/summary | Dashboard metrics                      |
| GET    | /alerts            | List alerts                            |
| PATCH  | /alerts/{id}/read  | Mark alert as read                     |
| GET    | /patterns          | List detected patterns                 |
| GET    | /patterns/{id}     | Pattern details + contributing reports |
| POST   | /cognition/sweep   | Trigger Tier 2 sweep                   |
| GET    | /cognition/status  | Cognition job status                   |

## Project Structure

```
precursorai/
├── frontend/          # React + Vite + Tailwind
├── backend/           # FastAPI modular monolith
│   └── app/
│       ├── api/       # Route handlers
│       ├── models/    # SQLAlchemy models
│       ├── schemas/   # Pydantic schemas
│       ├── services/  # Business orchestration
│       ├── ai/        # AI modules (Gemini, RAG, embeddings)
│       └── core/      # Config, database
├── data/              # Knowledge base & synthetic reports
└── docs/              # Documentation
```
