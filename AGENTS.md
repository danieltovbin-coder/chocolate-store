# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

This is a "Chocolate Store" demo app: Next.js 15 frontend (port 3000) + FastAPI backend (port 8000) + PostgreSQL 16 (port 55432) + Redis 7 (port 63790). See the root `README.md` for full details.

### Running the stack

- **Preferred command:** `make dev` bootstraps dependencies, starts Postgres/Redis, and launches both app servers. `Ctrl-C` tears everything down.
- **Individual targets:** `make setup`, `make services-up`, `make services-down`, `make stop` — see the `Makefile`.

### Root-user caveat (Cloud Agent VMs)

The Cloud Agent VM runs as `root`. PostgreSQL's `initdb` and `pg_ctl` refuse to run as root. Workaround:

```bash
# initdb (first time only)
chown postgres:postgres .data/postgres
su -s /bin/bash postgres -c "/usr/lib/postgresql/16/bin/initdb -D /workspace/.data/postgres -U chocolate --auth=trust --encoding=UTF8"
chown -R root:root .data/postgres

# start postgres
chown -R postgres:postgres .data/postgres logs
su -s /bin/bash postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /workspace/.data/postgres -l /workspace/logs/postgres.log -o \"-p 55432 -h 127.0.0.1 -k /workspace/.data/postgres\" start"
```

Redis and the app servers run fine as root.

### Tests & linting

- `make test` runs both backend (pytest) and frontend (vitest) tests.
- `make test-backend` requires Postgres + Redis running on the configured ports.
- `make test-frontend` has no infrastructure dependencies.
- Frontend lint: `cd frontend && npx eslint .`

### Database

The DB is disposable — schema + seed data are recreated from SQLAlchemy models on every `make services-up`. Edit `backend/app/seed.py` to change the catalog. No migration framework is used.

### System dependencies

PostgreSQL 16 binaries must be on `PATH` (or at `/usr/lib/postgresql/16/bin`). Redis 7 must be installed. Node.js 20+ and Python 3.12+ are required. The `python3.12-venv` package is also needed for the backend virtual environment.
