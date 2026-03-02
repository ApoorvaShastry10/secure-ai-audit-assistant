# Secure AI Audit Assistant (Local Dev) — RAG + Graph RBAC
Secure RAG-based audit assistant with:
- FastAPI backend (async, JWT)
- React (Vite) frontend
- PostgreSQL (relational)
- Neo4j (graph RBAC)
- ChromaDB (vector store)
- Tamper-evident audit log (SHA-256 hash chain)
- Fully local Docker Compose setup
-------
## Prerequisites
Install:
- Docker Desktop (includes Docker Compose v2)
- Git

- Recommended:
- VS Code

## Quick Start (Local)

### 1) Clone repo
```bash
git clone https://github.com/rinkutek/secure-ai-audit-assistant.git
cd secure-ai-audit-assistant

## Run locally (Docker Compose)

```bash
cp .env.example .env
docker compose up --build
```

Run migrations + seed:

```bash
docker compose exec api bash -lc "alembic upgrade head"
docker compose exec api bash -lc "python -m app.scripts.seed"
```

Run tests:

```bash
docker compose exec api bash -lc "pytest -q"
```

Frontend: http://localhost:5173  
API: http://localhost:8080  
Neo4j browser: http://localhost:7474  

Mock mode (offline) is enabled by default via `MOCK_MODE=true`.
