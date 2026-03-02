## Architecture explanation (10–15 bullets)

1. FastAPI async backend serves all API requests; React (Vite) frontend is a separate container.
2. All protected endpoints require a valid JWT access token; user_id and roles are extracted from the token.
3. Query input is normalized and length-limited (default 512 chars).
4. Embeddings are computed for the query (offline deterministic embeddings in MOCK mode).
5. ChromaDB provides semantic retrieval over chunk embeddings (top-k).
6. BM25 keyword search runs locally over chunk text stored in Postgres.
7. Candidates are merged and reranked with a weighted hybrid score (HYBRID_ALPHA).
8. Neo4j graph RBAC is queried for an allowlist of doc_ids; deny-by-default.
9. RBAC is applied before any retrieved text is returned or passed to the LLM.
10. If Neo4j is unavailable, the system fails closed with 503.
11. If no authorized chunks remain after filtering, the system returns "No results (insufficient access)" and does not leak snippet previews.
12. Only authorized chunks are passed into the LLM provider (OpenAI-compatible or offline mock).
13. Every security-relevant action writes an append-only audit entry in Postgres using a SHA-256 hash chain.
14. If audit log write fails, the protected request fails closed.
15. Audit chain integrity can be verified via /audit-logs/verify and exported via /audit-logs/export.
