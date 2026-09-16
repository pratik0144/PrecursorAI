# PrecursorAI — In-Depth Codebase Overview

> **Purpose of this document:** Give an LLM (or human) complete context to understand, navigate, and improve the PrecursorAI codebase. Every module, file, data flow, schema, prompt strategy, and known gap is documented here.

---

## 1. What PrecursorAI Is

An **AI-powered safety intelligence system** built for Oil India Limited (OIL). Oil field workers submit safety observations (unsafe acts, unsafe conditions, near-misses). The system:

- **Tier 1 (Real-time):** Classifies every incoming report for Serious Injury and Fatality (SIF) potential using Google Gemini + RAG, then computes a deterministic risk score.
- **Tier 2 (On-demand):** Sweeps historical reports to find recurring/emerging/systemic safety patterns across assets using semantic clustering + Gemini multi-report reasoning.

**Core design principle:** *AI reasons and explains. Deterministic Python code decides.* Gemini classifies hazards; Python computes risk scores and escalation levels. The LLM never makes the final call.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React, Vite, TailwindCSS v4, Recharts, Lucide Icons, Axios | React 19, Vite 8.2 |
| Backend | FastAPI, SQLAlchemy (async), Pydantic v2, Pydantic-Settings | FastAPI 0.115.0 |
| Database | PostgreSQL 16 + pgvector extension (Docker) | pgvector/pgvector:pg16 |
| AI / LLM | Google Gemini 3.6 Flash (`gemini-3.6-flash`) | google-generativeai 0.8.2 |
| Embeddings | Gemini Embedding 001 (`models/gemini-embedding-001`) | 3072-dimensional vectors |
| Vector Search | pgvector `<=>` cosine distance (native PostgreSQL) | pgvector 0.3.3 |
| Runtime | Python 3.12 (venv312), Node.js | — |

---

## 3. Project Structure

```
PrecursorAI/
├── backend/
│   ├── .env                          # Active environment config
│   ├── .env.example                  # Template with all config keys
│   ├── requirements.txt              # Python dependencies
│   ├── venv312/                      # Python 3.12 virtualenv (has all deps)
│   ├── venv/                         # Python 3.13 virtualenv (EMPTY — don't use)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry point + lifespan
│   │   ├── core/
│   │   │   ├── config.py             # Pydantic Settings (reads .env)
│   │   │   └── database.py           # Async SQLAlchemy engine + DB bootstrap
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── __init__.py           # Imports all models (triggers table registration)
│   │   │   ├── report.py             # Report, User models
│   │   │   ├── analysis.py           # ReportAnalysis model
│   │   │   ├── embedding.py          # ReportEmbedding model (Vector(3072))
│   │   │   ├── knowledge.py          # KnowledgeChunk, KnowledgeEmbedding models
│   │   │   ├── pattern.py            # Pattern, PatternReport models
│   │   │   └── alert.py              # Alert model
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   │   ├── report.py             # ReportCreate, ReportOut, ReportListOut
│   │   │   ├── analysis.py           # AnalysisOut
│   │   │   ├── pattern.py            # PatternOut, SweepResponse
│   │   │   ├── alert.py              # AlertOut
│   │   │   └── dashboard.py          # DashboardSummary
│   │   ├── api/                      # FastAPI route handlers
│   │   │   ├── reports.py            # POST/GET /reports, GET /reports/{id}
│   │   │   ├── patterns.py          # POST /patterns/sweep, GET /patterns
│   │   │   ├── alerts.py             # GET /alerts, PATCH /alerts/{id}/read
│   │   │   ├── dashboard.py          # GET /dashboard/summary
│   │   │   └── cognition.py          # POST /cognition/sweep (mocked/placeholder)
│   │   ├── ai/                       # AI pipeline modules
│   │   │   ├── gemini.py             # Gemini client init (get_client, get_genai)
│   │   │   ├── preprocessing.py      # Text cleaning (strip, collapse, truncate)
│   │   │   ├── embeddings.py         # Gemini embedding generation
│   │   │   ├── rag.py                # pgvector RAG retrieval (top-K chunks)
│   │   │   ├── classifier.py         # Tier 1 Gemini classification (few-shot)
│   │   │   ├── risk_engine.py        # Deterministic risk scoring
│   │   │   ├── pattern_analyzer.py   # Tier 2 Gemini multi-report reasoning
│   │   │   └── cognition.py          # Tier 2 placeholder/stub
│   │   └── services/                 # Business logic layer
│   │       ├── report_service.py     # submit_and_analyze() — full Tier 1 pipeline
│   │       ├── triage_service.py     # Route reports to REVIEW, create alerts
│   │       ├── pattern_service.py    # run_sweep() — full Tier 2 pipeline
│   │       ├── cognition_service.py  # Cognition service (stub)
│   │       ├── alert_service.py      # List/mark alerts
│   │       └── dashboard_service.py  # Aggregate dashboard metrics
│   ├── scripts/
│   │   ├── seed_reports.py           # Seed DB with pre-computed demo data
│   │   ├── seed_tier2_reports.py     # Seed via live API for Tier 2 testing
│   │   ├── ingest_knowledge.py       # Ingest PDFs → knowledge chunks + embeddings
│   │   └── generate_embeddings.py    # Stub (TODO: backfill embeddings)
│   └── tests/
│       └── __init__.py               # EMPTY — no tests written
├── frontend/
│   ├── package.json                  # React 19, Vite 8.2, Recharts, Axios
│   ├── vite.config.js                # Proxy /api → localhost:8000
│   ├── index.html                    # Entry point
│   └── src/
│       ├── main.jsx                  # ReactDOM.createRoot
│       ├── App.jsx                   # Router + role-based auth gate
│       ├── App.css / index.css       # Base styles
│       ├── assets/
│       │   └── image1.png            # Hero background
│       ├── hooks/
│       │   └── usePolling.js         # Custom hook (7s interval polling)
│       ├── ops/
│       │   ├── UI.jsx                # PageHeader reusable component
│       │   └── styles/
│       │       ├── base.css          # Theme variables, glassmorphism, fonts
│       │       ├── dashboard.css     # Dashboard-specific styles
│       │       ├── reports.css       # Reports page styles
│       │       └── intelligence.css  # Cognition page styles
│       ├── pages/
│       │   ├── Dashboard.jsx         # Metrics + PieChart (risk distribution)
│       │   ├── Reports.jsx           # Report submission (USER) / list (ADMIN)
│       │   ├── ReportDetails.jsx     # Full report + AI analysis view
│       │   ├── Alerts.jsx            # Alert feed with dismiss
│       │   └── Cognition.jsx         # Tier 2 patterns + sweep trigger
│       └── services/
│           └── api.js                # Axios API client (all endpoints)
├── data/
│   ├── knowledge/                    # PDFs for RAG ingestion (gitignored)
│   └── synthetic_reports/            # JSON test data (gitignored)
├── docs/                             # Empty (gitkeep only)
├── docker-compose.yml                # pgvector PostgreSQL container
├── install_pgvector.ps1              # Windows pgvector installer script
├── .gitignore
└── README.md
```

---

## 4. Database Schema

### Entity-Relationship Diagram

```mermaid
erDiagram
    USERS {
        UUID id PK
        VARCHAR name
        VARCHAR email
        VARCHAR role
        TIMESTAMPTZ created_at
    }

    REPORTS {
        UUID id PK
        TEXT report_text
        VARCHAR report_type
        VARCHAR asset_id
        VARCHAR location
        VARCHAR submitted_by
        VARCHAR status
        TIMESTAMPTZ created_at
    }

    REPORT_ANALYSIS {
        UUID id PK
        UUID report_id FK
        BOOLEAN sif_potential
        FLOAT confidence
        FLOAT risk_score
        VARCHAR risk_level
        VARCHAR activity
        VARCHAR hazard
        VARCHAR energy_source
        VARCHAR barrier
        VARCHAR barrier_status
        VARCHAR iogp_rule
        VARCHAR severity
        TEXT rationale
        BOOLEAN requires_followup
        TEXT followup_question
    }

    REPORT_EMBEDDINGS {
        UUID id PK
        UUID report_id FK
        VECTOR_3072 embedding
        VARCHAR model
    }

    KNOWLEDGE_CHUNKS {
        UUID id PK
        VARCHAR chunk_id
        VARCHAR title
        TEXT chunk_text
        VARCHAR source
    }

    KNOWLEDGE_EMBEDDINGS {
        UUID id PK
        UUID chunk_id FK
        VECTOR_3072 embedding
        VARCHAR model
    }

    PATTERNS {
        UUID id PK
        VARCHAR pattern_type
        VARCHAR title
        TEXT description
        VARCHAR asset_id
        VARCHAR location
        VARCHAR hazard
        VARCHAR barrier
        VARCHAR priority
        FLOAT confidence
        INT report_count
        TIMESTAMPTZ first_seen
        TIMESTAMPTZ last_seen
        VARCHAR status
        JSON evidence
    }

    PATTERN_REPORTS {
        UUID pattern_id FK
        UUID report_id FK
        FLOAT similarity_score
    }

    ALERTS {
        UUID id PK
        UUID report_id FK
        UUID pattern_id FK
        VARCHAR alert_type
        VARCHAR severity
        VARCHAR title
        TEXT message
        BOOLEAN is_read
        TIMESTAMPTZ created_at
    }

    REPORTS ||--o| REPORT_ANALYSIS : "has one"
    REPORTS ||--o| REPORT_EMBEDDINGS : "has one"
    REPORTS ||--o{ ALERTS : "triggers"
    REPORTS }o--o{ PATTERNS : "linked via PATTERN_REPORTS"
    PATTERNS ||--o{ ALERTS : "triggers"
    KNOWLEDGE_CHUNKS ||--o| KNOWLEDGE_EMBEDDINGS : "has one"
```

> **Note:** The `USERS` table exists in the ORM but is not actively used — there is no authentication system. The `submitted_by` field on reports is a free-text string.

---

## 5. Tier 1 Pipeline — Real-Time Single-Report Analysis

**Trigger:** `POST /api/v1/reports`
**Entry point:** `report_service.submit_and_analyze()`

```mermaid
flowchart TD
    A["POST /api/v1/reports"] --> B["1. Save Report to DB status=PENDING"]
    B --> C["2. Preprocessing preprocessing.py"]
    C --> D["3. Generate Embedding embeddings.py"]
    D --> E["4. Save ReportEmbedding to DB"]
    E --> F["5. RAG Retrieval rag.py top-5 knowledge chunks"]
    F --> G["6. Gemini Classification classifier.py"]
    G --> H["7. Validate GeminiAnalysisOutput Pydantic"]
    H --> I["8. Deterministic Risk Engine risk_engine.py"]
    I --> J["9. Save ReportAnalysis to DB"]
    J --> K["10. Triage and Alerting triage_service.py"]
    K --> L["Report status ANALYZED or REVIEW"]

    G -.->|"Rate limited / error"| G2["Heuristic Fallback keyword-based"]
    G2 --> H

    D -.->|"Rate limited"| D2["SHA256 Deterministic Vector Fallback"]
    D2 --> E
```

### 5.1 Preprocessing (`ai/preprocessing.py`)

- Strips control characters
- Collapses multiple whitespace to single spaces
- Truncates text to **4000 characters**
- Input: raw `report_text` string
- Output: cleaned string

### 5.2 Embedding Generation (`ai/embeddings.py`)

- Model: `models/gemini-embedding-001`
- Output: **3072-dimensional float vector**
- **Fallback:** If Gemini quota is exceeded (`ResourceExhausted`), generates a deterministic pseudo-vector from SHA256 hash of the text. This allows the pipeline to continue without crashing, but degrades semantic search quality.

### 5.3 RAG Retrieval (`ai/rag.py`)

- Uses pgvector's `<=>` cosine distance operator
- Queries `knowledge_embeddings` joined with `knowledge_chunks`
- Returns **top-K** (default 5) most similar IOGP/OIL safety rule chunks
- These chunks are injected verbatim into the Gemini classification prompt

### 5.4 Gemini Classification (`ai/classifier.py`)

- Model: `gemini-3.6-flash`
- **Prompt strategy:** System prompt with:
  - Role definition ("expert safety analyst for oil and gas")
  - SIF three-factor test definition (energy source + person in proximity + barrier failed)
  - IOGP Life-Saving Rules reference
  - RAG context chunks (injected dynamically)
  - **8 few-shot examples** (3 SIF-positive, 5 non-SIF)
  - Structured JSON output format specification
- **Output schema (`GeminiAnalysisOutput`):**

| Field | Type | Description |
|---|---|---|
| `sif_potential` | bool | Meets the three-factor SIF test? |
| `confidence_score` | float (0-1) | Classification certainty |
| `hazard` | str | Specific hazard type |
| `energy_source` | str | Energy type and magnitude |
| `activity` | str | What the worker was doing |
| `barrier` | str | Safety control that should prevent harm |
| `barrier_status` | enum | `INTACT` / `DEGRADED` / `FAILED` / `UNKNOWN` |
| `severity` | enum | `LOW` / `MEDIUM` / `HIGH` / `CRITICAL` |
| `life_saving_rules` | str | Which IOGP rule applies |
| `rationale` | str | 1-3 sentence explanation citing report evidence |
| `requires_followup` | bool | Insufficient info to classify confidently? |
| `followup_question` | str | Specific question for Safety Officer |

- **Fallback:** If Gemini is rate-limited, a **heuristic keyword-based classifier** runs instead (searches for keywords like "H2S", "fall", "LOTO", "crane" etc. and maps them to hazard categories with conservative risk estimates).

### 5.5 Risk Engine (`ai/risk_engine.py`)

**Deterministic — AI never sets this.**

```
risk_score = barrier_weight + severity_weight + sif_bonus - confidence_penalty
```

| Factor | Values |
|---|---|
| Barrier | FAILED=+40, DEGRADED=+20, UNKNOWN=+10, INTACT=+0 |
| Severity | CRITICAL=+30, HIGH=+20, MEDIUM=+10, LOW=+5 |
| SIF bonus | +30 if `sif_potential=true` |
| Confidence penalty | if `confidence < 0.6` then subtract `(0.6 - conf) x 20` (max -12) |
| **Score capped at [0, 100]** | |

| Score Range | Risk Level | Action |
|---|---|---|
| 80-100 | `SIF` | Alert created, immediate escalation |
| 60-79 | `HIGH` | Alert created, dashboard flagged |
| 40-59 | `REVIEW` | Routed to Safety Officer queue |
| 0-39 | `ROUTINE` | Stored, no immediate escalation |

### 5.6 Triage and Alerting (`services/triage_service.py`)

- Routes report to `REVIEW` status if:
  - `confidence < 0.75` (configurable via `CONFIDENCE_THRESHOLD`), OR
  - `requires_followup = true`
- Otherwise sets status to `ANALYZED`
- Creates an `Alert` record if risk level is `HIGH` or `SIF`

---

## 6. Tier 2 Pipeline — Historical Pattern Sweep

**Trigger:** `POST /api/v1/patterns/sweep`
**Entry point:** `pattern_service.run_sweep()`

```mermaid
flowchart TD
    A["POST /patterns/sweep"] --> B["Phase B: Deterministic Counting SQL"]
    B --> C["Phase C: Semantic Clustering NumPy"]
    C --> D["Phase D: Gemini Multi-Report Reasoning"]
    D --> E["Phase E: Rules Engine Cross-Check"]
    E --> F["Phase F: Persistence Pattern + PatternReport"]
```

### Phase B — Deterministic Counting

```sql
SELECT asset_id, COUNT(*) FROM reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY asset_id HAVING COUNT(*) >= 3
```

Produces a candidate shortlist of asset_ids with enough report volume.

### Phase C — Semantic Clustering

- Fetches stored `report_embeddings` (3072-dim vectors) for each candidate's reports
- Computes **pairwise cosine similarity** matrix using NumPy
- **Greedy single-linkage clustering:** A report joins a cluster if similarity to *any existing member* >= `COGNITION_SIMILARITY_THRESHOLD` (0.80)
- This catches semantically similar reports even with completely different wording (e.g., "oil dripping" and "hydrocarbon accumulation")

**Cosine similarity formula:**

```
similarity(a, b) = (a . b) / (||a|| x ||b||)
```

### Phase D — Gemini Multi-Report Reasoning

- For each cluster, builds a prompt containing ALL report texts + counts
- Uses **3 few-shot examples** covering `RECURRING`, `EMERGING`, and `SYSTEMIC` patterns
- **Output schema (`GeminiPatternOutput`):**

| Field | Type | Description |
|---|---|---|
| `pattern_type` | enum | `RECURRING` / `EMERGING` / `COMPOUNDING` / `SYSTEMIC` |
| `hazard` | str | Shared hazard across the cluster |
| `ai_priority` | enum | Suggested priority (cross-checked before use) |
| `conclusion` | str | 2-4 sentence pattern explanation |
| `evidence` | list of str | 3-5 supporting facts from reports |
| `confidence` | float (0-1) | |

### Phase E — Rules Engine Cross-Check

The AI's `ai_priority` is **never used directly**:

| Condition | Final Priority |
|---|---|
| AI says HIGH/CRITICAL **AND** 7-day count >= 2 (accelerating) | `CRITICAL` |
| AI says HIGH/CRITICAL **OR** 30-day count >= 5 (frequent) | `HIGH` |
| AI says MEDIUM **OR** 30-day count >= 3 (threshold) | `MEDIUM` |
| Otherwise | `LOW` |

### Phase F — Persistence

Saves `Pattern` row + `PatternReport` join rows (with `similarity_score` for traceability).

### Pattern Types

| Type | Meaning |
|---|---|
| `RECURRING` | Same failure mode repeating on same asset |
| `EMERGING` | Warning signals escalating in frequency/severity |
| `COMPOUNDING` | Multiple separate failures on same asset creating combined SIF risk |
| `SYSTEMIC` | Same procedural failure across many assets/locations |

---

## 7. API Reference

### Reports (Tier 1)

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/api/v1/reports` | Submit report, triggers full Tier 1 pipeline | `ReportCreate` (report_text, report_type, asset_id, location, submitted_by) | `ReportOut` with nested `AnalysisOut` |
| `GET` | `/api/v1/reports` | List all reports | — | `list[ReportListOut]` |
| `GET` | `/api/v1/reports/{id}` | Full report detail + AI analysis | — | `ReportOut` with nested `AnalysisOut` |

### Patterns (Tier 2)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/patterns/sweep` | Trigger full Tier 2 sweep (Phases B-F) |
| `GET` | `/api/v1/patterns` | List discovered patterns |
| `GET` | `/api/v1/patterns/{id}` | Pattern detail + contributing report IDs |

### Dashboard and Alerts

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/dashboard/summary` | Live metrics (risk breakdown, top hazards, top assets) |
| `GET` | `/api/v1/alerts` | List alerts (filterable by `unread_only`) |
| `PATCH` | `/api/v1/alerts/{id}/read` | Mark alert as read |

### Cognition (Placeholder)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/cognition/sweep` | Placeholder — returns NotImplemented or mocked response |
| `GET` | `/api/v1/cognition/status` | Placeholder — intended for background job status |

---

## 8. Frontend Architecture

### Routing and Auth

- **No real authentication** — `App.jsx` shows a role selection screen (USER / ADMIN) on first load
- `role` state lives in `App.jsx` as local React state — **refreshing the page resets to role selection**
- No JWT, no sessions, no API keys

**ADMIN Routes:**
| Route | Component | API Calls |
|---|---|---|
| `/` | `Dashboard.jsx` | `GET /dashboard/summary` (polled 7s) |
| `/reports` | `Reports.jsx` | `GET /reports` |
| `/reports/:id` | `ReportDetails.jsx` | `GET /reports/:id` |
| `/alerts` | `Alerts.jsx` | `GET /alerts` (polled 7s), `PATCH /alerts/:id/read` |
| `/cognition` | `Cognition.jsx` | `GET /patterns`, `GET /patterns/:id`, `POST /patterns/sweep` |

**USER Routes:**
| Route | Component | API Calls |
|---|---|---|
| `/` | `Reports.jsx` | `POST /reports` (submission form) |
| `*` | Redirect to `/` | — |

### Pages Detail

| Page | Key Features |
|---|---|
| **Dashboard** | Metric cards (total reports, today's intake, SIF count, active alerts), PieChart (risk distribution via Recharts), top assets table, top hazards table |
| **Reports (ADMIN)** | Table of all reports: type, asset/location, date, AI status badge |
| **Reports (USER)** | Submission form: report text, type dropdown, asset ID, location |
| **Report Detail** | Side-by-side layout: raw report info + AI analysis (risk score, confidence %, hazard, energy source, barrier status, IOGP rule, rationale, follow-up question) |
| **Alerts** | Alert cards grouped by severity (Critical/High/Medium/Low), dismiss button |
| **Cognition** | Pattern cards with type/priority/search filters, expandable detail showing AI synthesis, evidence list, contributing reports with similarity scores |

### API Client (`services/api.js`)

Axios-based. All calls go through `/api/v1/...` which Vite proxies to `localhost:8000`.

### Polling (`hooks/usePolling.js`)

Custom React hook using `setInterval` at **7-second intervals**. Used by Dashboard and Alerts pages. **No WebSocket support** — pure HTTP polling.

### Styling

- **TailwindCSS v4** via `@tailwindcss/vite` plugin
- Heavy custom CSS in `src/ops/styles/`:
  - `base.css`: "Warm Cream + Amber Glass" theme, CSS variables, glassmorphism (`backdrop-filter: blur(20px)`), gradients
  - Custom fonts: Space Grotesk, Inter, JetBrains Mono
  - Separate CSS files per page section

### State Management

- **No global state library** (no Redux, Zustand, Context API)
- All state is local via `useState` / `useEffect` / `useCallback`
- `role` is the only "global" state, passed as props from `App.jsx`

---

## 9. Configuration

### `backend/.env`

```env
DATABASE_URL=postgresql+asyncpg://precursor:precursor_dev@localhost:5433/precursorai
GEMINI_API_KEY=<your_key>
APP_ENV=development
LOG_LEVEL=INFO
CONFIDENCE_THRESHOLD=0.75         # Below this -> route report to REVIEW
RAG_TOP_K=5                       # Knowledge chunks injected per Gemini prompt
COGNITION_SIMILARITY_THRESHOLD=0.80  # Cosine similarity for clustering
COGNITION_MIN_REPORTS=3           # Min reports on same asset to be a Tier 2 candidate
```

### Config Class (`core/config.py`)

Uses `pydantic-settings` `BaseSettings` with `SettingsConfigDict(env_file=".env")`. The `.env` file is loaded relative to the working directory (must run uvicorn from `backend/`).

---

## 10. Infrastructure

### Docker Compose

Single container: `pgvector/pgvector:pg16` on host port **5433** (remapped from 5432 to avoid conflict with local Homebrew PostgreSQL).

Credentials: `precursor` / `precursor_dev` / `precursorai`

### Database Bootstrap (`core/database.py`)

On app startup (FastAPI `lifespan` event), `init_db()` runs:
1. Connects to `postgres` admin DB via raw `asyncpg`, creates `precursorai` DB if missing
2. Connects to `precursorai`, runs `CREATE EXTENSION IF NOT EXISTS vector`
3. Calls `Base.metadata.create_all()` — if pgvector is unavailable, skips vector tables gracefully with a warning

### Scripts

| Script | Purpose | Method |
|---|---|---|
| `ingest_knowledge.py` | Ingest PDFs -> 300-word chunks -> Gemini embeddings -> `knowledge_chunks` + `knowledge_embeddings` | Raw `asyncpg` + `pymupdf`, batch size 20, exponential backoff |
| `seed_reports.py` | Seed 15 SIF + 40 Routine pre-computed reports + analyses + alerts for demo | Direct SQLAlchemy (bypasses API, no Gemini needed) |
| `seed_tier2_reports.py` | Seed 3 pattern clusters via live API (generates real embeddings) | HTTP POST to `/api/v1/reports` |
| `generate_embeddings.py` | Backfill embeddings for existing reports | **Stub — TODO, not implemented** |

---

## 11. Dependencies (`requirements.txt`)

```
fastapi==0.115.0
uvicorn[standard]
pydantic
pydantic-settings
sqlalchemy[asyncio]
asyncpg
alembic
pgvector==0.3.3
google-generativeai==0.8.2
numpy
python-dotenv
httpx
python-multipart
pymupdf
```

> **Note:** `alembic` is listed but no migration files exist — all schema changes happen via `create_all()` on startup.

---

## 12. End-to-End Data Flows

### Report Submission Flow

```
User fills form -> POST /api/v1/reports
  -> api/reports.py router
    -> report_service.submit_and_analyze()
      -> Save Report (PENDING)
      -> preprocessing.preprocess(text)
      -> embeddings.generate_embedding(cleaned_text)
      -> Save ReportEmbedding
      -> rag.retrieve_context(embedding, top_k=5)
      -> classifier.classify(cleaned_text, rag_chunks)
      -> Pydantic validation of GeminiAnalysisOutput
      -> risk_engine.compute_risk_score(analysis)
      -> risk_engine.determine_risk_level(score)
      -> Save ReportAnalysis
      -> triage_service.triage(report, analysis)
        -> Update Report status (ANALYZED / REVIEW)
        -> Create Alert if HIGH/SIF
      -> Return ReportOut with nested AnalysisOut
```

### Dashboard Polling Flow

```
Dashboard.jsx usePolling(getDashboardSummary, 7000)
  -> GET /api/v1/dashboard/summary
    -> dashboard_service.get_summary(db)
      -> SQL aggregations: COUNT by risk_level, GROUP BY hazard, GROUP BY asset_id
      -> Return DashboardSummary
  -> setState -> re-render metrics + PieChart
```

### Pattern Sweep Flow

```
Cognition.jsx -> "Run Sweep" button -> POST /api/v1/patterns/sweep
  -> pattern_service.run_sweep(db)
    -> Phase B: SQL COUNT per asset_id (30 days, threshold >= 3)
    -> Phase C: For each candidate:
        -> Fetch report_embeddings from DB
        -> NumPy cosine similarity matrix
        -> Single-linkage clustering (threshold >= 0.80)
    -> Phase D: For each cluster:
        -> Build multi-report Gemini prompt
        -> Parse GeminiPatternOutput
    -> Phase E: Rules engine cross-check
        -> Final priority = f(ai_priority, count_30d, count_7d)
    -> Phase F: Save Pattern + PatternReport rows
  -> Return SweepResponse (patterns_found, details)
```

---

## 13. File-by-File Quick Reference

### Backend — AI Layer

| File | Purpose | Key Functions |
|---|---|---|
| `ai/gemini.py` | Gemini SDK init | `get_client()` returns GenerativeModel, `get_genai()` returns module |
| `ai/preprocessing.py` | Text cleaning | `preprocess(text)` returns cleaned string |
| `ai/embeddings.py` | Vector generation | `generate_embedding(text)` returns list of float (3072-dim) |
| `ai/rag.py` | RAG retrieval | `retrieve_context(embedding, db, top_k)` returns list of chunk dicts |
| `ai/classifier.py` | Tier 1 classification | `classify(text, rag_chunks)` returns GeminiAnalysisOutput |
| `ai/risk_engine.py` | Deterministic scoring | `compute_risk_score(analysis)` returns float, `determine_risk_level(score)` returns str |
| `ai/pattern_analyzer.py` | Tier 2 reasoning | `analyze_cluster(reports)` returns GeminiPatternOutput |
| `ai/cognition.py` | Stub/placeholder | No real logic |

### Backend — Services

| File | Purpose | Key Functions |
|---|---|---|
| `services/report_service.py` | Full Tier 1 orchestration | `submit_and_analyze(db, report_data)` |
| `services/triage_service.py` | Routing + alerting | `triage(db, report, analysis)` |
| `services/pattern_service.py` | Full Tier 2 orchestration | `run_sweep(db)` |
| `services/alert_service.py` | Alert CRUD | `list_alerts(db)`, `mark_read(db, id)` |
| `services/dashboard_service.py` | Dashboard metrics | `get_summary(db)` |
| `services/cognition_service.py` | Stub | — |

### Frontend — Pages

| File | Route | Role | API Calls |
|---|---|---|---|
| `Dashboard.jsx` | `/` | ADMIN | `GET /dashboard/summary` (polled) |
| `Reports.jsx` | `/reports` or `/` | ADMIN: list, USER: submit | `GET /reports`, `POST /reports` |
| `ReportDetails.jsx` | `/reports/:id` | ADMIN | `GET /reports/:id` |
| `Alerts.jsx` | `/alerts` | ADMIN | `GET /alerts` (polled), `PATCH /alerts/:id/read` |
| `Cognition.jsx` | `/cognition` | ADMIN | `GET /patterns`, `GET /patterns/:id`, `POST /patterns/sweep` |

---

## 14. Known Gaps and Improvement Areas

### Critical Gaps

| Area | Issue | Impact |
|---|---|---|
| **No tests** | `backend/tests/` is empty | Zero test coverage — any refactor is blind |
| **No authentication** | Role is client-side only, no JWT/session/API keys | Anyone can submit reports or trigger sweeps |
| **No pagination** | `GET /reports` returns all rows | Will break with scale |
| **No Alembic migrations** | Schema managed by `create_all()` | No way to evolve schema without dropping tables |
| **No WebSocket** | Dashboard/Alerts use 7s HTTP polling | Unnecessary load, delayed updates |
| **No background jobs** | Tier 2 sweep runs synchronously in request handler | Long-running sweeps block the HTTP response |
| **Cognition API is a stub** | `/api/v1/cognition/sweep` and `/cognition/status` are mocked | Duplicate/dead endpoint alongside `/patterns/sweep` |

### Code Quality

| Area | Issue |
|---|---|
| **Fallback vectors** | SHA256-based pseudo-vectors when Gemini quota is hit are not semantically meaningful — pollutes vector search |
| **No rate limiting** | No rate limiting on API endpoints |
| **No input validation** | Report text has no minimum length or content validation |
| **Hardcoded CORS** | Only allows `localhost:5173` |
| **No logging framework** | Uses `print()` statements instead of structured logging |
| **No error handling middleware** | Exceptions may leak stack traces |
| **Dead code** | `ai/cognition.py` is a placeholder with no real logic |
| **Config loading** | `Settings` loads `.env` relative to CWD, fragile depending on how uvicorn is started |

### Frontend Gaps

| Area | Issue |
|---|---|
| **No persistent auth** | Refreshing page resets role selection |
| **No error boundaries** | API failures may crash components |
| **No loading skeletons** | Pages show nothing while data loads |
| **No responsive design** | Not verified for mobile/tablet |
| **Single chart** | Only one PieChart on Dashboard — no trend lines, no time series |
| **No data export** | Cannot export reports or patterns |

### Data and Knowledge Base

| Area | Issue |
|---|---|
| **No PDFs committed** | `data/knowledge/` is gitignored and empty — RAG will not work without ingestion |
| **No docs** | `docs/` directory is empty |
| **Scripts gitignored** | `ingest_knowledge.py`, `seed_reports.py` are in `.gitignore` — will not be shared with collaborators |

---

## 15. How to Run

### Prerequisites
- Docker Desktop (for PostgreSQL + pgvector)
- Python 3.12
- Node.js

### Start Database
```bash
cd PrecursorAI
docker-compose up -d
# PostgreSQL available at localhost:5433
```

### Start Backend
```bash
cd PrecursorAI/backend
./venv312/bin/python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
# API at http://localhost:8000
# Swagger docs at http://localhost:8000/docs
```

### Start Frontend
```bash
cd PrecursorAI/frontend
npm run dev
# UI at http://localhost:5173
```

### Seed Demo Data (Optional)
```bash
cd PrecursorAI/backend
./venv312/bin/python -m scripts.seed_reports      # Pre-computed reports (no Gemini needed)
./venv312/bin/python -m scripts.seed_tier2_reports # Via live API (needs Gemini key + running backend)
```

### Ingest Knowledge Base (Optional)
```bash
# Place PDF files in data/knowledge/
cd PrecursorAI/backend
./venv312/bin/python scripts/ingest_knowledge.py
```
