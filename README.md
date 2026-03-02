# Secure AI Audit Assistant  
**Secure RAG + Graph-Based RBAC + Tamper-Evident Audit Log (Local Dev)**

---

## 📌 Overview

Secure AI Audit Assistant is a fully local, Dockerized application that allows auditors and compliance users to securely query internal documents using:

- ✅ Hybrid RAG (Semantic + BM25 Retrieval)
- ✅ Graph-Based RBAC (Neo4j)
- ✅ JWT Authentication
- ✅ Tamper-Evident Audit Logs (SHA-256 Hash Chain)
- ✅ Fail-Closed Security Model
- ✅ Fully Offline Mock Mode (No external LLM required)

Everything runs locally using Docker Compose.

---

## 🏗 Architecture

**Backend**
- FastAPI (Async)
- SQLAlchemy (Async)
- PostgreSQL
- Neo4j (RBAC graph)
- ChromaDB (Vector Store)

**Frontend**
- React (Vite)

**Security**
- JWT authentication
- RBAC enforced BEFORE LLM
- No unauthorized snippet leakage
- Append-only audit log with integrity verification

---

# 🚀 Quick Start (Local Setup)

## 1️⃣ Prerequisites

Install:

- Docker Desktop (includes Docker Compose v2)
- Git

Verify installation:

```bash
docker --version
docker compose version
```

```bash
docker --version
docker compose version
