import os
import uuid
import pathlib
from typing import List, Optional, Tuple
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.document import Document

# Local file storage target directory
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../uploads"))

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 10 MB Maximum File Size Limit
MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10,485,760 bytes

# Allowed file extensions and corresponding MIME types
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}
ALLOWED_MIME_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
}

# Unsafe extensions explicitly blocked
BLOCKED_EXTENSIONS = {".exe", ".zip", ".rar", ".js", ".bat", ".dll", ".sh", ".vbs", ".cmd", ".msi", ".py", ".php"}


def validate_file_security(file: UploadFile, content: bytes) -> Tuple[str, str]:
    """
    Validates file size, extension, and MIME type.
    Raises HTTP 413 for oversized files or HTTP 415 for unsupported/unsafe extensions.
    """
    # 1. Validate File Size
    file_size = len(content)
    if file_size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size ({file_size / (1024 * 1024):.2f} MB) exceeds maximum allowed limit of 10 MB.",
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot upload an empty file.",
        )

    # 2. Extract and sanitize extension
    raw_filename = file.filename or ""
    sanitized_filename = os.path.basename(raw_filename)
    ext = pathlib.Path(sanitized_filename).suffix.lower()

    if not ext or ext in BLOCKED_EXTENSIONS or ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file format '{ext}'. Only PDF, DOCX, and TXT files are permitted.",
        )

    # 3. Validate MIME Type (permissive fallback for plain text / docx variants)
    content_type = file.content_type.lower() if file.content_type else ""
    if content_type and content_type not in ALLOWED_MIME_TYPES and not content_type.startswith("text/"):
        if ext == ".txt":
            content_type = "text/plain"
        elif ext == ".pdf":
            content_type = "application/pdf"
        elif ext == ".docx":
            content_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        else:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Invalid MIME type '{file.content_type}' for extension '{ext}'.",
            )

    return ext, content_type or "application/octet-stream"


async def save_file_to_disk(content: bytes, file_extension: str) -> Tuple[str, str]:
    """
    Generates a unique UUID filename and saves the file content to local disk (`backend/uploads/`).
    Returns (stored_filename, absolute_file_path).
    """
    unique_id = str(uuid.uuid4())
    stored_filename = f"{unique_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    # Prevent path traversal attacks
    resolved_path = os.path.abspath(file_path)
    if not resolved_path.startswith(UPLOAD_DIR):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Path traversal security violation detected.",
        )

    with open(resolved_path, "wb") as f:
        f.write(content)

    return stored_filename, resolved_path


async def create_document(
    db: AsyncSession,
    file: UploadFile,
    owner_id: str,
) -> Document:
    """
    Business Logic: Reads upload content, validates file size & extension, saves file
    to local storage (`backend/uploads/`), and creates metadata record in database.
    """
    content = await file.read()
    file_ext, mime_type = validate_file_security(file, content)
    stored_filename, file_path = await save_file_to_disk(content, file_ext)

    sanitized_original_name = os.path.basename(file.filename or f"document{file_ext}")

    db_document = Document(
        owner_id=owner_id,
        original_filename=sanitized_original_name,
        stored_filename=stored_filename,
        file_extension=file_ext,
        mime_type=mime_type,
        file_size=len(content),
        file_path=file_path,
        upload_status="PROCESSED",
    )
    db.add(db_document)
    await db.commit()
    await db.refresh(db_document)
    return db_document


async def get_user_documents(db: AsyncSession, owner_id: str) -> List[Document]:
    """
    Retrieves all document metadata records belonging to the specified user.
    """
    result = await db.execute(
        select(Document)
        .where(Document.owner_id == owner_id)
        .order_by(Document.created_at.desc())
    )
    return list(result.scalars().all())


async def get_document_by_id(db: AsyncSession, document_id: str) -> Optional[Document]:
    """
    Retrieves a single document metadata record by ID.
    """
    result = await db.execute(select(Document).where(Document.id == document_id))
    return result.scalars().first()


async def delete_document(db: AsyncSession, document: Document) -> None:
    """
    Removes the physical file from local disk (`backend/uploads/`) and deletes metadata from DB.
    """
    # 1. Remove file from filesystem
    if os.path.exists(document.file_path):
        try:
            os.remove(document.file_path)
        except OSError:
            pass

    # 2. Delete metadata row from database
    await db.delete(document)
    await db.commit()
