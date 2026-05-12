# AGENTS.md

## Cursor Cloud specific instructions

### Overview

This is a Chocolate Store demo — a Next.js 15 + FastAPI monorepo with user-level PostgreSQL 16 and Redis 7. See `README.md` for full details.

### Running Services

All services start with `make dev` (single command, tears down on Ctrl-C). For manual control:

| Service | Command | Port |
|---------|---------|------|
| PostgreSQL + Redis | `make services-up` / `make services-down` | 55432, 63790 |
| Backend (FastAPI) | `cd backend && .venv/bin/uvicorn app.main:app --reload --host 127.0.0.1 --port 8000` | 8000 |
| Frontend (Next.js) | `cd frontend && NEXT_PUBLIC_API_URL=http://127.0.0.1:8000 npm run dev -- -p 3000` | 3000 |

### Key Caveats

- **Database is disposable**: Every `make services-up` drops and recreates the DB from SQLAlchemy models + `backend/app/seed.py`. No migrations exist.
- **Services must be running for backend tests**: `make services-up` must be run before `make test-backend`. Backend integration tests hit real Postgres/Redis on ports 55432/63790.
- **Frontend tests are standalone**: `make test-frontend` (vitest) does not require services.
- **System services must be stopped**: The project uses custom ports but if the system `postgresql` or `redis-server` services are running, disable them first (`sudo systemctl stop postgresql redis-server`).

### Commands Reference

- **Lint**: `cd frontend && npm run lint`
- **Test all**: `make test` (requires `make services-up` first)
- **Test backend only**: `make test-backend`
- **Test frontend only**: `make test-frontend`
- **Health check**: `curl http://127.0.0.1:8000/api/health`
