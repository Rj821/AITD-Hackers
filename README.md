<<<<<<< HEAD
# Memoria AI

Memoria AI is an organizational memory system that remembers, learns, and provides intelligent recommendations based on past experiences.

## Vision

Memoria AI stores organizational experience instead of only saving documents. It ingests meeting notes, incident reports, decisions, and customer feedback, then surfaces contextual knowledge whenever teams need it.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS
- Backend: FastAPI
- AI / Memory: Hindsight-compatible architecture with memory search and similarity
- Database: SQLite for starter prototype (upgradeable to PostgreSQL or Supabase)

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file from `.env.example` and update `DATABASE_URL` and Hindsight settings.

```bash
copy .env.example .env
```

Run migrations and start the server:

```bash
alembic upgrade head
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Notes

- The backend now supports PDF/DOCX parsing, Hindsight vector ingest/search workflow, PostgreSQL via `DATABASE_URL`, and Alembic migrations.
- The frontend includes file ingest, tag support, and a richer React Flow knowledge graph with custom node cards and connection styling.
- If Hindsight is not configured, the app still stores local memory and serves search/timeline/insights.
=======
# AITD-Hackers
This is a project created by AITD Hackers.
>>>>>>> 9c009939b16bbc06e8de3d9da2aede33486e6302
