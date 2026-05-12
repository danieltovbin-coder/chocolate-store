# Create / run the chocolate store demo

This repository is a **field-engineer friendly** local demo: Next.js shop, FastAPI, Postgres, and Redis. Follow these steps so the stack is ready and the presenter knows what to show.

## Goal

- **Bootstrap** dependencies and local data layout (`make setup`).
- **Run** the full stack (`make dev`) so the shop is at **http://127.0.0.1:3000** and the API at **http://127.0.0.1:8000**.
- **Confirm** health endpoints respond after the servers start.

## Prerequisites (verify before setup)

From the repo root [`README.md`](../../README.md):

- **Python 3.9+** (3.12+ recommended).
- **Node.js 20+** and `npm`.
- **Postgres 16** on `PATH`: `initdb`, `pg_ctl`, `psql` (Ubuntu: `postgresql` package; scripts may add `/usr/lib/postgresql/16/bin` to `PATH`).
- **Redis 7** binaries: `redis-server`, `redis-cli`.

If **`initdb` is missing**, install Postgres first — `make setup` will fail until it is available.

## Execution

1. **From the repository root**, ensure scripts are executable (Make does this for `setup` / `dev`).
2. Run **`make setup`** once (or after a clean clone). This creates `backend/.venv`, installs Python and npm deps, copies `.env.example` → `.env` if needed, and prepares a Postgres cluster under `./.data/postgres` when `initdb` exists.
3. Run **`make dev`**. This brings up Postgres (**55432**), Redis (**63790**), seeds the DB, then starts **uvicorn** on **8000** and **next dev** on **3000**. It is **long-running**; use a dedicated terminal. **Ctrl-C** tears down the web stack and project-local Postgres/Redis.
4. After servers listen, verify:
   - **Shop:** http://127.0.0.1:3000  
   - **API health:** http://127.0.0.1:8000/api/health  
   - **OpenAPI:** http://127.0.0.1:8000/openapi.json  

If ports are in use, run **`make stop`** from another terminal, then retry.

## Suggested talking points (optional)

Align with README **“Suggested Cursor as a field engineer demo”**:

1. Browse the shop, add to cart, open the cart sheet, place a **mock** order; show **Network** for `POST /api/checkout`.
2. Hot-reload: edit `frontend/src/app/shop/page.tsx` and save.
3. API reload: tweak `backend/app/routers/chocolates.py`, refresh the list.
4. Redis: after loading `/api/chocolates` twice, `make redis-cli` and `KEYS chocolates:*` for cache keys.
5. Clean shutdown: Ctrl-C, then confirm ports **55432**, **63790**, **8000**, **3000** are free (per README `lsof` example).

## Safety

- Do **not** commit `.env` or secrets; only template/example env files belong in git.
- **`make nuke-confirm`** deletes `./.data/` — use only when a full reset is intended.

## If setup fails in a container or minimal image

Install Postgres and Redis packages for the OS (see README), ensure `initdb` is on `PATH`, then re-run **`make setup`** and **`make dev`**.

## Reply to the user

Summarize what ran (**setup** / **dev** / both), any **install gaps** (e.g. missing `initdb`), and the **URLs** to open. If `make dev` was started in the background, say how to **stop** it (`Ctrl-C` in that terminal or `make stop`).
