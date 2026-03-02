## Security checklist

- RBAC applied before LLM ✅
- No unauthorized snippet previews ✅
- Fail closed if Neo4j down ✅
- Fail closed if audit log write fails ✅
- JWT required for all protected endpoints ✅
- Query length limit 512 ✅
- Input validation (Pydantic) ✅
- Proper status codes (401/403/413/503) ✅
- Append-only audit log with SHA-256 hash chain ✅
- Integrity verification endpoint ✅
- CSV/JSON export endpoint ✅
- Offline mock embeddings + mock LLM ✅
