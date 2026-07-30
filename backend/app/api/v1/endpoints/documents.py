from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.document import DocumentResponse, DocumentList
from app.services import document_service

router = APIRouter()


@router.post(
    "/upload",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload document (PDF, DOCX, TXT)",
    description="Validates file size (max 10MB) and format, saves to local disk, and stores metadata in database.",
)
async def upload_document(
    file: UploadFile = File(..., description="Target document file (PDF, DOCX, or TXT)"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Document Upload Endpoint.
    Stores file in backend/uploads/ and creates database metadata record.
    """
    document = await document_service.create_document(
        db=db,
        file=file,
        owner_id=current_user.id,
    )
    return document


@router.get(
    "",
    response_model=DocumentList,
    summary="List documents for current authenticated user",
    description="Returns all document metadata records belonging strictly to the requesting user.",
)
async def list_my_documents(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List User Documents Endpoint.
    Strictly isolated to current_user.id.
    """
    documents = await document_service.get_user_documents(db, owner_id=current_user.id)
    return DocumentList(items=documents, total=len(documents))


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
    description="Removes physical file from disk and deletes metadata from database. Enforces ownership authorization.",
)
async def delete_document(
    document_id: str,
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

    await document_service.delete_document(db, document=document)
    return {"message": "Document successfully deleted."}
