from fastapi import APIRouter
from app.api.v1.endpoints import auth

api_v1_router = APIRouter()

# Mount Authentication & RBAC routes under /auth
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Authentication & RBAC"])
