# ResearchFlow

A research-focused task manager for researchers working on multiple papers.

## Current slice

- Name-only sign in
- Multiple research papers per user
- Paper-specific tasks
- Sequential task positions
- Task categories
- Automatic paper progress
- Optional conference/deadline fields on each paper
- Automatic days-left calculation
- Basic work-pace status: Need to Hurry / Work Normally / Work Thoroughly
- Dark/light mode

## Stack

React + Vite + FastAPI + SQLAlchemy + PostgreSQL

## Run locally

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn src.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Set `VITE_API_URL` in `frontend/.env` if the backend is not running on localhost:8000.

> The new name-only user model is not compatible with an old database containing the original username/password schema. Use a fresh development database for this version.
