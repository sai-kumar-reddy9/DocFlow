from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class DocumentResponse(BaseModel):
    """
    Schema returned for document metadata representation.
    Note: Physical filesystem paths are NEVER exposed to clients.
    """
    id: str
    owner_id: str
    original_filename: str
    stored_filename: str
    file_extension: str
    mime_type: str
    file_size: int = Field(..., description="File size in bytes")
    upload_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DocumentList(BaseModel):
    """
    Schema for document list responses.
    """
    items: List[DocumentResponse]
    total: int
