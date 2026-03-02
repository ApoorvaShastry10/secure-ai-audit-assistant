from pydantic import BaseModel
from typing import List
from datetime import datetime

class DocumentOut(BaseModel):
    id: str
    title: str
    filename: str
    created_at: datetime

class UploadResponse(BaseModel):
    doc_id: str
    chunks_created: int

class ChunkOut(BaseModel):
    id: str
    chunk_index: int
    content: str

class DocumentWithChunks(BaseModel):
    document: DocumentOut
    chunks: List[ChunkOut]
