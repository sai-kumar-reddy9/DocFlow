from fastapi import APIRouter
from app.api.v1.endpoints import auth, documents, admin, dashboard

api_v1_router = APIRouter()

# Mount Authentication & RBAC routes under /auth
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])

# Mount Document Management routes under /documents
api_v1_router.include_router(documents.router, prefix="/documents", tags=["Document Management"])

# Mount Admin & User Dashboard Analytics routes under /dashboard
api_v1_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard Analytics"])

# Mount Admin Management & System Analytics routes under /admin
api_v1_router.include_router(admin.router, prefix="/admin", tags=["Admin Module & Analytics"])
