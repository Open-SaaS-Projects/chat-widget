from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class Document(BaseModel):
    id: Optional[str] = None
    project_id: str
    filename: str
    file_type: str
    file_path: str
    upload_date: datetime = datetime.utcnow()
    status: str = "pending" # pending, processing, completed, failed

class Chunk(BaseModel):
    id: Optional[str] = None
    document_id: str
    content: str
    embedding: List[float]
    chunk_index: int
