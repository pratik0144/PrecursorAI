# PROMPT 2 — BACKEND (copy-paste ready)

> **How to use:** Paste everything below the line into Claude Code / Cursor. It is written to **extend the existing PrecursorAI FastAPI backend** (FastAPI 0.115 · SQLAlchemy async · Pydantic v2 · pydantic-settings · asyncpg · pgvector · google-generativeai / Gemini 3.6 Flash · numpy) — **not** to rewrite it from scratch. It preserves the working two-tier pipeline and the "AI reasons, deterministic code decides" principle, and closes the documented gaps. Pair it with PROMPT 3 (database) — the schema it assumes is defined there.

---

## ROLE & GOAL

You are a senior backend engineer hardening and extending an existing FastAPI service into a **production-quality SIF (Serious Injury/Fatality) Precursor Intelligence backend** for oil & gas operations (first customer: Oil India Limited / OIL). The system ingests safety reports (safety observations, near-misses, unsafe acts, unsafe conditions, incidents), uses an LLM to *reason/extract*, and uses **deterministic Python to decide** classification and escalation. It has two tiers: **Tier 1 real-time triage** and **Tier 2 pattern intelligence**.

Preserve what works. Fix what's broken. Make it enterprise-grade, auditable, and secure.

### Non-negotiable domain rules (verified — keep intact)
- **Core SIF precursor logic is a strict AND:** `HIGH-ENERGY SOURCE + PERSON IN DANGER ZONE (line of fire) + FAILED/MISSING/BYPASSED BARRIER = SIF PRECURSOR`.
- **AI reasons, deterministic code decides.** The LLM (Gemini) extracts and explains; **Python deterministic engine sets `sif_classification`, `risk_score`, and `escalation_level`.** The LLM must never directly trigger an operational alert. Every escalation must be reproducible from stored inputs + a versioned ruleset.
- **Frameworks (real, use as taxonomy/ground truth):** DEKRA Martin & Black SIF-precursor concept; energy-based safety / high-energy threshold ~1,500 J (Hallowell / Construction Safety Research Alliance); EEI Safety Classification & Learning (SCL) model; **9 IOGP Life-Saving Rules**; India **OISD** layer (OISD term **"Hi-Po" = High-Potential near miss** ≈ PSIF).
- **The 9 IOGP Life-Saving Rules:** Bypassing Safety Controls, Confined Space, Driving, Energy Isolation, Hot Work, Line of Fire, Safe Mechanical Lifting, Work Authorisation, Working at Height.
- **Synthetic data stays synthetic.** Never fabricate real OIL operational data. Seed/demo records must be flagged synthetic.

### Provenance for the agent
Verified facts: the pipeline shape, the three-factor test, the 9 IOGP rules, OISD "Hi-Po", the energy-based-safety threshold, and the existing stack (all from project docs). **Design recommendations (not yet verified against OIL):** the exact classification enum values, score weights, decomposed two-pass extraction, and thresholds — implement them as **configurable + versioned**, not hardcoded magic numbers. **Must verify externally:** exact OISD standard numbers (leave them in a reference table to be filled/validated; do not invent authoritative citations).

---

## EXISTING BACKEND (what you're extending)

Layered app under `backend/app/`: `core/` (config via pydantic-settings, async SQLAlchemy engine, `init_db()` using `create_all()` on startup), `models/` (SQLAlchemy: Report, User, ReportAnalysis, ReportEmbedding, KnowledgeChunk, KnowledgeEmbedding, Pattern, PatternReport, Alert), `schemas/` (Pydantic v2), `api/` (reports, patterns, alerts, dashboard, cognition[stub]), `ai/` (gemini, preprocessing, embeddings, rag, classifier, risk_engine, pattern_analyzer, cognition[stub]), `services/` (report_service.`submit_and_analyze`, triage_service.`triage`, pattern_service.`run_sweep`, alert_service, dashboard_service). Config keys today: `DATABASE_URL`, `GEMINI_API_KEY`, `CONFIDENCE_THRESHOLD=0.75`, `RAG_TOP_K=5`, `COGNITION_SIMILARITY_THRESHOLD=0.80`, `COGNITION_MIN_REPORTS=3`.

**Documented gaps you MUST close:** no tests; no auth (client-side role only); no pagination; no Alembic migrations (schema via `create_all` — replace this); no WebSocket (7s polling); Tier 2 runs synchronously inside the request handler (must become a background job); duplicate/stub `cognition` endpoints (remove or merge into `patterns`); SHA256 pseudo-vector fallback pollutes vector search (must be quarantined); no rate limiting; no input validation; hardcoded CORS `localhost:5173`; `print()` instead of structured logging; no error-handling middleware (stack traces leak); `Settings` loads `.env` relative to CWD (make robust).

---

## TARGET ARCHITECTURE

- **Style:** modular monolith, clean layering `api → services → ai/domain → repository/models`. Async end-to-end (async SQLAlchemy 2.0, async LLM/HTTP). Keep it a single deployable FastAPI app + a worker process for background jobs.
- **Config:** `pydantic-settings`, env-driven, no CWD dependence (resolve `.env` by absolute path / env var). Typed settings object injected via dependency. Separate `development`/`staging`/`production` profiles. All thresholds/weights configurable **and versioned** (see Ruleset Versioning).
- **Migrations:** adopt **Alembic** as the source of truth. Stop using `create_all()` in app startup (keep an idempotent bootstrap only for local dev behind a flag). Provide an initial migration that reflects the current schema **plus** the new tables from PROMPT 3, written as additive, non-destructive migrations (do not drop existing data).
- **LLM provider abstraction:** introduce an `LLMProvider` interface (`generate_structured()`, `embed()`) with a **Gemini** implementation (default: `gemini-3.6-flash`, `gemini-embedding-001`) and a pluggable **on-prem** implementation (LLaMA-3 / vLLM / Ollama-compatible) for **PSU data sovereignty**. Provider chosen by config. This directly answers OIL's "where does our data go" question.
- **Observability:** structured JSON logging (`structlog` or stdlib `logging` + JSON formatter), request-id middleware, `/health` (liveness) + `/ready` (DB + LLM reachability), optional OpenTelemetry hooks, Prometheus-style `/metrics` (counts, latencies, LLM tokens).
- **Error handling:** global exception middleware → RFC-7807 problem+json responses, never leak stack traces in prod; validation errors → 422 with field detail; typed domain exceptions.
- **Docs:** rich OpenAPI (tags, examples, response models), served at `/docs`; export `openapi.json` for the frontend.

---

## TIER 1 — REAL-TIME TRIAGE (extend the existing pipeline)

Entry: `POST /api/v1/reports` → `report_service.submit_and_analyze()`. Keep the 9-step flow but upgrade it:

1. **Ingest & validate** the report (min length, content sanity, allowed `report_type`, resolve `asset`/`location` to FKs — see PROMPT 3). Persist raw report `status=PENDING`.
2. **Preprocess** text (existing: strip control chars, collapse whitespace, truncate ~4000 chars). Keep, but store both raw and cleaned.
3. **Embed** cleaned text via `LLMProvider.embed()`. **Change the embedding dimensionality to an indexable size (recommend 1536 via Matryoshka truncation) or store as `halfvec`** so pgvector can build an ANN index (see PROMPT 3 for the pgvector-dimension constraint). **Quarantine fallback vectors:** if the real embedding fails (quota/error), store the row with `embedding_status='DEGRADED'` and **exclude degraded vectors from RAG/clustering**; enqueue a re-embed job. Do NOT silently pollute vector search with SHA256 pseudo-vectors.
4. **RAG retrieve** top-K (config `RAG_TOP_K`) IOGP/OISD knowledge chunks via pgvector cosine. Record which chunk IDs were retrieved (for explainability + audit).
5. **LLM extraction — DECOMPOSED into two passes** (research-backed: accuracy degrades when one call does extraction + causal reasoning together):
   - **Pass A (cheap, high-accuracy structured extraction):** hazard, **energy source(s)** (typed, with magnitude if stated), activity/task, **person-in-danger-zone?**, **barrier(s) + per-barrier status** (`INTACT|DEGRADED|MISSING|BYPASSED|FAILED|UNKNOWN`), candidate **IOGP LSR(s)**, candidate **OISD/Hi-Po** flag, severity estimate. Output = strict JSON.
   - **Pass B (gated judgment — only runs if Pass A indicates a possible high-energy hazard):** SIF-potential reasoning + `rationale` + `confidence_score` + `requires_followup` + `followup_question`. Gating saves cost and improves auditability.
   - Support **multi-valued** energy sources / barriers / IOGP rules (the current schema is single-valued — fix per PROMPT 3).
6. **Pydantic v2 validation** of every LLM output against strict models; **retry once** on validation failure with a repair prompt; on second failure, mark `requires_followup=true` and route to REVIEW (never crash, never guess).
7. **Deterministic engine (the decider)** — see next section. Computes `sif_classification`, `risk_score`, `escalation_level`, ties to a `ruleset_version`.
8. **Persist** structured extraction, classification, and the deterministic decision as separate, queryable rows (not one blob) for traceability.
9. **Triage & alerting** (`triage_service`): set report status (`ANALYZED`/`REVIEW`), create `Alert` on `HIGH`/`CRITICAL`, write an **audit log** entry and an **llm_invocation** record for every model call. Emit a realtime event (WebSocket/SSE).

Latency: keep Tier 1 responsive; make Pass B and any heavy work cancellable/timeout-bounded. Measure and expose real p50/p95 latency (don't assert a number).

### Deterministic classification & scoring (extend, keep backward-compatible)
- **Three-factor test → precursor boolean:** `is_sif_precursor = high_energy_present AND person_in_danger_zone AND barrier_compromised` (compromised = status in {DEGRADED, MISSING, BYPASSED, FAILED}). Store the three booleans explicitly.
- **`sif_classification` enum (EEI SCL–aligned; implement as configurable mapping, documented):**
  - `HSIF` — high energy + serious/fatal outcome occurred.
  - `PSIF` — high energy + compromised/absent direct control + person exposed, **no serious outcome** (the precursor signal; ≈ OISD Hi-Po).
  - `LSIF` — serious outcome from low energy (anomaly bucket).
  - `CAPACITY` — high energy but an effective **direct control** was present (a success/learning event).
  - `EXPOSURE` — high energy + person exposed but barrier/control status unclear or partial (softer precursor).
  - `LOW_ENERGY` — no high-energy source (routine).
  - `UNDETERMINED` — insufficient info / low confidence → REVIEW.
  Clearly document that this mapping is a design recommendation to be calibrated with OIL, not a regulatory constant.
- **Risk score (keep the existing additive formula, make weights config + versioned):** `risk_score = barrier_weight + severity_weight + sif_bonus − confidence_penalty`, capped [0,100]. Defaults: barrier FAILED +40 / DEGRADED/MISSING/BYPASSED +20–40 / UNKNOWN +10 / INTACT 0; severity CRITICAL +30 / HIGH +20 / MEDIUM +10 / LOW +5; SIF bonus +30; confidence penalty if `confidence<0.6` up to −12.
- **Escalation level from score (config + versioned):** 80–100 `CRITICAL`(SIF), 60–79 `HIGH`, 40–59 `REVIEW`, 0–39 `ROUTINE`. **Recall-favoring (F2):** also force REVIEW when `confidence < CONFIDENCE_THRESHOLD (0.75)` OR `requires_followup=true` OR `sif_classification=UNDETERMINED`. Bias toward catching precursors over avoiding false alarms (missing a real SIF precursor is far costlier than a review), and log the false-positive/review burden this implies.
- **Double-lock:** an operational alert requires BOTH the deterministic precursor/classification AND the score threshold — the LLM alone can never open an alert.

---

## TIER 2 — PATTERN INTELLIGENCE (make it async + configurable)

Entry: `POST /api/v1/patterns/sweep` (enqueue) → background worker runs `pattern_service.run_sweep()`. **Move it off the request path** (currently synchronous). Also add a **scheduled weekly sweep**.

- **Phase B (deterministic candidate selection, SQL):** assets/locations with ≥ `COGNITION_MIN_REPORTS` in a rolling window (config).
- **Phase C (semantic clustering):** cluster candidate reports' stored embeddings (exclude DEGRADED vectors). Keep greedy single-linkage but make `COGNITION_SIMILARITY_THRESHOLD` (default 0.80) **configurable and documented as a value to calibrate** (do not present 0.80 as authoritative). Prefer using pgvector ANN for neighbor retrieval over full NumPy pairwise matrices at scale; keep NumPy path as fallback.
- **Phase D (LLM multi-report reasoning):** per cluster, summarize shared hazard/energy/barrier and propose `pattern_type` ∈ {RECURRING, EMERGING, COMPOUNDING, SYSTEMIC}, `ai_priority`, conclusion, evidence[], confidence. **`ai_priority` is advisory only.**
- **Phase E (deterministic cross-check — the decider):** final priority = f(ai_priority, count_7d, count_30d, distinct assets, barrier-compounding). E.g., accelerating (7-day ≥2) + AI HIGH/CRITICAL → CRITICAL; frequent (30-day ≥5) → HIGH; etc. Same "code decides" principle.
- **Phase F (persistence + traceability):** save `Pattern` + `PatternReport` join rows **with `similarity_score` and the exact contributing report IDs** (traceability is a core differentiator — safety officers are legally accountable). Link patterns to `location_id`/`asset` and summarize shared barriers (surface **compounding barrier failures** explicitly — the Baghjan-type scenario).
- Emit realtime events on new/updated patterns. Persist a `sweep_run` record (params, ruleset version, counts, duration) for audit.
- **Remove the duplicate `cognition` stub endpoints** (or alias them to `patterns` with deprecation).

---

## STRUCTURED EXTRACTION & PYDANTIC MODELS

Define strict Pydantic v2 models mirrored by frontend zod:
- `ExtractionPassA` (fields above, lists for multi-valued), `ExtractionPassB` (reasoning fields), `ClassificationResult` (three booleans + `sif_classification` + `risk_score` + `escalation_level` + `ruleset_version`), `PatternResult`. Use enums for all controlled vocabularies. Reject unknown enum values (LLM must map to the taxonomy). Store the raw LLM JSON alongside the validated object for audit.

## IOGP & OISD MAPPING

- Maintain reference tables (`iogp_rules` = the 9; `oisd_references` = OISD standards + the Hi-Po concept). Map each report to **zero-or-more** IOGP rules and OISD references via join tables. Energy Isolation ↔ LOTO, Line of Fire ↔ person-in-danger-zone, Working at Height/Confined Space/Hot Work etc. as extracted. Set the **OISD Hi-Po flag** when `sif_classification ∈ {PSIF, EXPOSURE, HSIF}`. **Leave exact OISD standard numbers to be validated** against the official OISD catalog (mark as `verified=false` until confirmed).

## EMBEDDINGS, CLUSTERING, VECTOR SEARCH

- One embedding pipeline for reports, knowledge chunks, and (optionally) pattern centroids, via `LLMProvider.embed()`. Standardize dimensionality to an **indexable** size (see PROMPT 3). Store model name + dimension + `embedding_status`. Provide a **backfill job** (`generate_embeddings` is currently a stub — implement it) to (re)embed reports missing/degraded vectors. Use pgvector cosine (`<=>`) with an ANN index; expose a `GET /reports/{id}/similar` neighbor endpoint (excludes degraded).

## ALERTS, AUDIT, SECURITY, JOBS

- **Alerts:** lifecycle status (`OPEN → ACKNOWLEDGED → IN_REVIEW → ESCALATED → CLOSED|DISMISSED`), assignee, SLA timers, source (report vs pattern). `PATCH /alerts/{id}` transitions write an `alert_event` + `audit_log`.
- **Audit logging:** append-only `audit_logs` for every decision and state change (who/role, what, before/after, ruleset_version, timestamp, request_id). Append-only `llm_invocations` for every LLM/embedding call (provider, model, prompt hash, token counts, latency, cost estimate, status, fallback_used). These make the system defensible.
- **Security:** JWT auth (access + refresh), **RBAC** roles (`HSSE_OFFICER`, `SITE_MANAGER`, `OPS_MANAGER`, `CORPORATE_LEADERSHIP`, `ADMIN`) enforced via FastAPI dependencies; per-request rate limiting (e.g., SlowAPI/Redis); strict input validation + payload size limits; secrets only via env/secret manager; security headers + tightened CORS (env-driven allowlist, not hardcoded); no stack-trace leakage; org-scoping on all queries to support DB **Row-Level Security** (see PROMPT 3); PII-aware logging (never log full narratives at INFO). Provide a clear path to run **fully on-prem** (local LLM + self-hosted Postgres) for the PSU deployment.
- **Background jobs:** introduce a worker (recommend **arq** or **Celery** with Redis; acceptable: FastAPI + APScheduler for a lightweight start). Jobs: Tier-2 sweep (on-demand + scheduled weekly), embedding backfill, alert-SLA escalation, knowledge re-ingestion. Return a `job_id`; expose `GET /jobs/{id}` status. Make sweeps idempotent and resumable.
- **Ruleset versioning:** store the deterministic config (weights, thresholds, enum mappings) as a versioned `ruleset_versions` row; stamp every classification/pattern with the version used so past decisions are reproducible.

## EVALUATION HARNESS (differentiator — include it)

Add an `eval/` module + endpoints/CLI to score the pipeline against a **labeled evaluation set** (150–300 hand-labeled synthetic narratives across all 9 LSRs, plus optionally OSHA Severe Injury public data). Report **precision / recall / F2** (optimize/report F2, per the VelocityEHS precedent — missing a precursor is costlier than a false alarm), a confusion matrix, and an estimated review burden. Store `eval_runs` + per-example results. This turns "it seems to work" into a defensible number.

---

## API CONTRACTS (versioned under `/api/v1`, paginated, filterable, OpenAPI-documented)

- **Reports:** `POST /reports` (submit → full pipeline; returns report + extraction + deterministic decision), `GET /reports` (paginate + filter by escalation, classification, LSR, energy type, barrier status, asset, location, date range, confidence, requires_followup), `GET /reports/{id}` (full detail incl. extraction, RAG evidence chunk ids, deterministic receipt, llm_invocation refs), `GET /reports/{id}/similar`.
- **Patterns:** `POST /patterns/sweep` (enqueue → job_id), `GET /patterns` (filter by type/priority/asset/location), `GET /patterns/{id}` (members + traceability), `GET /jobs/{id}`.
- **Alerts:** `GET /alerts` (filter by status/severity/assignee), `PATCH /alerts/{id}` (lifecycle transitions).
- **Dashboard/Analytics:** `GET /dashboard/summary` (KPIs + funnel: all → high-energy → SIF-potential → escalation), `GET /analytics/{trends|distributions|heatmaps}` (by LSR/location/asset/energy/barrier/time).
- **Geo (for the 3D globe):** `GET /geo/aggregate?level={world|country|region|site|asset}&...` returning aggregated **synthetic** precursor density/risk per node for map layers; `GET /geo/assets` with coordinates.
- **Reference:** `GET /reference/{iogp_rules|oisd|energy_sources|barriers|ruleset}`.
- **Auth:** `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`.
- **Realtime:** `WS /stream` (or SSE) broadcasting new reports, new/updated alerts, pattern updates; keep polling endpoints working as fallback.
- **System:** `/health`, `/ready`, `/metrics`, `/version` (app + ruleset version).
Consistent envelope, cursor or offset pagination, RFC-7807 errors, idempotency keys on `POST /reports`.

## TESTING & DELIVERABLES

- **Tests (currently zero):** unit tests for the deterministic engine (exhaustive on the three-factor + score/level boundaries — this is the auditable core), Pydantic validation/repair, triage routing; integration tests for Tier 1 (with a mocked `LLMProvider`) and Tier 2; contract tests for the API. Target meaningful coverage on `ai/risk_engine`, `services/*`, and classification mapping.
- Provide Alembic migrations, `.env.example` (all keys incl. `LLM_PROVIDER`, embedding dim, thresholds, ruleset version, JWT secrets, CORS allowlist, Redis URL), a `Makefile`/`justfile` (run api, run worker, migrate, seed, test, eval), Dockerfiles + updated `docker-compose` (api + worker + postgres/pgvector + redis), structured logging config, and a short `ARCHITECTURE.md` documenting the "AI reasons / code decides" boundary, the ruleset versioning, and the on-prem deployment path.
- **Do not break the existing frontend contract** during migration; keep `/api/v1/*` responses backward-compatible or version-bump deliberately and note it. Preserve/queue-migrate existing seeded data.
