from fastapi import APIRouter
from app.api.routes_auth import router as auth_router
from app.api.routes_query import router as query_router
from app.api.routes_documents import router as docs_router
from app.api.routes_admin import router as admin_router
from app.api.routes_audit import router as audit_router

router = APIRouter()
router.include_router(auth_router, tags=["auth"])
router.include_router(query_router, tags=["query"])
router.include_router(docs_router, tags=["documents"])
router.include_router(admin_router, tags=["admin"])
router.include_router(audit_router, tags=["audit"])
