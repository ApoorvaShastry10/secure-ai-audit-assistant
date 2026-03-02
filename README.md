# Secure AI Audit Assistant (Local Dev) — RAG + Graph RBAC + Tamper-Evident Audit Log

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
