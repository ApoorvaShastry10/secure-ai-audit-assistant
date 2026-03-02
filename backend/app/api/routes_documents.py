from fastapi import APIRouter, Depends, UploadFile, File, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pathlib import Path
from starlette.status import HTTP_413_REQUEST_ENTITY_TOO_LARGE
from app.api.deps import get_current_user, get_client_ip
from app.core.config import settings
from app.core.exceptions import AppError
from app.db.session import get_db
from app.db.models import Document, DocumentChunk
from app.schemas.documents import UploadResponse, DocumentWithChunks, DocumentOut, ChunkOut
from app.services.doc_ingest import ingest_document
from app.services.audit_log import write_audit_log

router = APIRouter(prefix="/documents")

@router.post("/upload", response_model=UploadResponse)
async def upload_document(request: Request, file: UploadFile = File(...), title: str = "Untitled",
                          db: AsyncSession = Depends(get_db), user=Depends(get_current_user),
                          client_ip: str = Depends(get_client_ip)) -> UploadResponse:
    user_id = user["user_id"]; roles=user.get("roles", [])
    data = await file.read()
    if len(data) > settings.max_upload_bytes:
        raise AppError("File too large", status_code=HTTP_413_REQUEST_ENTITY_TOO_LARGE, code="UPLOAD_TOO_LARGE")
    storage_dir = Path(settings.doc_storage_dir); storage_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename or "upload.txt").name
    path = storage_dir / safe_name
    path.write_bytes(data)
    content_text = data.decode("utf-8", errors="replace")
    doc_id, chunks_created = await ingest_document(db, title=title, filename=safe_name, storage_path=str(path), content_text=content_text)
    await write_audit_log(db, user_id=user_id, action="DOCUMENT_UPLOAD", outcome="ALLOW", resource_ids=[doc_id], client_ip=client_ip, roles=roles)
    await db.commit()
    return UploadResponse(doc_id=doc_id, chunks_created=chunks_created)

@router.get("/{doc_id}", response_model=DocumentWithChunks)
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db), user=Depends(get_current_user)):
    if "admin" not in user.get("roles", []):
        raise AppError("Admin role required", status_code=403, code="FORBIDDEN")
    doc = (await db.execute(select(Document).where(Document.id == doc_id))).scalar_one_or_none()
    if not doc:
        raise AppError("Document not found", status_code=404, code="NOT_FOUND")
    res = await db.execute(select(DocumentChunk).where(DocumentChunk.doc_id==doc_id).order_by(DocumentChunk.chunk_index.asc()))
    chunks = res.scalars().all()
    return DocumentWithChunks(
        document=DocumentOut(id=doc.id, title=doc.title, filename=doc.filename, created_at=doc.created_at),
        chunks=[ChunkOut(id=c.id, chunk_index=c.chunk_index, content=c.content) for c in chunks],
    )
