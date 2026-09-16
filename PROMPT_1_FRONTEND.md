# PROMPT 1 — FRONTEND (copy-paste ready)

> **How to use:** Paste everything below the line into Claude Code / Cursor as a single task. It is written to **replace the minimal existing PrecursorAI frontend** (5 basic pages, single pie chart, glassmorphism "Warm Cream + Amber Glass" theme, local `useState` only, 7s Axios polling) with a polished enterprise client that consumes the same/enhanced backend API. Give it the backend `openapi.json` (or PROMPT 2's contract) alongside this for best results.
>
> **Provenance note for the agent is embedded inside the prompt** so it knows what is verified domain fact vs. a UI design decision vs. synthetic demo data.

---

## ROLE & GOAL

You are a senior frontend engineer + product designer building the web client for **an AI-powered SIF (Serious Injury / Fatality) Precursor Intelligence platform** for oil & gas field operations, first customer **Oil India Limited (OIL)**. This is **not a chatbot**. It is an **operational safety-intelligence and early-warning command center** used by HSSE/HSE officers, site safety managers, drilling/production/operations managers, and corporate safety leadership.

Build a **polished, modern, enterprise-grade** application that feels like a serious industrial safety command center (think Palantir Foundry / Bloomberg Terminal / mission-control), **not** a hackathon dashboard. Do **not** copy the look of the reference prototype at `github.com/zuber144/PrecursorAI`; preserve only its *concepts* (two-tier pipeline, "AI reasons, deterministic code decides", three-factor SIF test, full traceability).

### Grounding the agent must respect (verified domain facts — do not restyle these away)
- **The core SIF precursor logic is a strict AND:** `HIGH-ENERGY SOURCE + PERSON IN DANGER ZONE (line of fire) + FAILED/MISSING/BYPASSED SAFETY BARRIER = SIF PRECURSOR`. The UI must make this three-factor logic visually central and legible.
- **Frameworks referenced (real):** DEKRA Martin & Black SIF-precursor concept; energy-based safety / high-energy hazard concept (Hallowell / Construction Safety Research Alliance, ~1,500 J threshold); EEI Safety Classification & Learning (SCL) model; IOGP Life-Saving Rules (9, listed below); India-specific **OISD** layer (OISD uses the term **"Hi-Po" = High-Potential near miss** for what the SCL model calls PSIF).
- **The 9 IOGP Life-Saving Rules (exact set):** Bypassing Safety Controls, Confined Space, Driving, Energy Isolation, Hot Work, Line of Fire, Safe Mechanical Lifting, Work Authorisation, Working at Height.
- **AI reasons, deterministic code decides:** the UI must never present the LLM as the decision-maker. Show the AI's *extraction & rationale* and, **separately and visibly**, the *deterministic rule outcome* that actually set the escalation level. Explainability is a first-class feature, not a tooltip.
- **Synthetic data is synthetic:** location names (India → Assam → Duliajan → Well #44, plus Rajasthan, Gujarat, Andhra offshore, etc.) may be real, but **every incident count, risk value, and metric shown in the prototype must be visibly labeled as synthetic/demo data**. Add a persistent, subtle "DEMO DATA" marker. Never imply these are real OIL figures.

---

## EXISTING CODEBASE CONTEXT (you are replacing the frontend, not the backend)

There is an existing React 19 + Vite 8.2 + Tailwind v4 frontend with 5 basic pages (Dashboard with one Recharts pie, Reports list/submit, Report detail, Alerts, Cognition/patterns), Axios client hitting `/api/v1/*` (Vite-proxied to `:8000`), 7-second polling, a client-side-only USER/ADMIN role toggle, and heavy custom glassmorphism CSS. **Treat it as a throwaway prototype:** keep the API contract and the domain concepts, discard the visuals and architecture. The backend (FastAPI) and its endpoints already exist and are being upgraded in parallel — consume them, do not reimplement business logic client-side. Known frontend gaps you must fix: no real auth/session persistence, no error boundaries, no loading skeletons, no responsive design, only one chart, no data export, no global state management.

---

## TECH STACK (align with the existing repo where noted)

- **React 19 + TypeScript + Vite** (the repo is on React 19 / Vite 8.2 — keep those; add TypeScript). Prefer new code in TS with `allowJs: true` for incremental migration. Strict TS. No `any` in domain models.
- **Tailwind CSS v4** (already in the repo via `@tailwindcss/vite`) + **shadcn/ui** (Radix primitives; supports React 19 + Tailwind v4). **lucide-react** icons (already used). **Remove the existing glassmorphism "Warm Cream + Amber Glass" theme** in favor of the command-center dark theme below.
- **TanStack Query** for server state/caching; **Zustand** for lightweight UI/global state (filters, selected node, theme).
- **TanStack Table** for all data grids (virtualized).
- **Charts:** **visx** or **Recharts** for standard charts; **Tremor** acceptable for quick KPI blocks. Pick one primary and stay consistent.
- **Geospatial:** **deck.gl** with **GlobeView** for the 3D globe + data layers (ScatterplotLayer, HexagonLayer/HeatmapLayer, ArcLayer, ColumnLayer); **MapLibre GL** (open-source, no token required) as the 2D basemap for field/site zoom levels. deck.gl overlays on MapLibre for a seamless globe→map drill-down. (Fallback if deck.gl is too heavy: `react-globe.gl`.)
- **Animation:** **Framer Motion** (restrained — transitions and data reveals, not decoration).
- **Forms/validation:** react-hook-form + zod (zod schemas should mirror backend Pydantic models).
- **Dates:** date-fns. **Numbers:** tabular/monospace for all metrics.
- **Routing:** React Router. **Testing:** Vitest + React Testing Library; Playwright for one happy-path e2e.
- Accessibility: WCAG 2.1 AA target, full keyboard nav, aria labels on all interactive viz.

---

## VISUAL DESIGN LANGUAGE ("Industrial Safety Command Center")

- **Dark-first**, high-contrast, data-dense but calm. Provide a light theme too (token-driven), dark is default.
- **Color tokens (semantic, colorblind-safe):**
  - Background: near-black slate (`#0A0E14`-ish) with layered elevation surfaces (`#111722`, `#161E2B`).
  - **Escalation/risk scale:** ROUTINE = slate/teal, REVIEW = amber, HIGH = orange, CRITICAL/SIF = red. Use these consistently everywhere (badges, map, gauges).
  - Accent/interactive: cyan/teal (`#22D3EE`) for selection & links; keep chrome desaturated so red/amber risk always pops.
  - Never rely on color alone — pair with icon + label (colorblind safety).
- **Typography:** clean grotesk/sans for UI (Inter/Geist); **monospace tabular numerals** for all counts, scores, coordinates, IDs, timestamps.
- **Layout:** 8pt grid, dense but breathable. Persistent left rail (nav), top command bar (global search, location breadcrumb, time-range, alert bell, demo-data marker, user), main canvas, optional right context/inspector drawer.
- **Signature motifs (make it feel purpose-built, not generic admin):**
  - **Three-factor "AND gate" component:** three lit/unlit nodes (Energy · Exposure · Barrier) feeding an AND gate that outputs "SIF PRECURSOR" — used on every incident.
  - **Barrier chain / Swiss-cheese visualization:** stacked barrier layers with holes where barriers were degraded/missing/bypassed, showing the energy path to the person.
  - **Energy wheel:** the energy-source taxonomy as a radial selector/legend (gravity, motion, mechanical, electrical, pressure, temperature, chemical, radiation, fire/explosion, sound).
- Micro-interactions: skeleton loaders, optimistic updates, subtle live "pulse" on new incoming reports. No confetti, no gradients-for-gradients'-sake.

---

## INFORMATION ARCHITECTURE (screens / routes)

1. **`/` Command Center (Overview)** — the default landing HUD.
   - Top KPI strip (all labeled DEMO): total reports (time range), SIF-potential rate, escalations (CRITICAL), open alerts, mean time-to-triage, barrier-failure rate.
   - **SIF Funnel** (signature): `All reports → touch high-energy hazard (~20–25%) → SIF-potential (high energy + compromised barrier + person in zone) → escalation-worthy (~1–3%)`. Each stage clickable to filter. (These percentages are illustrative defaults, driven by API.)
   - **Live Triage Feed** (left/center): stream of latest reports with classification chips, energy icon, LSR chip, escalation badge; new items animate in.
   - **Mini-globe preview** (right) linking to full geospatial view; shows precursor density hotspots.
   - **Alert ticker** and **Top emerging patterns** panel.
2. **`/globe` Geospatial Intelligence** — full-screen 3D globe/map drill-down (detailed below).
3. **`/triage` Live Triage & Review Queue** — real-time inbox + HSSE review queue (filter by escalation, LSR, energy, location, barrier status, confidence, "requires_followup"). Bulk actions. This is the operational workhorse screen.
4. **`/reports/:id` Incident / Report Detail** — full explainability (detailed below).
5. **`/sif` SIF Analysis Workspace** — deep analytics on the three-factor breakdown, energy-source distribution, barrier-status distribution, funnel over time, LSR heatmap.
6. **`/patterns` Pattern Intelligence** — Tier-2 clusters: RECURRING / EMERGING / COMPOUNDING / SYSTEMIC, cluster detail with contributing reports (traceability), semantic cluster scatter, trend lines.
7. **`/patterns/:id` Pattern Detail** — cluster narrative (AI reasoning shown as reasoning, not decision), member reports table, shared barriers/energy/asset, deterministic frequency cross-check, timeline.
8. **`/assets` Asset Registry** + **`/assets/:id` Asset Detail** — per-asset precursor history, barrier health scorecard, related patterns, location context, "line of fire" activity log.
9. **`/alerts` Alert Center** — acknowledge / assign / escalate / close workflow with audit trail; SLA timers.
10. **`/analytics` Trends & Analytics** — LSR trends, location trends, barrier-failure trends, energy trends, funnel-over-time, false-positive/review-burden view.
11. **`/submit` Submit / Ingest** — single report form + batch CSV/JSON upload (for demo/seeding). Shows the pipeline running live (extraction → validation → deterministic decision) as a stepper.
12. **`/audit` Explainability & Audit Log** — decision log, ruleset version, per-report LLM invocation trace (model, tokens, latency), Pydantic-validation status.
13. **`/settings`** — taxonomy/threshold config (read-mostly in demo), users/roles, theme.

Persistent: left nav, command bar with **location breadcrumb** (`World / India / Assam / Duliajan / Well #44`), global search (reports, assets, patterns), **time-range picker**, alert bell with count, demo-data marker.

---

## THE 3D GLOBE / MAP (flagship feature — spec precisely)

Navigation hierarchy (breadcrumb-synced, bi-directional with the map camera):
`World → Country → Region → Field/Site → Asset → Pattern → Incident`
Example path: **India → Assam → Duliajan → Well #44 → "Compounding barrier failures" → contributing reports.**

- **Level 0 – World (deck.gl GlobeView):** rotating dark globe. Countries/regions with precursor activity glow; **ColumnLayer/HexagonLayer** extrudes bars whose height/color = synthetic precursor density; **ArcLayer** optionally links related multi-site patterns. Auto-rotate until user interacts.
- **Level 1 – Country (India):** fly-to animation; state/region markers with aggregated risk. Side panel: regional KPI summary.
- **Level 2 – Region (Assam):** transition to **MapLibre 2D basemap** with deck.gl overlay; field/site clusters, **HeatmapLayer** for precursor density.
- **Level 3 – Field/Site (Duliajan):** individual assets plotted (wellheads, rigs, GGS, compressor stations) as typed icons with risk-colored halos; clustering at low zoom.
- **Level 4 – Asset (Well #44):** asset focus card + its precursor timeline; "open asset detail".
- **Level 5 – Pattern:** highlight the reports/assets belonging to a selected pattern (e.g., compounding barrier failures) — draw connections between contributing reports/assets.
- **Level 6 – Incident:** open the Incident Detail (route `/reports/:id`) in a drawer or full page.

Controls & overlays: layer toggles (density heatmap / escalations / patterns / assets / barrier-failure hotspots), time-range scrubber that re-renders the map, legend tied to the escalation color scale, "reset view", search-to-fly. Smooth camera transitions (Framer Motion / deck.gl transitions). Everything driven by API geo endpoints; **all values labeled synthetic**. Must stay performant (target 60fps at world level; cluster/aggregate to avoid rendering thousands of raw points).

---

## INCIDENT / REPORT DETAIL — the explainability centerpiece (`/reports/:id`)

Lay out as a three-column workspace (raw ← analysis ← decision) with a top summary bar:

- **Top summary bar:** report ID, report type (safety observation / near-miss / unsafe act / unsafe condition / incident / Hi-Po near miss), asset + location breadcrumb, timestamp, **final escalation badge (deterministic)**, SIF classification (HSIF / PSIF / LSIF / CAPACITY / EXPOSURE / LOW-ENERGY / UNDETERMINED), confidence meter.
- **Column A — Raw report:** original free-text narrative (messy field style preserved), reporter/role, submitted metadata, attachments placeholder.
- **Column B — AI reasoning (clearly labeled "AI EXTRACTION — reasoning, not decision"):**
  - Structured extraction: hazard, **energy source(s)** (typed + magnitude if present), activity/task, **person in danger zone?**, **barrier(s) + status** (INTACT/DEGRADED/MISSING/BYPASSED/FAILED/UNKNOWN), severity estimate, mapped **IOGP LSR**, mapped **OISD reference / Hi-Po flag**, model rationale, and any `followup_question` when uncertain.
  - Show **retrieved RAG context** used (which rulebook chunks) as evidence.
  - Show `requires_followup` state prominently when set.
- **Column C — Deterministic decision (labeled "DETERMINISTIC ENGINE — this set the outcome"):**
  - The **three-factor AND-gate** visual: Energy ✓/✗ · Person-in-zone ✓/✗ · Barrier-compromised ✓/✗ → SIF PRECURSOR yes/no.
  - **Risk score breakdown** as an itemized "receipt": barrier weight + severity weight + SIF bonus − confidence penalty = score → escalation level (with the exact thresholds shown). Make the math auditable and legible.
  - **Barrier chain / Swiss-cheese** viz for this incident.
  - Ruleset version + timestamp; link to `/audit` trace.
- **Below:** IOGP LSR chip(s), OISD reference card(s), related patterns (traceability links), similar reports (semantic neighbors from embeddings), action bar (acknowledge / escalate / assign / add note / mark reviewed), and an activity/audit timeline for this report.

Design principle: a safety officer who is *legally accountable* must be able to see exactly **why** this was flagged and **what rule** decided it. No black boxes.

---

## SIF ANALYSIS WORKSPACE (`/sif`)

- Funnel-over-time (stacked area): reports → high-energy → SIF-potential → escalation.
- **Energy-source distribution** (the energy wheel + bar breakdown), filterable.
- **Barrier-status distribution** and **barrier-failure trend** (which barriers fail most: energy isolation, work permit, line-of-fire positioning, etc.).
- **IOGP LSR heatmap** (LSR × location or LSR × asset-type), cells colored by precursor density.
- **Classification mix** (HSIF/PSIF/LSIF/CAPACITY/EXPOSURE) donut + trend.
- Every panel cross-filters the others (linked brushing). All synthetic.

---

## PATTERN INTELLIGENCE (`/patterns`, `/patterns/:id`)

- Board/grid of pattern cards grouped by type: **RECURRING, EMERGING, COMPOUNDING, SYSTEMIC**, each with severity, member count, involved assets/locations, trend sparkline, "first seen / last seen".
- **Semantic cluster scatter** (2D projection of embeddings; clusters colored by pattern type) — hover shows report snippets; click isolates a cluster.
- Pattern detail: AI-generated cluster narrative (labeled reasoning), **deterministic frequency cross-check** (7-day / 30-day counts that confirmed it as recurring/emerging — show that the AI's suggested priority was cross-checked, never used raw), **member reports table with full traceability to report IDs**, shared barrier/energy/asset summary, and a map of where the pattern lives.
- Emphasize the **compounding barrier failures** case (multiple barriers degrading on the same asset over time) as a signature story — this maps to the Baghjan-type scenario.

---

## ASSET VIEWS (`/assets`, `/assets/:id`)

- Registry: virtualized table of assets (type, field/site, region, open precursors, barrier-health score, last event), filter/sort, map thumbnail.
- Asset types to support with distinct icons: **drilling rig, workover rig, wellhead, BOP/well-control, production field, compressor station, pumping unit, oil collection station, GGS (group gathering station), pipeline segment.**
- Asset detail: header (type, location breadcrumb, status), **barrier-health scorecard**, precursor timeline, related patterns, recent reports, "line of fire" activity, quick-jump to globe focus on this asset.

---

## COMPONENT LIBRARY (build these reusable primitives)

`KpiCard`, `SifFunnel`, `ThreeFactorGate`, `BarrierChainSwissCheese`, `EnergyWheel`, `RiskScoreReceipt`, `EscalationBadge`, `SifClassificationBadge`, `LsrChip`, `OisdReferenceCard`, `ConfidenceMeter`, `SeverityBadge`, `BarrierStatusPill`, `LiveTriageFeed`, `ReviewQueueTable`, `PatternCard`, `ClusterScatter`, `AssetIcon`, `LocationBreadcrumb`, `TimeRangePicker`, `GlobeCanvas` + layer controls, `AlertTicker`, `AlertToast`, `PipelineStepper` (extraction→validation→decision), `AuditTimeline`, `DemoDataMarker`, `EmptyState`, `SkeletonBlock`, `LinkedFilterBar`. All typed, documented with a short Storybook-style usage comment.

---

## CHARTS (be specific)

Funnel (custom), stacked area (funnel-over-time), donut (classification mix), horizontal bars (energy/barrier distribution), heatmap (LSR × location/asset), sparklines (pattern trends), scatter (cluster projection), gauge/receipt (risk score), timeline (activity/audit). Consistent axis/tooltip styling, monospace numerals, escalation color scale reused throughout. All chart data from API; no hardcoded arrays in components (use fixtures/mocks module).

---

## INTERACTION FLOW (wire these end-to-end)

1. New report arrives (WebSocket/SSE or 5–7s polling fallback) → animates into Live Triage Feed and updates KPIs/funnel/map.
2. Officer opens report → sees AI extraction **and** the deterministic decision receipt + three-factor gate → understands *why*.
3. If CRITICAL/SIF → alert appears in Alert Center + toast + globe hotspot; officer acknowledges → assigns → escalates → closes, each step written to audit trail with SLA timer.
4. Officer runs / reviews a **pattern sweep** (Tier 2) → explores clusters → drills a compounding-barrier pattern → traces to exact contributing reports → jumps to the asset and to the globe.
5. Globe drill-down path works both by clicking and by breadcrumb, staying in sync with filters and time range.

---

## API ASSUMPTIONS (consume; don't hardcode business logic on the client)

Assume a REST + realtime backend (FastAPI). The **frontend must not recompute classifications or escalation** — it only renders what the backend decided. Expected endpoints (adapt to the provided `openapi.json`):

- `POST /api/v1/reports` (submit), `GET /api/v1/reports` (filter/paginate), `GET /api/v1/reports/:id` (full detail incl. extraction, deterministic decision, RAG evidence, LLM trace refs).
- `GET /api/v1/dashboard/summary` (KPIs + funnel), `GET /api/v1/analytics/*` (trends, distributions, heatmaps).
- `GET /api/v1/geo/*` (world/country/region/site/asset aggregates for the globe; all synthetic).
- `GET /api/v1/assets`, `GET /api/v1/assets/:id`.
- `POST /api/v1/patterns/sweep`, `GET /api/v1/patterns`, `GET /api/v1/patterns/:id`.
- `GET /api/v1/alerts`, `PATCH /api/v1/alerts/:id` (acknowledge/assign/escalate/close).
- `GET /api/v1/audit/*`, `GET /api/v1/reference/{iogp_rules|oisd|energy_sources|barriers|ruleset}`.
- Realtime: `WS /api/v1/stream` (new reports, new alerts, pattern updates) — implement with graceful polling fallback.

Build a typed API client (generated from OpenAPI if available), zod-validated responses, TanStack Query hooks per resource, and a **mock/fixtures layer** so the entire UI runs against `VITE_USE_MOCKS=true` with no backend.

---

## MOCK / DEMO DATA REQUIREMENTS

Provide a rich, **clearly-synthetic** fixtures module and a Vite mock mode (MSW recommended):
- ~150–300 realistic, messy field-style narratives spanning all 9 IOGP LSR categories and a spread of classifications (routine → PSIF → HSIF), across real India locations (Assam/Duliajan primary; plus Rajasthan, Gujarat, offshore) and the asset types above.
- Include at least one **compounding-barrier-failure** pattern on a single wellhead and one **Baghjan-style** scenario (BOP removed without a tested secondary barrier) so the demo has a signature "flagged in 2 seconds vs. surfaced in a commission report years later" moment.
- Coherent cross-links: reports → assets → locations → patterns → alerts, so traceability and drill-down actually resolve.
- Every metric surfaced must pass through the `DemoDataMarker` convention. Never present synthetic numbers as real OIL data.

---

## RESPONSIVE / PERFORMANCE / QUALITY

- **Primary target: large desktop / control-room displays (≥1440px), including ultra-wide.** Fully usable down to laptop (1280px). Tablet: graceful reflow of dashboards. Phone: read-only alerts/triage summary is enough (globe can degrade to 2D map).
- Code-split heavy routes (globe, analytics). Lazy-load deck.gl. Virtualize tables/feeds. Memoize charts. Keep the globe at interactive framerates via aggregation.
- Loading/empty/error states everywhere. Keyboard shortcuts for power users (`/` search, `g then g` globe, `j/k` feed nav). AA contrast. Reduced-motion support.

## DELIVERABLES

Scaffold the app, implement all routes/components above (real ones first, stubs clearly marked `TODO`), wire TanStack Query + mock mode, ship the globe drill-down, the incident explainability workspace, the pattern intelligence board, and the command-center overview as the four highest-fidelity screens. Include a `README` with run instructions (`VITE_USE_MOCKS=true` to run standalone), a short design-token doc, and Storybook-style notes for the signature components. Keep everything typed, accessible, and visibly enterprise-grade.
