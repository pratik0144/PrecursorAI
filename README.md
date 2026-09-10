# PrecursorAI

> AI-powered safety intelligence system for OIL.

PrecursorAI reads unstructured Unsafe Act, Unsafe Condition, and Near-Miss reports to determine whether individual reports contain Serious Injury & Fatality (SIF) precursors, and identifies recurring patterns across thousands of historical reports.

**"AI prioritizes. Safety professionals decide."**

---

## Architecture

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Python + FastAPI (modular monolith) |
| Database | PostgreSQL + pgvector |
| AI | Gemini + Embeddings + RAG |

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

| Method | Endpoint | Description |
|---|---|---|
| POST | /reports | Submit a safety report |
| GET | /reports | List all reports |
| GET | /reports/{id} | Get report details |
| GET | /dashboard/summary | Dashboard metrics |
| GET | /alerts | List alerts |
| PATCH | /alerts/{id}/read | Mark alert as read |
| GET | /patterns | List detected patterns |
| GET | /patterns/{id} | Pattern details + contributing reports |
| POST | /cognition/sweep | Trigger Tier 2 sweep |
| GET | /cognition/status | Cognition job status |

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
