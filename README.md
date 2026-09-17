<p align="center">
  <img src="frontend/public/logo-full.png" alt="PrecursorAI" width="420" />
</p>

<h3 align="center">HSSE Operational Safety Intelligence Platform</h3>

<p align="center">
  AI-powered precursor event detection, triage, and SIF prevention for oil &amp; gas field operations
</p>

<p align="center">
  <img src="https://img.shields.io/badge/SIH-2026-blue?style=flat-square" alt="SIH 2026" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/PostgreSQL-16_+_pgvector-4169E1?style=flat-square&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Gemini_AI-Embedding_+_LLM-4285F4?style=flat-square&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" alt="Docker" />
</p>

---

## 📋 Table of Contents

- [Problem Statement](#-problem-statement)
- [What is PrecursorAI?](#-what-is-precursorai)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Commands](#-available-commands)
- [Backend API](#-backend-api)
- [AI Pipeline](#-ai-pipeline)
- [Database Schema](#-database-schema)
- [Frontend Application](#-frontend-application)
- [Data Model](#-data-model)
- [State Management](#-state-management)
- [Design System](#-design-system)
- [Core Algorithms](#-core-algorithms)
- [Docker Deployment](#-docker-deployment)
- [Documentation](#-documentation)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Problem Statement

> **Smart India Hackathon (SIH) 2026**

In India's oil & gas sector, **Serious Injuries and Fatalities (SIF)** remain a persistent challenge despite incident reporting mechanisms. The core issue: organisations collect thousands of safety reports but lack the intelligence to identify **precursor patterns** — the early-warning signals buried in near-miss data that precede catastrophic events.

**PrecursorAI** transforms raw field safety reports into actionable intelligence, enabling safety teams to **detect, triage, and intervene** before a precursor escalates into a SIF event.

---

## 🧠 What is PrecursorAI?

PrecursorAI is a **real-time HSSE (Health, Safety, Security, Environment) operational safety intelligence system** designed for oil & gas field operations across India. It implements a research-backed two-tier architecture:

- **Tier 1 — Real-Time Intake Pipeline**: Gemini-powered NLP extracts safety entities from unstructured field reports, followed by a deterministic risk engine that classifies SIF potential using a strict 3-factor formula.
- **Tier 2 — Background Pattern Cognition**: Async sweep jobs (via Arq + Redis) perform historical cross-correlation and vector similarity search to surface emerging multi-incident patterns.

**Foundational Design Principle:**
> *"AI reasons and explains; deterministic code decides."*
> Gemini extracts safety entities and rationale; deterministic Python algorithms calculate risk scores, classifications, and escalation levels.

The platform serves three user personas:

| Role | Portal | Capabilities |
|------|--------|-------------|
| **Safety Engineer** | Command Center | Full dashboard, triage, analytics, pattern analysis |
| **Field Supervisor** | Operations View | Map-focused monitoring, alert management |
| **Field Worker** | Worker Portal | Mobile-first incident reporting with AI-assisted analysis |

---

## ✨ Key Features

### 1. 🖥️ Live Command Center Dashboard
Real-time operational overview with 6 KPI cards (Total Reports, SIF-Potential Rate, Critical Escalations, Open Tickets, Mean Time-to-Triage, Barrier Failure Rate), SIF detection funnel, live triage feed, and interactive satellite map — all updating reactively when datasets or incidents change.

### 2. 🔬 3-Factor SIF Detection Engine
Every incident is scored across three dimensions using a **deterministic risk formula**:

$$\text{High-Energy Present} \land \text{Person in Danger Zone} \land \text{Barrier Compromised} \implies \text{SIF Precursor (HSIF)}$$

- **Energy Source Classification** — Hydrocarbon, Electrical, Mechanical, Chemical, Thermal, Gravitational, Pressure (high-energy threshold ≥ 1,500 J)
- **Barrier Status Assessment** — Failed, Degraded, Bypassed, Missing, Intact
- **Precursor Signal Extraction** — NLP-extracted keywords from report text

Risk scores (0–100) incorporate barrier degradation weights, severity bonuses, and low-confidence penalties.

### 3. 🤖 Two-Pass AI Extraction Pipeline
Gemini-powered structured extraction with automatic 3-key rotation and rate-limit handling:

- **Pass A** (always runs): Low-cost extraction of hazard type, energy sources, activity context, line-of-fire proximity, barriers, barrier statuses, IOGP Life-Saving Rules, and OISD flag
- **Pass B** (gated): Triggered only when Pass A detects high-energy hazards. Evaluates SIF potential, confidence score, causal rationale, and follow-up prompts

### 4. 🗺️ Interactive Satellite Map & 3D Globe
- **2D Mapbox GL** satellite map with incident markers, color-coded by severity
- **3D Globe View** for geospatial overview across Indian operational basins
- Incidents clustered around 4 real basins: Assam/Duliajan, Rajasthan/Barmer, Gujarat/Mehsana, KG Offshore

### 5. 📋 Triage & Review Queue with Next Steps
Filterable triage table with:
- Severity badge, SIF-potential flag, energy source, barrier status
- Full report narrative
- **Context-aware mandatory next steps** generated by the action engine (containment steps, protocol references, assigned roles, SLA timeframes)
- One-click resolve/reopen actions

### 6. 🧪 AI Report Explainability
Individual report detail pages with a **3-column analysis layout** + dedicated **Section 4: Mandatory Next Steps & Containment Action Plan** including immediate containment, protocol grid (API RP 53, OSHA 1910, NFPA 70E), responsible roles, and SLA timers.

### 7. 📊 2D Semantic Pattern Clustering
DBSCAN-based clustering groups similar incidents into patterns, visualised in a 2D scatter plot. Categories: Barrier Integrity, Equipment Degradation, Human Factors, Process Safety, Environmental. Background sweep jobs cross-correlate historical data via vector similarity search (pgvector cosine distance).

### 8. 🏭 Asset Safety Health Tracking
Per-asset safety profiles: incident history, active alerts, SLA compliance, barrier status timeline, and risk trend indicators.

### 9. 📱 Worker Mobile Reporting Portal
Mobile-first incident submission with natural language input, location selection, severity classification, and **AI-powered analysis** via the backend `/reports/analyze-text` endpoint (with graceful client-side fallback).

### 10. ⚠️ Early Warning Alerts with SLA Timers
Alert cards with severity colour coding, SLA countdowns, acknowledge/dismiss actions, mandatory next-step recommendations, and asset cross-referencing. Background Arq worker escalates alerts exceeding SLA deadlines.

### 11. 🔀 Quick Dataset & Role Switcher
Three built-in datasets (Demo, Set A, Set B) with sidebar-integrated switcher. Role switching via portal selector for Engineer/Supervisor/Worker views.

### 12. 📚 RAG-Powered Knowledge Base
Cosine similarity search over vector embeddings against IOGP/OISD safety knowledge chunks, grounding every AI recommendation in verified industry standards.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          PrecursorAI Platform                          │
│                                                                         │
│  ┌─────────────────────────┐          ┌─────────────────────────────┐  │
│  │   Frontend (React SPA)  │          │    Backend (FastAPI)         │  │
│  │                         │  REST    │                             │  │
│  │  Vite 6 + React 19      │◄────────►│  Uvicorn + async SQLAlchemy │  │
│  │  TailwindCSS 4           │  /api/v1 │  Pydantic 2 validation      │  │
│  │  Zustand + TanStack     │          │                             │  │
│  │  Mapbox GL + Recharts   │          │  ┌───────────────────────┐  │  │
│  │  Lazy-loaded 18 routes  │          │  │    AI Layer           │  │  │
│  │                         │          │  │  ┌─────────────────┐  │  │  │
│  │  ┌───────────────────┐  │          │  │  │ Gemini Provider │  │  │  │
│  │  │ Offline Fallback  │  │          │  │  │ (3-key rotate)  │  │  │  │
│  │  │ Client-side SIF   │  │          │  │  ├─────────────────┤  │  │  │
│  │  │ & action engine   │  │          │  │  │ 2-Pass Extract  │  │  │  │
│  │  └───────────────────┘  │          │  │  │ (classifier.py) │  │  │  │
│  └─────────────────────────┘          │  │  ├─────────────────┤  │  │  │
│                                       │  │  │ Risk Engine     │  │  │  │
│                                       │  │  │ (deterministic) │  │  │  │
│                                       │  │  ├─────────────────┤  │  │  │
│                                       │  │  │ RAG (pgvector   │  │  │  │
│                                       │  │  │  cosine search) │  │  │  │
│                                       │  │  └─────────────────┘  │  │  │
│                                       │  └───────────────────────┘  │  │
│                                       └──────────┬──────────────────┘  │
│                                                  │                     │
│                              ┌───────────────────┼───────────────────┐ │
│                              ▼                   ▼                   ▼ │
│                  ┌──────────────────┐ ┌────────────────┐ ┌──────────┐ │
│                  │ PostgreSQL 16    │ │  Redis 7       │ │ Arq      │ │
│                  │ + pgvector 0.8   │ │  (Alpine)      │ │ Worker   │ │
│                  │                  │ │                │ │          │ │
│                  │ • 18 ORM models  │ │ • Job queue    │ │ Tasks:   │ │
│                  │ • 1536-dim HNSW  │ │ • Rate limits  │ │ • sweep  │ │
│                  │ • RLS policies   │ │                │ │ • embed  │ │
│                  │ • 13 migrations  │ └────────────────┘ │ • SLA    │ │
│                  └──────────────────┘                     └──────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.12 | Runtime |
| FastAPI | 0.115 | Async REST API framework |
| Uvicorn | 0.30 | ASGI server |
| SQLAlchemy | 2.0 | Async ORM (asyncpg driver) |
| Alembic | 1.13 | Database migrations |
| PostgreSQL | 16 | Primary database |
| pgvector | 0.8 | Vector similarity search (1536-dim HNSW) |
| Redis | 7 | Job queue & rate limiting |
| Arq | — | Async background worker |
| google-generativeai | 0.8.2 | Gemini LLM & embeddings |
| Pydantic | 2.9 | Request/response validation |
| python-jose | — | JWT authentication |
| PyMuPDF | — | PDF rulebook chunking |
| NumPy | 2.1 | Numerical computation |
| Structlog | — | Structured logging |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI component library |
| TypeScript | 5.5 | Type-safe development |
| Vite | 5.3 | Dev server & bundler (with API proxy) |
| Tailwind CSS | 4 | Utility-first CSS with `@theme` design tokens |
| React Router DOM | 6.25 | Client-side routing with lazy code-splitting |
| Zustand | 4.5 | Lightweight client state management |
| TanStack Query | 5.50 | Server state, caching & mutations |
| TanStack Table | 8.20 | Headless table for triage queue |
| Mapbox GL JS | 3.30 | Satellite maps & marker clusters |
| react-map-gl | 7.1 | React wrapper for Mapbox GL |
| maplibre-gl | 4.5 | Open-source map rendering |
| deck.gl | 9.0 | WebGL-powered geospatial overlays |
| @luma.gl/core + webgl | 9.0 | Low-level WebGL for deck.gl |
| Recharts | 2.12 | Data visualisation (bar, line, funnel) |
| Framer Motion | 11.3 | Animation & transitions |
| Radix UI | Various | Accessible primitives (Dialog, Dropdown, Popover, Select, Tabs, Tooltip, Slot) |
| Axios | 1.7 | HTTP client with JWT interceptor (10s timeout) |
| React Hook Form | 7.52 | Form state management |
| @hookform/resolvers | 3.9 | Zod schema validation bridge |
| Zod | 3.23 | Runtime schema validation |
| class-variance-authority | 0.7 | Component variant styling |
| clsx + tailwind-merge | — | Conditional class merging |
| Lucide React | 0.408 | Icon system |
| date-fns | 3.6 | Date formatting & manipulation |

### Testing & Dev

| Technology | Version | Purpose |
|-----------|---------|---------|
| Vitest | 2.0 | Unit test runner (jsdom environment) |
| Testing Library (React) | 16.0 | Component testing utilities |
| MSW (Mock Service Worker) | 2.3 | API mocking for offline/demo mode |
| ESLint | — | Code quality enforcement |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| Docker Compose | Multi-container orchestration (4 services) |
| Make | Build automation (12 commands) |

---

## 📁 Project Structure

```
PrecursorAI/
├── README.md                               # This file
├── Indepth-overview.md                     # 778-line comprehensive system guide
├── PROMPT_1_FRONTEND.md                    # Frontend specification document
├── PROMPT_2_BACKEND.md                     # Backend hardening specification
├── PROMPT_3_DATABASE.md                    # Database evolution specification
├── docker-compose.yml                      # PostgreSQL + Redis + API + Worker
├── Makefile                                # Build automation commands
├── install_pgvector.ps1                    # Windows pgvector installer
├── .gitignore
│
├── docs/
│   ├── ARCHITECTURE.md                     # System architecture & design principles
│   └── SCHEMA.md                           # Database schema & vector dimensionality
│
├── data/
│   ├── knowledge/                          # IOGP/OISD safety knowledge chunks for RAG
│   └── synthetic_reports/                  # Generated test reports
│
├── sample-data/
│   ├── demo_set_a.json                     # Demo fixture dataset A
│   ├── demo_set_b.json                     # Demo fixture dataset B
│   └── validate.py                         # Dataset validation script
│
├── backend/
│   ├── requirements.txt                    # Python dependencies
│   ├── Dockerfile                          # API server container
│   ├── Dockerfile.worker                   # Arq worker container
│   │
│   ├── app/
│   │   ├── main.py                         # FastAPI app, middleware, route mounting
│   │   ├── config.py                       # Pydantic Settings (env-based config)
│   │   ├── database.py                     # Async SQLAlchemy engine & session
│   │   ├── worker.py                       # Arq background worker settings & tasks
│   │   │
│   │   ├── ai/                             # AI & ML layer
│   │   │   ├── llm_provider.py             # LLM abstraction (Gemini + Ollama stub)
│   │   │   ├── classifier.py               # Two-pass extraction (Pass A + Pass B)
│   │   │   ├── risk_engine.py              # Deterministic SIF risk scorer (0-100)
│   │   │   ├── rag.py                      # Vector similarity search over knowledge
│   │   │   ├── embeddings.py               # Embedding generation (1536-dim truncation)
│   │   │   └── preprocessing.py            # Text normalization & cleanup
│   │   │
│   │   ├── models/                         # SQLAlchemy ORM models (18 tables)
│   │   │   ├── organization.py             # Organization (tenant)
│   │   │   ├── user.py                     # User with 5-role RBAC
│   │   │   ├── ruleset_version.py          # Versioned risk weights (audit trail)
│   │   │   ├── iogp_rule.py                # 9 IOGP Life-Saving Rules
│   │   │   ├── oisd_reference.py           # Indian OISD safety standards
│   │   │   ├── energy_source.py            # Energy source taxonomy
│   │   │   ├── barrier.py                  # Safety barrier definitions
│   │   │   ├── location.py                 # 5-level geo hierarchy
│   │   │   ├── asset.py                    # Physical asset registry
│   │   │   ├── report.py                   # Incident reports
│   │   │   ├── report_extraction.py        # AI extraction results
│   │   │   ├── report_analysis.py          # Risk analysis results
│   │   │   ├── report_embedding.py         # 1536-dim vector embeddings
│   │   │   ├── report_joins.py             # M2M: energy, barrier, IOGP, OISD
│   │   │   ├── pattern.py                  # Multi-incident patterns
│   │   │   ├── alert.py                    # SLA-tracked alerts
│   │   │   ├── audit_log.py                # Audit trail
│   │   │   └── llm_invocation.py           # LLM call logging
│   │   │
│   │   ├── api/                            # API route handlers
│   │   │   ├── reports.py                  # ✅ POST /analyze-text, POST /, GET /
│   │   │   ├── alerts.py                   # 🔲 Stub
│   │   │   ├── auth.py                     # 🔲 Stub
│   │   │   ├── dashboard.py                # 🔲 Stub
│   │   │   ├── geo.py                      # 🔲 Stub
│   │   │   ├── patterns.py                 # 🔲 Stub
│   │   │   └── reference.py                # 🔲 Stub
│   │   │
│   │   └── middleware/                     # Custom middleware
│   │       ├── rls.py                      # Row-Level Security tenant isolation
│   │       ├── error_handler.py            # Safe error formatting
│   │       └── request_id.py               # Request ID tracking
│   │
│   └── alembic/                            # Database migrations
│       ├── alembic.ini
│       ├── env.py
│       └── versions/                       # 13 sequential migrations
│           ├── 001_initial_existing_schema.py
│           ├── 002_enum_types.py
│           ├── 003_tenancy_users_ruleset.py
│           ├── 004_reference_tables.py
│           ├── 005_locations_assets.py
│           ├── 006_report_extensions_joins.py
│           ├── 007_embeddings_dimensionality.py   # 1536-dim decision
│           ├── 008_alert_lifecycle.py
│           ├── 009_patterns_sweeps.py
│           ├── 010_audit_llm_logging.py
│           ├── 011_eval_tables.py
│           ├── 012_indexes_constraints.py
│           └── 013_rls_policies.py                # PostgreSQL RLS
│
└── frontend/
    ├── index.html                          # HTML entry point
    ├── package.json                        # Dependencies & scripts
    ├── vite.config.ts                      # Vite + Tailwind + API proxy
    ├── tsconfig.json
    ├── eslint.config.js
    │
    ├── public/                             # Static assets
    │   ├── logo.png                        # Shield mark (228×238)
    │   ├── logo-name.png                   # Wordmark (984×150)
    │   ├── logo-icon.png                   # App icon (526×520)
    │   └── logo-full.png                   # Combined lockup (1249×238)
    │
    └── src/
        ├── main.tsx                        # React DOM entry
        ├── App.tsx                         # Router (18 lazy-loaded routes)
        ├── index.css                       # Tailwind v4 @theme tokens
        │
        ├── components/
        │   ├── domain/                     # 26 industrial safety widgets
        │   │   ├── KpiCard.tsx             # Monospace KPI cards with trend indicators
        │   │   ├── SifFunnel.tsx           # 4-stage SIF detection funnel
        │   │   ├── ThreeFactorGate.tsx     # Visual 3-node strict AND gate
        │   │   ├── LiveTriageFeed.tsx       # Real-time streaming feed (Open/Resolved tabs)
        │   │   ├── HomeScreenMap.tsx        # Mapbox GL 3D field map with camera presets
        │   │   ├── MapboxGlobe.tsx          # 3D spinning globe with fog projection
        │   │   ├── ReviewQueueTable.tsx     # Virtualized triage table + next steps
        │   │   ├── PatternCard.tsx          # Pattern summary (Compounding/Emerging/etc.)
        │   │   ├── SemanticClusterMap.tsx   # DBSCAN 2D UMAP SVG cluster visualiser
        │   │   ├── BarrierChainSwissCheese.tsx  # Swiss-cheese barrier penetration model
        │   │   ├── EnergyWheel.tsx          # Radial energy source indicator (≥1500 J)
        │   │   ├── RiskScoreReceipt.tsx     # Itemised risk score breakdown receipt
        │   │   ├── AlertTicker.tsx          # Running emergency alert ticker
        │   │   ├── EscalationBadge.tsx      # ROUTINE/REVIEW/HIGH/CRITICAL badges
        │   │   ├── BarrierStatusPill.tsx    # INTACT/DEGRADED/MISSING/BYPASSED/FAILED pills
        │   │   ├── ConfidenceMeter.tsx      # AI model confidence percentage indicator
        │   │   ├── DemoDataMarker.tsx       # DEMO/SYNTHETIC DATA warning banner
        │   │   ├── LinkedFilterBar.tsx      # Filter bar with search + severity tabs
        │   │   ├── AssetIcon.tsx            # Asset type icon mapping
        │   │   ├── AuditTimeline.tsx        # Audit event timeline
        │   │   ├── LocationBreadcrumb.tsx   # Geo hierarchy breadcrumb
        │   │   ├── LsrChip.tsx             # IOGP Life-Saving Rule chip
        │   │   ├── OisdReferenceCard.tsx    # OISD standard reference card
        │   │   ├── PipelineStepper.tsx      # AI pipeline progress stepper
        │   │   ├── SifClassificationBadge.tsx  # HSIF/PSIF/LOW classification
        │   │   └── TimeRangePicker.tsx      # Time range filter control
        │   ├── layout/
        │   │   ├── AppLayout.tsx            # Sidebar + CommandBar + Outlet shell
        │   │   ├── Sidebar.tsx             # Nav (11 routes), role/dataset switcher
        │   │   └── CommandBar.tsx          # Dataset badge, search, alerts, profile
        │   └── ui/                         # Radix-based primitives
        │       └── button, badge, card, dialog, dropdown, input, tabs, tooltip, etc.
        │
        ├── hooks/                          # TanStack Query custom hooks
        │   ├── use-reports.ts             # GET/POST /api/v1/reports
        │   ├── use-alerts.ts              # GET/PATCH /api/v1/alerts
        │   ├── use-auth.ts                # Login & session management
        │   ├── use-dashboard.ts           # Dashboard summary aggregation
        │   ├── use-geo.ts                 # Geospatial aggregation & assets
        │   ├── use-patterns.ts            # Pattern analysis & sweep triggers
        │   └── use-reference.ts           # IOGP, energy, barrier lookups
        │
        ├── data/                           # Bundled datasets
        │   ├── demo_set_a.json            # 16 incidents (Demo/Set A)
        │   └── demo_set_b.json            # 16 incidents (Set B)
        │
        ├── lib/                            # Utilities
        │   ├── api-client.ts              # Backend API client + fallback
        │   ├── incident-actions.ts        # Context-aware action engine
        │   └── utils.ts                   # General helpers
        │
        ├── pages/                          # 17 page components
        │   ├── PortalSelect.tsx           # Role selection (Worker vs Officer)
        │   ├── Login.tsx                  # Authentication
        │   ├── CommandCenter.tsx           # Executive overview HUD & KPIs
        │   ├── Globe.tsx                  # Fullscreen 3D geospatial intelligence
        │   ├── Triage.tsx                 # Review queue with filters & bulk actions
        │   ├── ReportDetail.tsx           # 3-column AI explainability + action plan
        │   ├── SifAnalysis.tsx            # SIF workspace, energy distribution, barriers
        │   ├── Patterns.tsx               # Pattern intelligence + 2D cluster map
        │   ├── PatternDetail.tsx          # Cluster detail & contributing reports
        │   ├── Alerts.tsx                 # SLA tracking & containment protocols
        │   ├── Analytics.tsx              # IOGP Life-Saving Rules trends
        │   ├── Assets.tsx                 # Asset registry with health scores
        │   ├── AssetDetail.tsx            # Asset precursor timeline & barrier scorecard
        │   ├── Submit.tsx                 # Officer ingest engine (Gemini LLM live)
        │   ├── WorkerSubmit.tsx           # Mobile worker portal with GPS & AI
        │   ├── AuditLog.tsx               # Immutable audit trail
        │   └── Settings.tsx               # Deterministic thresholds & ruleset config
        │
        ├── stores/                         # Zustand state stores (5 stores)
        │   ├── dataset-store.ts           # Dataset selection + localStorage persistence
        │   ├── incident-store.ts          # Incident CRUD + dataset subscription
        │   ├── app-store.ts               # Sidebar toggle, theme, selected location
        │   ├── auth-store.ts              # User profile, role, JWT token persistence
        │   └── filter-store.ts            # Time range, escalation, location, asset filters
        │
        ├── mocks/                          # Mock Service Worker (MSW)
        │   ├── browser.ts                 # MSW browser worker setup
        │   ├── handlers.ts                # API endpoint mock handlers
        │   └── fixtures.ts                # Test fixture data
        │
        │
        ├── test/
        │   └── validate-tabs-data.js      # Dataset integrity checker
        │
        └── types/
            └── index.ts                   # TypeScript interfaces
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x & **npm** ≥ 9.x
- **Python** 3.12+
- **PostgreSQL** 16 with pgvector ≥ 0.8
- **Redis** 7
- **Docker & Docker Compose** (recommended)
- **Mapbox Access Token** — [Get one free at mapbox.com](https://account.mapbox.com/)
- **Gemini API Key** — [Get one at aistudio.google.com](https://aistudio.google.com/)

### Option A: Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/pratik0144/PrecursorAI.git
cd PrecursorAI

# Start all services (PostgreSQL, Redis, API, Worker)
docker compose up -d

# Run database migrations
make migrate

# Seed reference data (IOGP rules, OISD standards, energy sources, barriers)
make seed

# Start frontend dev server
cd frontend
npm install
npm run dev
```

### Option B: Local Development

```bash
# 1. Clone & enter project
git clone https://github.com/pratik0144/PrecursorAI.git
cd PrecursorAI

# 2. Backend setup
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# 3. Start PostgreSQL & Redis (ensure pgvector extension is installed)
# PostgreSQL should be on port 5433 (or configure DATABASE_URL)

# 4. Run migrations
alembic upgrade head

# 5. Start API server
make api    # or: uvicorn app.main:app --reload --port 8000

# 6. Start background worker (in separate terminal)
make worker  # or: python -m arq app.worker.WorkerSettings

# 7. Frontend setup (in separate terminal)
cd ../frontend
npm install
npm run dev
```

The frontend will be available at **http://localhost:5173** with API proxy to **http://localhost:8000**.

> **Note:** The frontend works fully without a backend. The API client includes built-in fallback behaviour with client-side analysis when the backend is unreachable.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5433/precursor

# Redis
REDIS_URL=redis://localhost:6379

# Gemini AI (supports 3-key rotation for rate limit handling)
GEMINI_API_KEY=your_primary_gemini_key
GEMINI_API_KEY_2=your_secondary_key        # Optional
GEMINI_API_KEY_3=your_tertiary_key         # Optional

# JWT Authentication
JWT_SECRET_KEY=your_secret_key
JWT_ALGORITHM=HS256

# CORS
CORS_ORIGINS=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
# Required — Mapbox GL access token
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here

# Optional — Backend API base URL (Vite proxy handles /api/v1 in dev)
# VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 📜 Available Commands

### Makefile (root)

| Command | Description |
|---------|-------------|
| `make api` | Start Uvicorn dev server on `:8000` |
| `make worker` | Start Arq background worker |
| `make migrate` | Run Alembic migrations (upgrade head) |
| `make migrate-down` | Rollback last migration |
| `make seed` | Populate reference tables & sample data |
| `make test` | Run pytest suite |
| `make test-cov` | Run tests with coverage report |
| `make docker-up` | Start all Docker containers |
| `make docker-down` | Stop all Docker containers |
| `make fresh` | Clean reset: containers + volumes + re-migrate |

### Frontend (`frontend/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | TypeScript compile + production build |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |
| `node src/test/validate-tabs-data.js` | Verify dataset integrity (9 tabs × 3 datasets) |

---

## 🔌 Backend API

All routes mounted under `/api/v1/`:

| Method | Endpoint | Status | Description |
|--------|----------|--------|-------------|
| `POST` | `/reports/analyze-text` | ✅ Live | Immediate LLM extraction + risk scoring |
| `POST` | `/reports/` | ✅ Live | Full ingestion (DB persist + async processing) |
| `GET` | `/reports/` | ✅ Live | Paginated report list |
| `GET` | `/health` | ✅ Live | Health check |
| `GET` | `/ready` | ✅ Live | Readiness (DB + LLM reachability) |
| `GET` | `/version` | ✅ Live | Version info |
| `*` | `/auth/*` | 🔲 Stub | JWT authentication endpoints |
| `*` | `/dashboard/*` | 🔲 Stub | Dashboard aggregation |
| `*` | `/alerts/*` | 🔲 Stub | Alert CRUD & SLA management |
| `*` | `/patterns/*` | 🔲 Stub | Pattern analysis endpoints |
| `*` | `/geo/*` | 🔲 Stub | Geospatial queries |
| `*` | `/reference/*` | 🔲 Stub | IOGP/OISD reference lookup |

### Middleware Stack

1. **RLSMiddleware** — PostgreSQL Row-Level Security tenant isolation
2. **ErrorHandlerMiddleware** — Safe error formatting (no stack traces in production)
3. **RequestIDMiddleware** — Unique request ID tracking
4. **CORS** — Configurable allowed origins

---

## 🤖 AI Pipeline

### Two-Pass Extraction Architecture

```
                    Incident Report Text
                           │
                           ▼
                  ┌─────────────────┐
                  │    Pass A        │   Always runs
                  │  (Low-cost)      │   Extracts: hazard, energy sources,
                  │                  │   activity, barriers, IOGP rules,
                  │  ExtractionPassA │   OISD flag, line-of-fire proximity
                  └────────┬────────┘
                           │
                    High-energy detected?
                    ┌──────┴──────┐
                    │ NO          │ YES
                    ▼             ▼
               Return Pass A  ┌──────────────────┐
               results only   │    Pass B          │   Gated causal judgment
                              │  (Higher cost)     │   Evaluates: SIF potential,
                              │                    │   confidence, rationale,
                              │  ExtractionPassB   │   follow-up prompts
                              └────────┬───────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Risk Engine      │   Deterministic scorer
                              │  (No AI)          │   Score: 0-100
                              │                   │   Barrier weights + severity
                              │  risk_engine.py   │   bonuses + confidence penalty
                              └──────────────────┘
```

### Gemini Provider Features

- **3-Key Automatic Rotation**: Cycles through `GEMINI_API_KEY`, `_2`, `_3` on 429/403 errors
- **4.0s Timeout**: Strict per-call timeout for predictable latency
- **Matryoshka Truncation**: Native 3072-dim embeddings truncated to 1536-dim via `output_dimensionality=1536`
- **JSON Bracket Stripping**: Robust parsing of LLM JSON responses
- **Ollama Stub**: Prepared for future air-gapped deployments

### Background Worker Tasks (Arq)

| Task | Description |
|------|-------------|
| `run_pattern_sweep` | Tier-2 historical cross-correlation across reports |
| `backfill_embeddings` | Re-embed reports with DEGRADED/PENDING status |
| `escalate_sla_alerts` | Auto-escalate alerts exceeding SLA deadlines |

---

## 🗄️ Database Schema

### 18 ORM Models across 6 domains:

```
┌─────────────────────────────────────────────────────────────────┐
│                        TENANCY & AUTH                            │
│  Organization ◄──── User (5 roles: HSSE_OFFICER, SITE_MANAGER, │
│                           OPS_MANAGER, CORPORATE_LEADERSHIP,    │
│                           ADMIN)                                │
│  RulesetVersion (versioned weights for reproducible scoring)    │
├─────────────────────────────────────────────────────────────────┤
│                      REFERENCE TABLES                           │
│  IOGPRule (9 Life-Saving Rules)                                 │
│  OISDReference (Indian standards, verified flags)               │
│  EnergySource (≥1,500 J high-energy threshold)                  │
│  Barrier (direct safety controls)                               │
├─────────────────────────────────────────────────────────────────┤
│                    GEOSPATIAL HIERARCHY                          │
│  Location (World → Country → Region → Field → Site)             │
│  Asset (Rigs, Wellheads, BOPs, Pipelines)                       │
├─────────────────────────────────────────────────────────────────┤
│                    REPORTS & ANALYSIS                            │
│  Report ──► ReportExtraction (Pass A/B results)                 │
│         ──► ReportAnalysis (risk scores)                        │
│         ──► ReportEmbedding (1536-dim vectors, HNSW indexed)    │
│         ──► M2M: ReportEnergySource, ReportBarrier,             │
│                   ReportIOGPRule, ReportOISDReference            │
├─────────────────────────────────────────────────────────────────┤
│                  PATTERN INTELLIGENCE                            │
│  Pattern ◄──── PatternReport (M2M)                              │
│  SweepRun (Tier-2 batch processing metadata)                    │
├─────────────────────────────────────────────────────────────────┤
│                   ALERTS & AUDITING                              │
│  Alert ──► AlertEvent (lifecycle tracking)                      │
│  AuditLog (user action audit trail)                             │
│  LLMInvocation (AI call logging for cost tracking)              │
│  EvalExample, EvalRun, EvalResult (model evaluation)            │
└─────────────────────────────────────────────────────────────────┘
```

### Vector Dimensionality Decision

- Gemini `gemini-embedding-001` natively produces 3072 dimensions
- pgvector HNSW/IVFFlat cannot index vectors > 2000 dimensions
- **Solution**: Matryoshka truncation to **1536 dimensions** via `output_dimensionality=1536`, L2-normalized, indexed with `vector_cosine_ops`

### 13 Sequential Alembic Migrations

From initial schema through enum types, tenancy, reference tables, locations, report extensions, embeddings, alerts, patterns, audit logging, evaluation tables, indexes/constraints, to Row-Level Security policies.

---

## 🖥️ Frontend Application

### Application Routes (18 routes, all lazy-loaded)

| Route | Page | Description |
|-------|------|-------------|
| `/` | — | Redirects to `/command-center` |
| `/select-portal` | PortalSelect | Role selection (Engineer/Supervisor/Worker) |
| `/login` | Login | Authentication |
| `/command-center` | CommandCenter | **Main dashboard** — KPIs, SIF funnel, feed, map |
| `/triage` | Triage | Filterable incident triage queue |
| `/sif` | SifAnalysis | SIF potential analysis & funnel breakdown |
| `/patterns` | Patterns | Semantic pattern clustering & categories |
| `/patterns/:id` | PatternDetail | Pattern deep dive |
| `/alerts` | Alerts | Active alerts with SLA timers |
| `/analytics` | Analytics | Charts & trend analysis |
| `/assets` | Assets | Asset inventory & health overview |
| `/assets/:id` | AssetDetail | Asset safety profile |
| `/reports/:id` | ReportDetail | AI-powered report explainability |
| `/submit` | WorkerSubmit | Worker incident submission |
| `/worker` | WorkerSubmit | Worker portal (mobile-first) |
| `/globe` | GlobeView | 3D globe visualisation |
| `/audit` | AuditLog | System audit trail |
| `/settings` | Settings | Configuration & preferences |

---

## 📦 Data Model

### Incident Schema (Frontend)

```typescript
interface IncidentMarker {
  id: string;                // e.g., "RPT-2025-001"
  timestamp: string;         // ISO 8601 or relative ("3m ago")
  reportText: string;        // Natural language narrative
  reportType: string;        // UNSAFE_CONDITION | UNSAFE_ACT | SAFETY_OBSERVATION | NEAR_MISS
  locationName: string;      // e.g., "Assam / Duliajan Basin"
  lat: number;
  lng: number;
  severity: "CRITICAL" | "HIGH" | "REVIEW" | "ROUTINE";
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED";
  sifPotential: boolean;
  energySource: string;      // PRESSURE | GRAVITY | CHEMICAL | MOTION | MECHANICAL | etc.
  barrierStatus: string;     // FAILED | BYPASSED | DEGRADED | MISSING | INTACT
  asset: string;
  isLiveWorkerReport: boolean;
  patterns: PatternCluster[];
  alerts: AlertItem[];
}
```

### Bundled Datasets

| Dataset | File | Records | Description |
|---------|------|---------|-------------|
| Demo | `demo_set_a.json` | 16 incidents + 8 patterns + 6 alerts + 6 narratives | Primary demo |
| Set A | `demo_set_a.json` | 16 | Alternative view |
| Set B | `demo_set_b.json` | 16 | Stress-test scenario |

Each dataset covers 4 Indian operational basins: Assam/Duliajan, Rajasthan/Barmer, Gujarat/Mehsana, and KG Offshore Deepwater.

---

## 🗄️ State Management

PrecursorAI uses a **dual-layer state system**: Zustand for client state and TanStack React Query for server state.

### Zustand Stores (5 stores)

```
┌─────────────────┐     subscribes     ┌──────────────────┐
│  dataset-store  │ ──────────────────▶ │  incident-store  │
│                 │                     │                  │
│ • activeDataset │                     │ • incidents[]    │
│ • rawData       │                     │ • activeIncident │
│ • setActive()   │                     │ • loadIncidents()│
│                 │                     │ • resolve/reopen │
│ persists to     │                     │ • addWorkerInc() │
│ localStorage    │                     └──────────────────┘
└─────────────────┘                              │
                                                 │ consumed by
┌─────────────────┐  ┌────────────────┐          ▼
│   app-store     │  │  auth-store    │  ┌──────────────────┐
│                 │  │                │  │  All Pages &     │
│ • sidebarOpen   │  │ • user profile │  │  Components      │
│ • theme         │  │ • role (RBAC)  │  └──────────────────┘
│ • selectedLoc   │  │ • JWT token    │
└─────────────────┘  │ • persists to  │  ┌──────────────────┐
                     │   localStorage │  │  filter-store    │
                     └────────────────┘  │                  │
                                         │ • timeRange      │
                                         │ • escalation     │
                                         │ • location       │
                                         │ • asset          │
                                         └──────────────────┘
```

| Store | Key State | Persistence | Purpose |
|-------|-----------|-------------|---------|
| **dataset-store** | `activeDatasetId`, `rawData` | `localStorage('precursor_active_dataset')` | Controls which dataset is active; auto-pushes to incident-store |
| **incident-store** | `incidents[]`, `activeIncident` | In-memory | Incident queue with CRUD, worker submission, resolve/reopen |
| **app-store** | `sidebarOpen`, `theme`, `selectedLocation` | In-memory | Transient UI state |
| **auth-store** | `user`, `role`, `token`, `isAuthenticated` | `localStorage` | JWT auth, 5-role RBAC (HSSE_OFFICER, SITE_MANAGER, etc.) |
| **filter-store** | `timeRange`, `escalation`, `location`, `asset` | In-memory | Cross-cutting filter state for all views |

### TanStack Query Hooks

| Hook | Endpoints | Description |
|------|-----------|-------------|
| `useReports` | `GET/POST /api/v1/reports` | Report listing & submission |
| `useAlerts` | `GET/PATCH /api/v1/alerts` | Alert management & acknowledgement |
| `useAuth` | `GET/POST /api/v1/auth` | Login & session management |
| `useDashboard` | `GET /api/v1/dashboard/summary` | KPI aggregation |
| `useGeo` | `GET /api/v1/geo/aggregate` | Geospatial data & asset locations |
| `usePatterns` | `GET/POST /api/v1/patterns` | Pattern analysis & sweep triggers |
| `useReference` | `GET /api/v1/reference/*` | IOGP rules, energy sources, barriers |

---

## 🎨 Design System

PrecursorAI implements a **Light-Mode Command-Center Theme** optimised for high-contrast, data-dense industrial safety operations.

### Surface Elevation Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--color-background` | `#F8FAFC` (Slate 50) | Page background |
| `--color-surface-1` | `#FFFFFF` | Cards & panels |
| `--color-surface-2` | `#F1F5F9` (Slate 100) | Secondary surfaces |
| `--color-surface-3` | `#E2E8F0` (Slate 200) | Tertiary surfaces |

### Typography

| Token | Value | Usage |
|-------|-------|-------|
| `--color-foreground` | `#0F172A` (Slate 900) | Primary text |
| `--color-foreground-muted` | `#64748B` (Slate 500) | Secondary text |
| `--color-foreground-dim` | `#94A3B8` (Slate 400) | Tertiary/disabled text |
| **Font (UI)** | `Inter, system-ui, sans-serif` | All UI text |
| **Font (Data)** | `JetBrains Mono, SF Mono` with `tabular-nums` | Metrics, IDs, timestamps, coordinates |

### Brand & Accent

| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` | `#0891B2` (Cyan 600) | Primary brand, buttons, links |
| `--color-accent-hover` | `#0E7490` (Cyan 700) | Hover states |
| `--color-primary-foreground` | `#FFFFFF` | Text on primary backgrounds |

### Escalation Scale (Colorblind-Safe)

| Level | Token | Colour | Hex |
|-------|-------|--------|-----|
| Routine | `--color-routine` | Teal | `#0D9488` |
| Review | `--color-review` | Amber | `#D97706` |
| High | `--color-high` | Orange | `#EA580C` |
| Critical | `--color-critical` | Red | `#DC2626` |
| SIF | `--color-sif` | Deep Red | `#B91C1C` |

### Barrier Status Defence Tokens

| Status | Token | Colour | Hex |
|--------|-------|--------|-----|
| Intact | `--color-barrier-intact` | Emerald | `#059669` |
| Degraded | `--color-barrier-degraded` | Amber | `#D97706` |
| Missing | `--color-barrier-missing` | Red | `#DC2626` |
| Bypassed | `--color-barrier-bypassed` | Rose | `#E11D48` |
| Failed | `--color-barrier-failed` | Deep Red | `#B91C1C` |
| Unknown | `--color-barrier-unknown` | Grey | `#9CA3AF` |

### Chart Palette

`#0891B2` → `#2DD4BF` → `#F59E0B` → `#EF4444` → `#8B5CF6`

### Layout

| Token | Value |
|-------|-------|
| `--radius` | `0.5rem` |

---

## ⚙️ Core Algorithms

### 1. Strict Three-Factor SIF Precursor Gate

Implemented across `ThreeFactorGate.tsx`, `SifAnalysis.tsx`, `ReportDetail.tsx`, and `risk_engine.py`:

$$\text{SIF Precursor} \iff (\text{High-Energy Source} \ge 1500\,\text{J}) \land (\text{Person in Danger Zone}) \land (\text{Barrier Compromised})$$

**Classification Output:**
| Result | Meaning |
|--------|---------|
| `HSIF` | High-Potential SIF — all 3 factors present with high confidence |
| `PSIF` | Potential SIF — factors present but confidence < threshold |
| `LOW_ENERGY` | Energy source below 1,500 J threshold |
| `CAPACITY` | Adequate barrier protection in place |

### 2. Explainable Risk Score Receipt

Deterministic additive scoring model (visualised in `RiskScoreReceipt.tsx`):

```
Risk Score = Barrier Weight (+25)
           + Severity Weight (+30)
           + SIF Bonus      (+20)
           - Confidence Penalty (-5)
           ─────────────────────────
           = 70 → 92 (typical range)
```

| Component | Weight | Condition |
|-----------|--------|-----------|
| Barrier degradation | +15 to +25 | DEGRADED (+15), BYPASSED (+20), FAILED (+25), MISSING (+25) |
| Severity bonus | +10 to +30 | ROUTINE (+0), REVIEW (+10), HIGH (+20), CRITICAL (+30) |
| SIF potential | +15 to +20 | If 3-factor gate evaluates to HSIF or PSIF |
| Confidence penalty | -5 to -10 | When AI confidence score < 60% |

**Thresholds:** ≥70 = Critical, ≥50 = High, ≥30 = Medium, <30 = Low

### 3. Context-Aware Action Engine (`incident-actions.ts`)

`getIncidentNextSteps(incident)` classifies incidents via keyword matching and generates protocol-grounded containment directives:

| Incident Type | Protocol Reference | Key Actions | SLA |
|---------------|-------------------|-------------|-----|
| Gas/H2S/Toxic | API RP 55 | Upwind evacuation, SCBA check, gas detection | < 10 min |
| Well Control/BOP | API RP 53 | Stop Work Authority, depressurise to flare | < 15 min |
| Working at Height | OSHA 1926.451 | 100% dual-lanyard tie-off, fall arrest | < 10 min |
| Line of Fire/DROPS | IOGP LSR | 15m Red Zone exclusion perimeter | Immediate |
| Electrical/Isolation | NFPA 70E / OSHA 1910.147 | LOTO verification, zero-energy state test | < 15 min |
| Hot Work/Welding | NFPA 51B | LEL < 1% atmospheric test, fire watch | < 10 min |
| Chemical Exposure | OSHA HCS | Decontamination, SDS lookup, medical eval | < 10 min |
| Confined Space | OSHA 1910.146 | Atmospheric test, rescue team standby | < 15 min |
| Pressure Vessel | API 510 | Isolation, controlled depressurisation | < 15 min |

### 4. Semantic 2D Cluster Space Projection (`SemanticClusterMap.tsx`)

Projects patterns into an interactive 2D SVG coordinate space using deterministic hashing:

**Centroid Anchors:**
| Pattern Type | Position | Radius | Colour |
|-------------|----------|--------|--------|
| COMPOUNDING | (220, 150) | 95px | Red |
| EMERGING | (580, 140) | 90px | Orange |
| RECURRING | (260, 310) | 95px | Amber |
| SYSTEMIC | (600, 300) | 85px | Teal |

**Point Placement Math:**
```
Angle    = (hash % 360) × π / 180
Distance = 35 + (hash % 50)
X = X_centroid + cos(Angle) × Distance
Y = Y_centroid + sin(Angle) × Distance
```

### 5. RAG Vector Similarity Search (`rag.py`)

- Cosine distance (`<=>`) over 1536-dim HNSW-indexed embeddings
- Queries IOGP/OISD safety knowledge chunks
- Returns top-K matches with similarity scores for grounding AI recommendations

---

## 🐳 Docker Deployment

```yaml
# docker-compose.yml services:
services:
  db:       pgvector/pgvector:0.8.0-pg16  →  port 5433
  redis:    redis:7-alpine                 →  port 6379
  api:      ./backend/Dockerfile           →  port 8000
  worker:   ./backend/Dockerfile.worker    →  background
```

```bash
# Full deployment
docker compose up -d

# Database setup
make migrate
make seed

# Frontend (separate)
cd frontend && npm install && npm run dev
```

---

## 📚 Documentation

| File | Lines | Description |
|------|-------|-------------|
| [`README.md`](README.md) | — | This file |
| [`Indepth-overview.md`](Indepth-overview.md) | 778 | Comprehensive system guide with data flows, prompt strategies, known gaps |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | — | Design principles, two-tier pipeline, SIF formula, Mermaid diagrams |
| [`docs/SCHEMA.md`](docs/SCHEMA.md) | — | Database schema, ER diagram, vector dimensionality decision, RLS |
| [`PROMPT_1_FRONTEND.md`](PROMPT_1_FRONTEND.md) | — | Enterprise frontend redesign specification |
| [`PROMPT_2_BACKEND.md`](PROMPT_2_BACKEND.md) | — | Backend hardening & extension specification |
| [`PROMPT_3_DATABASE.md`](PROMPT_3_DATABASE.md) | — | Database evolution & migration specification |

---

## 🗺️ Roadmap

- [ ] Implement stubbed API routes (alerts, auth, dashboard, geo, patterns, reference)
- [ ] Connect frontend to live backend endpoints (replace JSON fallback)
- [ ] CI/CD pipeline (GitHub Actions for lint, test, Docker build)
- [ ] Real-time WebSocket integration for live worker reports
- [ ] Push notifications for critical SIF alerts
- [ ] Role-based authentication with SSO/LDAP
- [ ] Historical trend analytics with time-series charts
- [ ] PDF report export for regulatory compliance
- [ ] Multi-language support (Hindi, Marathi, Gujarati)
- [ ] SCADA/IoT sensor data integration
- [ ] Mobile native app (React Native)
- [ ] Offline-first PWA for remote field locations
- [ ] Ollama integration for air-gapped deployments
- [ ] Model evaluation framework (EvalRun/EvalResult tables ready)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is developed for **Smart India Hackathon (SIH) 2026**.

---

<p align="center">
  <img src="frontend/public/logo.png" alt="PrecursorAI Logo" width="48" />
  <br />
  <sub>Built with ❤️ for safer oil &amp; gas operations in India</sub>
</p>
