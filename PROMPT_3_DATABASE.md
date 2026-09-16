# PROMPT 3 — DATABASE (copy-paste ready)

> **How to use:** Paste everything below the line into Claude Code / Cursor. It defines the **PostgreSQL 16 + pgvector** schema that PROMPT 2 (backend) assumes, framed as an **additive, non-destructive evolution of the existing PrecursorAI schema** (which currently has: `users`, `reports`, `report_analysis`, `report_embeddings`, `knowledge_chunks`, `knowledge_embeddings`, `patterns`, `pattern_reports`, `alerts`, all created via `create_all()` with **no migrations**). Deliver everything as **Alembic migrations** plus seed scripts.

---

## ROLE & GOAL

You are a senior data engineer designing the production database for a **SIF (Serious Injury/Fatality) Precursor Intelligence platform** for oil & gas operations (first customer: Oil India Limited / OIL). Evolve the existing minimal schema into a normalized, auditable, secure, geo-aware schema that supports: real-time triage, deterministic classification, IOGP/OISD mapping, vector search, pattern intelligence, alerts, full audit, and a World→Country→Region→Field/Site→Asset→Incident drill-down for a 3D globe UI.

**Deliver as Alembic migrations** (the project currently has `alembic` installed but zero migration files and relies on `create_all()` — replace that). Migrations must be **additive and non-destructive**: preserve existing rows, keep legacy columns during transition, backfill new FKs best-effort.

### Ground rules
- **Model the core safety logic in the data:** every report analysis stores the three booleans `high_energy_present`, `person_in_danger_zone`, `barrier_compromised` and their derived `sif_classification` — because `HIGH-ENERGY SOURCE + PERSON IN DANGER ZONE + FAILED/MISSING/BYPASSED BARRIER = SIF PRECURSOR`.
- **AI reasons, deterministic code decides:** store the raw LLM output *and* the deterministic decision *and* the `ruleset_version` used, so every decision is reproducible and auditable.
- **Reference frameworks as data:** IOGP Life-Saving Rules (the 9), OISD references (incl. the "Hi-Po / High-Potential near miss" concept), an energy-source taxonomy (with a high-energy threshold ~1,500 J flag), and a barrier/control catalog (marking EEI-SCL "direct controls").
- **Synthetic is synthetic:** all demo rows carry `is_synthetic=true` (and/or live under a dedicated demo organization). Real India locations are fine; **all counts/risk values are synthetic**. Never seed data that implies real OIL operational figures.
- **Provenance:** the 9 IOGP rules and the OISD Hi-Po concept are verified; **exact OISD standard numbers are NOT — store them with a `verified` boolean defaulting to false** and do not fabricate authoritative citations.

---

## ⚠️ CRITICAL pgvector DECISION (must resolve first)

The existing embeddings are **3072-dim** (`gemini-embedding-001`) stored as `vector(3072)` on pgvector **0.3.3**. pgvector cannot build an ANN index (IVFFlat/HNSW) on a `vector` with **more than 2000 dimensions** — so the current 3072-dim column can only be brute-force scanned, which will not scale.

**Resolve it one of these ways (recommend Option A):**
- **Option A (recommended):** Upgrade pgvector to **≥ 0.8** (rebuild the `pgvector/pgvector:pg16` image) and **reduce embedding output to 1536 dims** via Gemini `output_dimensionality=1536` (Matryoshka — normalize after truncation). Store `vector(1536)` and build an **HNSW** index with `vector_cosine_ops`. Best balance of quality, size, and indexability.
- **Option B:** Keep 3072 dims but store as **`halfvec(3072)`** (pgvector ≥0.7) and build **HNSW** with `halfvec_cosine_ops` (halfvec supports up to 4000 index dims).
- Either way: this requires **re-embedding existing rows** (coordinate with the backend's embedding-backfill job). Record `dimension`, `model`, and `embedding_status` on every embedding row. Document the chosen option in the migration.

---

## CONVENTIONS

- UUID PKs (`gen_random_uuid()` / `pgcrypto`), `TIMESTAMPTZ` everywhere (`created_at`, `updated_at` with triggers), snake_case, singular column names.
- Controlled vocabularies: use **native `ENUM` types** for small stable sets; use **lookup tables** for vocabularies that carry attributes (energy sources, barriers, IOGP rules, OISD refs).
- `org_id` (tenant) on every business table to support **Row-Level Security**.
- Every table commented (`COMMENT ON`), so the schema is self-documenting.

---

## ENUM TYPES

`user_role` (`HSSE_OFFICER, SITE_MANAGER, OPS_MANAGER, CORPORATE_LEADERSHIP, ADMIN`); `report_type` (`SAFETY_OBSERVATION, NEAR_MISS, UNSAFE_ACT, UNSAFE_CONDITION, INCIDENT, HIPO_NEAR_MISS`); `report_status` (`PENDING, ANALYZED, REVIEW, CLOSED`); `energy_type` (`GRAVITY, MOTION, MECHANICAL, ELECTRICAL, PRESSURE, TEMPERATURE, CHEMICAL, RADIATION, FIRE_EXPLOSION, SOUND, BIOLOGICAL`); `barrier_status` (`INTACT, DEGRADED, MISSING, BYPASSED, FAILED, UNKNOWN`); `sif_classification` (`HSIF, PSIF, LSIF, CAPACITY, EXPOSURE, LOW_ENERGY, UNDETERMINED`); `escalation_level` (`CRITICAL, HIGH, REVIEW, ROUTINE`); `severity` (`LOW, MEDIUM, HIGH, CRITICAL`); `pattern_type` (`RECURRING, EMERGING, COMPOUNDING, SYSTEMIC`); `pattern_priority` (`LOW, MEDIUM, HIGH, CRITICAL`); `alert_status` (`OPEN, ACKNOWLEDGED, IN_REVIEW, ESCALATED, CLOSED, DISMISSED`); `alert_source` (`REPORT, PATTERN`); `embedding_status` (`OK, DEGRADED, PENDING`); `location_level` (`WORLD, COUNTRY, REGION, FIELD, SITE`); `asset_type` (`DRILLING_RIG, WORKOVER_RIG, WELLHEAD, BOP_WELL_CONTROL, PRODUCTION_FIELD, COMPRESSOR_STATION, PUMPING_UNIT, OIL_COLLECTION_STATION, GGS, PIPELINE`).
> Note: adding ENUM values later is easy; removing is not — keep sets minimal and document.

---

## TENANCY, USERS, RULESET

- **`organizations`** — `id`, `name`, `slug` (unique), `is_demo` (bool), `created_at`. (Seed one real-ish "Oil India Limited (DEMO)" org flagged demo.)
- **`users`** (extend existing) — add `org_id` FK, `role user_role`, `email` (unique, citext), `password_hash`, `is_active`, `last_login_at`. Keep existing `name`, `created_at`. (Currently unused/no auth — now backs JWT/RBAC.)
- **`ruleset_versions`** — `id`, `version` (unique, e.g. semver), `weights` (JSONB: barrier/severity/sif/confidence weights), `thresholds` (JSONB: escalation cut-offs, `confidence_threshold`, `similarity_threshold`, `min_reports`, high-energy joules), `classification_map` (JSONB: three-factor → `sif_classification`), `is_active` (bool, only one active), `created_at`, `created_by`. **Every classification/pattern references the ruleset_version used** → reproducible decisions.

## REFERENCE / TAXONOMY TABLES (seed these)

- **`iogp_rules`** — the 9 Life-Saving Rules: `id`, `code` (unique: `BYPASSING_SAFETY_CONTROLS, CONFINED_SPACE, DRIVING, ENERGY_ISOLATION, HOT_WORK, LINE_OF_FIRE, SAFE_MECHANICAL_LIFTING, WORK_AUTHORISATION, WORKING_AT_HEIGHT`), `name`, `description`, `icon`.
- **`oisd_references`** — `id`, `standard_no` (e.g. "OISD-STD-105"), `title`, `summary`, `concept_tag` (e.g. `HIPO_NEAR_MISS`), `url`, `verified` (bool, default **false**). Seed the **Hi-Po near miss concept row** (verified true — it's confirmed) and placeholder standard rows marked `verified=false` for later validation.
- **`energy_sources`** — `id`, `code`, `name`, `energy_type energy_type`, `typical_context` (e.g. "well pressure/kick, BOP", "suspended derrick load", "H2S release", "rotating drill string", "hot work/steam"), `is_high_energy` (bool), `threshold_joules` (nullable). Seed an oil-&-gas-specific taxonomy.
- **`barriers`** — control/safeguard catalog: `id`, `code`, `name`, `description`, `is_direct_control` (bool — EEI-SCL "direct control"), `related_energy_type energy_type` (nullable). Seed: energy isolation/LOTO, work permit (PTW), BOP/secondary well barrier, fall arrest, gas detection, exclusion zone/line-of-fire positioning, lifting plan, confined-space entry controls, hot-work controls.

## LOCATION HIERARCHY & ASSETS (new — replaces free-text `location`/`asset_id`)

- **`locations`** — self-referential hierarchy for the globe drill-down: `id`, `org_id`, `parent_id` FK→locations, `level location_level`, `name`, `code`, `latitude`, `longitude`, `bbox` (JSONB or PostGIS geometry — PostGIS optional), `is_synthetic`, `created_at`. Constraint: a child's `level` must be deeper than its parent's (enforce via trigger/check). Index `parent_id`, `level`, `(latitude, longitude)`.
- **`assets`** — `id`, `org_id`, `location_id` FK (a SITE-level location), `asset_type asset_type`, `name` (e.g. "Well #44"), `code`, `latitude`, `longitude`, `status`, `metadata` (JSONB), `is_synthetic`, `created_at`. Index `location_id`, `asset_type`, `org_id`.

## CORE: REPORTS & ANALYSIS (extend existing tables)

- **`reports`** (extend) — keep `id`, `report_text`, `report_type`, `created_at`, `status`. Add: `org_id` FK, `cleaned_text`, `location_id` FK→locations (nullable during migration), `asset_uuid` FK→assets (nullable during migration), `reporter_name`, `reporter_role`, `is_synthetic`, `source` (manual/batch/api). **Keep legacy `asset_id VARCHAR` and `location VARCHAR` nullable** during transition; add a data migration that best-effort maps them to `asset_uuid`/`location_id`. Change `report_type`/`status` to the ENUMs above (via `USING` cast migration).
- **`report_extractions`** (new) — raw + validated LLM extraction for audit: `id`, `report_id` FK (unique), `pass_a_json` (JSONB), `pass_b_json` (JSONB, nullable — gated pass), `rag_chunk_ids` (UUID[]), `llm_invocation_id` FK, `created_at`.
- **`report_analysis`** (extend existing) — keep `id`, `report_id` (unique), `confidence`, `risk_score`, `severity`, `rationale`, `requires_followup`, `followup_question`. Add: `high_energy_present` (bool), `person_in_danger_zone` (bool), `barrier_compromised` (bool), `sif_classification sif_classification`, `escalation_level escalation_level`, `ruleset_version_id` FK. Keep legacy single-value `energy_source`, `barrier`, `barrier_status`, `iogp_rule` columns for back-compat but treat the join tables below as source of truth. CHECK: `risk_score` 0–100, `confidence` 0–1.
- **`report_energy_sources`** (new join, multi-valued) — `report_id` FK, `energy_source_id` FK, `magnitude` (text/nullable), `is_high_energy` (bool). PK `(report_id, energy_source_id)`.
- **`report_barriers`** (new join) — `report_id` FK, `barrier_id` FK, `status barrier_status`. PK `(report_id, barrier_id)`.
- **`report_iogp_rules`** (new join) — `report_id` FK, `iogp_rule_id` FK. PK `(report_id, iogp_rule_id)`.
- **`report_oisd_references`** (new join) — `report_id` FK, `oisd_reference_id` FK, `is_hipo` (bool). PK `(report_id, oisd_reference_id)`.
- **`report_embeddings`** (extend) — `id`, `report_id` FK (unique per model), `embedding` (`vector(1536)` **or** `halfvec(3072)` per the pgvector decision), `model`, `dimension`, `embedding_status embedding_status`. Exclude `DEGRADED`/`PENDING` from search/clustering.

## KNOWLEDGE / RAG (extend existing)

- **`knowledge_chunks`** (extend) — keep `id`, `chunk_id`, `title`, `chunk_text`, `source`. Add `framework` (`IOGP|OISD|EEI_SCL|DEKRA|ENERGY_BASED|OIL_SOP`), `section`, `token_count`.
- **`knowledge_embeddings`** (extend) — same vector type/decision as reports; `dimension`, `model`.

## PATTERNS (Tier 2) & SWEEPS (extend existing)

- **`patterns`** (extend) — keep `id`, `title`, `description`, `hazard`, `barrier`, `confidence`, `report_count`, `first_seen`, `last_seen`, `status`, `evidence` (JSONB). Change `pattern_type`→`pattern_type` ENUM, `priority`→`pattern_priority` ENUM. Add: `org_id`, `location_id` FK, `asset_uuid` FK, `shared_energy_type energy_type` (nullable), `ruleset_version_id` FK, optional `centroid` embedding column. (Legacy `asset_id`/`location` VARCHAR kept nullable during migration.)
- **`pattern_reports`** (keep) — `pattern_id` FK, `report_id` FK, `similarity_score` (CHECK 0–1). PK `(pattern_id, report_id)`. This is the **traceability** backbone — never lose it.
- **`sweep_runs`** (new) — audit each Tier-2 run: `id`, `org_id`, `params` (JSONB), `ruleset_version_id`, `candidates`, `clusters_found`, `patterns_created`, `started_at`, `finished_at`, `status`, `triggered_by`.

## ALERTS, AUDIT, LLM LOG (extend + new)

- **`alerts`** (extend) — keep `id`, `report_id` FK, `pattern_id` FK, `title`, `message`, `created_at`. Replace `is_read` with lifecycle: `status alert_status`, `severity severity`, `source alert_source`, `org_id`, `assignee_id` FK→users, `sla_due_at`, `acknowledged_at`, `escalated_at`, `closed_at`. (Migrate `is_read=true` → `status=CLOSED`/`ACKNOWLEDGED`.)
- **`alert_events`** (new) — lifecycle audit: `id`, `alert_id` FK, `from_status`, `to_status`, `actor_id` FK, `note`, `created_at`.
- **`audit_logs`** (new, append-only) — `id`, `org_id`, `actor_id`, `actor_role`, `action`, `entity_type`, `entity_id`, `before` (JSONB), `after` (JSONB), `ruleset_version_id`, `request_id`, `created_at`. No UPDATE/DELETE (enforce via trigger/role).
- **`llm_invocations`** (new, append-only) — `id`, `org_id`, `report_id` (nullable), `provider`, `model`, `purpose` (`EXTRACT_A|EXTRACT_B|PATTERN|EMBED`), `prompt_hash`, `prompt_tokens`, `completion_tokens`, `latency_ms`, `cost_estimate`, `status`, `fallback_used` (bool), `created_at`. Backs cost/latency dashboards and audits.

## EVALUATION (differentiator)

- **`eval_examples`** — `id`, `narrative`, `source` (`SYNTHETIC|OSHA`), gold labels: `gold_sif_classification`, `gold_iogp_rule_id`, `gold_high_energy`, `gold_barrier_status`, `notes`, `is_synthetic`.
- **`eval_runs`** — `id`, `ruleset_version_id`, `model`, `precision`, `recall`, `f2`, `confusion` (JSONB), `review_burden_estimate`, `created_at`.
- **`eval_results`** — `id`, `eval_run_id` FK, `eval_example_id` FK, `predicted_json` (JSONB), `correct` (bool).

---

## INDEXES

- `reports`: `(org_id)`, `(created_at DESC)`, `(status)`, `(report_type)`, `(asset_uuid)`, `(location_id)`; **partial** index `WHERE status='REVIEW'`; **pg_trgm GIN** on `report_text`/`cleaned_text` for search.
- `report_analysis`: unique `(report_id)`, `(escalation_level)`, `(sif_classification)`, `(risk_score)`.
- **Vector:** HNSW cosine on `report_embeddings.embedding` and `knowledge_embeddings.embedding` (`vector_cosine_ops` for `vector(1536)`, or `halfvec_cosine_ops` for `halfvec(3072)`), with sensible `m`/`ef_construction`.
- `alerts`: `(status)`, `(assignee_id)`, `(created_at DESC)`, `(severity)`.
- `patterns`: `(pattern_type)`, `(priority)`, `(last_seen DESC)`, `(asset_uuid)`, `(location_id)`.
- Join tables: composite PKs + FK-side indexes for reverse lookups.
- `locations`: `(parent_id)`, `(level)`, `(latitude, longitude)`. `assets`: `(location_id)`, `(asset_type)`.
- `audit_logs`: `(entity_type, entity_id, created_at DESC)`; `llm_invocations`: `(report_id)`, `(created_at DESC)`.
- GIN on JSONB columns queried by key (`evidence`, `metadata`, ruleset JSONB).

## CONSTRAINTS & INTEGRITY

- FKs everywhere; `ON DELETE`: `RESTRICT` for reference/lookup tables, `CASCADE` for owned children (`report_analysis`, `report_embeddings`, `report_*` joins, `alert_events`), `SET NULL` where a link is optional.
- CHECKs: `risk_score` 0–100; `confidence`/`similarity_score` 0–1; `latitude` −90..90, `longitude` −180..180; exactly one active `ruleset_versions`; one `report_analysis` per report; alert has exactly one of (`report_id`,`pattern_id`) consistent with `source`.
- UNIQUE: `users.email`, `organizations.slug`, `iogp_rules.code`, `energy_sources.code`, `barriers.code`, `oisd_references.standard_no`, `(report_id, model)` on embeddings.
- `updated_at` auto-update triggers; append-only triggers on `audit_logs`/`llm_invocations`.

## ROW-LEVEL SECURITY (RLS)

- Enable RLS on all `org_id`-scoped tables. Policies filter by the current tenant + role. Provide **both** patterns and let config pick:
  - **App-managed:** backend sets a per-request GUC (`SET LOCAL app.current_org = ...`, `app.current_role = ...`) inside the transaction; policies use `current_setting('app.current_org')`.
  - **Supabase-compatible:** policies use `auth.jwt() ->> 'org_id'` / `auth.uid()` (the team knows Supabase; keep this path viable since it's Postgres + pgvector natively).
- Read access scoped to org; write/transition access gated by `user_role` (e.g., only HSSE_OFFICER/ADMIN can escalate/close alerts). `audit_logs`/`llm_invocations` readable by ADMIN/leadership only. Deny-by-default.

## SEED / DEMO DATA (all `is_synthetic=true`, under the demo org)

Split seeds into **reference** (always load) and **demo** (optional, flagged):
- **Reference:** the 9 `iogp_rules`; the `energy_sources` taxonomy; the `barriers` catalog; `oisd_references` (Hi-Po concept `verified=true`, standard numbers `verified=false`); an initial active `ruleset_versions` row with default weights/thresholds; the 5 `user_role`s; a demo org + demo users per role.
- **Locations hierarchy:** WORLD → India (COUNTRY) → Assam/Rajasthan/Gujarat/Offshore-KG (REGION) → Duliajan etc. (FIELD) → specific SITEs, each with real lat/lng.
- **Assets:** across the asset types (wellheads incl. **"Well #44"**, drilling rig, workover rig, BOP/well-control, GGS, compressor station, pumping unit, oil collection station, pipeline), placed under sites with coordinates.
- **Reports:** 150–300 realistic, messy field-style narratives spanning all 9 IOGP LSRs and the full `sif_classification` spread, each cross-linked to a real asset/location, with `report_analysis` (three booleans + classification + escalation + ruleset_version), join rows (energy/barrier/IOGP/OISD), and embeddings (or leave `PENDING` for the backend backfill job). Generate coherent `alerts` for HIGH/CRITICAL.
- **Signature demo scenarios (must include):** (1) a **COMPOUNDING** barrier-failure pattern on a single wellhead over time; (2) a **Baghjan-style** case — BOP/well-control barrier removed without a confirmed, tested secondary barrier while personnel are in the line of fire (classifies as PSIF/HSIF precursor) — so the demo shows it flagged in seconds vs. surfacing in a commission report years later. Wire `patterns` + `pattern_reports` for full traceability.
- Provide seeds as **idempotent Python scripts** (extend the existing `scripts/seed_reports.py`, `seed_tier2_reports.py`) and/or SQL, clearly separating synthetic demo data. Never present synthetic numbers as real OIL data.

## DELIVERABLES

- Alembic env + an initial revision reflecting the **current** schema, then additive revisions for: enums, ruleset_versions, reference tables, locations, assets, report extensions + join tables, extraction/audit/llm_invocation tables, alert lifecycle, sweep_runs, eval tables, the pgvector dimensionality change (with re-embed note), indexes, constraints, and RLS policies — each reversible where feasible and **non-destructive** to existing data (keep legacy columns, backfill FKs).
- An **ER description** (`SCHEMA.md`) documenting tables, relationships, enums, the ruleset-versioning/audit model, the pgvector decision, and the RLS model.
- Reference seed + demo seed scripts, and a `data-dictionary` comment on every table/column (`COMMENT ON`).
- Verify all migrations run clean on a fresh `pgvector/pgvector:pg16` (upgraded pgvector) and that the existing seeded rows survive migration.
