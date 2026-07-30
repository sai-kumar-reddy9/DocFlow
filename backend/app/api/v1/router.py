from fastapi import APIRouter
from app.api.v1.endpoints import auth, documents

api_v1_router = APIRouter()

# Mount Authentication & RBAC routes under /auth
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])

# Mount Document Management routes under /documents
api_v1_router.include_router(documents.router, prefix="/documents", tags=["Document Management"])
