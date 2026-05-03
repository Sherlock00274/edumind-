# EduMind

EduMind is an adaptive learning system for final exam preparation.

The repository is split into two application folders:

- `frontend/`: Vite + React mobile-first learning UI.
- `backend/`: Python + FastAPI backend architecture and API service.

Project-level design guidance lives in `docs/`.

## Run Frontend

```bash
cd frontend
npm run dev
```

## Run Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

## Architecture

Read [docs/backend-guidance.md](docs/backend-guidance.md) for the backend system design, data model, API contract, risk controls, and MVP implementation order.
