from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Request
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.core.rate_limiter import RateLimiterDependency
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentList
from app.services import document_service, cache_service, activity_log_service

router = APIRouter()

# Redis Rate Limiter: Max 10 uploads per minute per user/IP
upload_rate_limiter = RateLimiterDependency(prefix="doc_upload", max_requests=10, window_seconds=60)


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(upload_rate_limiter)],
    summary="Upload document (PDF, DOCX, TXT)",
    description="Validates file size (max 10MB) and format, saves to local disk, stores metadata in database, and invalidates Redis cache.",
)
async def upload_document(
    request: Request,
    file: UploadFile = File(..., description="Target document file (PDF, DOCX, or TXT)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Document Upload Endpoint.
    Stores file in backend/uploads/, creates DB metadata, and invalidates user cache.
    """
    document = await document_service.create_document(
        db=db,
        file=file,
        owner_id=current_user.id,
    )

    client_ip = request.client.host if request.client else None
    await activity_log_service.log_activity(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_UPLOADED",
        details=f"Uploaded document {document.original_filename} ({document.file_size} bytes)",
        ip_address=client_ip,
    )

    # Invalidate Redis user documents, dashboard cache, and admin analytics cache
    await cache_service.invalidate_user_cache(current_user.id)
    await cache_service.delete_cache_key("analytics:admin:overview")

    return document


@router.get(
    "",
    response_model=DocumentList,
    summary="List documents for current authenticated user (Redis Cached)",
    description="Returns all document metadata records for requesting user. Reads from Redis cache if available, falling back to PostgreSQL/SQLite on cache miss.",
)
async def list_my_documents(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List User Documents Endpoint with Redis Caching.
    Cache Key: `documents:user:{user_id}`
    """
    cache_key = cache_service.build_user_documents_cache_key(current_user.id)

    # 1. Try fetching from Redis Cache
    cached_data = await cache_service.get_cached_json(cache_key)
    if cached_data:
        return DocumentList(**cached_data)

    # 2. Database Query on Cache Miss
    documents = await document_service.get_user_documents(db, owner_id=current_user.id)
    doc_list = DocumentList(items=documents, total=len(documents))

    # 3. Store fresh result in Redis Cache with TTL
    await cache_service.set_cached_json(cache_key, doc_list.model_dump())

    return doc_list


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get document metadata by ID",
    description="Fetches single document metadata. Returns 404 if not found, 403 if document belongs to another user.",
)
async def get_document_details(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get Single Document Endpoint.
    Validates ownership to prevent unauthorized access to other users' documents.
    """
    document = await document_service.get_document_by_id(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Ownership Access Control Check
    if document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to view this document.",
        )

    return document


@router.get(
    "/{document_id}/download",
    summary="Download physical document file",
    description="Streams physical file download from local storage. Enforces ownership authorization.",
)
async def download_document(
    document_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Download Document File Endpoint.
    Streams physical file content without exposing internal disk paths.
    """
    document = await document_service.get_document_by_id(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Ownership Access Control Check
    if document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to download this document.",
        )

    return FileResponse(
        path=document.file_path,
        filename=document.original_filename,
        media_type=document.mime_type,
    )


@router.delete(
    "/{document_id}",
    summary="Delete document",
    description="Removes physical file from disk, deletes DB metadata, and invalidates Redis user cache. Enforces ownership authorization.",
)
async def delete_document(
    document_id: str,
    request: Request,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Delete Document Endpoint.
    """
    document = await document_service.get_document_by_id(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found.",
        )

    # Ownership Access Control Check
    if document.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not have permission to delete this document.",
        )

    client_ip = request.client.host if request.client else None
    await activity_log_service.log_activity(
        db=db,
        user_id=current_user.id,
        action="DOCUMENT_DELETED",
        details=f"Deleted document {document.original_filename} (id={document.id})",
        ip_address=client_ip,
    )

    await document_service.delete_document(db, document=document)

    # Invalidate Redis user documents, dashboard cache, and admin analytics cache
    await cache_service.invalidate_user_cache(current_user.id)
    await cache_service.delete_cache_key("analytics:admin:overview")

    return {"message": "Document successfully deleted."}
