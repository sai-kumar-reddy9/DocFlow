from typing import Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_admin
from app.models.user import User
from app.schemas.user import UserRoleUpdate
from app.schemas.admin import (
    UserStatusUpdate,
    UserDetailResponse,
    UserListResponse,
    AdminAnalyticsResponse,
)
from app.schemas.document import DocumentList
from app.schemas.activity_log import ActivityLogList
from app.services import admin_service, analytics_service, activity_log_service, cache_service

router = APIRouter()
ADMIN_ANALYTICS_CACHE_KEY = "analytics:admin:overview"


@router.get(
    "/users",
    response_model=UserListResponse,
    summary="List all users with storage & document stats (Admin Only)",
    description="Returns all registered users with document counts and storage usage. Enforces ADMIN role.",
)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    List All Users Endpoint (ADMIN ONLY).
    """
    users, total = await admin_service.get_all_users_with_stats(db, skip=skip, limit=limit)
    return UserListResponse(items=users, total=total)


@router.get(
    "/users/{user_id}",
    response_model=UserDetailResponse,
    summary="View user details (Admin Only)",
    description="Fetches single user details and platform usage metrics. Enforces ADMIN role.",
)
async def get_user_detail(
    user_id: str,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get User Details Endpoint (ADMIN ONLY).
    """
    user_detail = await admin_service.get_user_detail_by_id(db, user_id=user_id)
    if not user_detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )
    return user_detail


@router.patch(
    "/users/{user_id}/status",
    response_model=UserDetailResponse,
    summary="Enable or Disable user account (Admin Only)",
    description="Toggles user active status. Enforces ADMIN role and records activity audit log.",
)
async def update_user_status_endpoint(
    user_id: str,
    status_in: UserStatusUpdate,
    request: Request,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Enable/Disable User Account (ADMIN ONLY).
    """
    updated_user = await admin_service.update_user_status(
        db, user_id=user_id, is_active=status_in.is_active
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    client_ip = request.client.host if request.client else None
    action_str = "USER_ENABLED" if status_in.is_active else "USER_DISABLED"
    await activity_log_service.log_activity(
        db=db,
        user_id=admin_user.id,
        action=action_str,
        details=f"Admin {admin_user.email} updated active status of user {updated_user.email} to {status_in.is_active}",
        ip_address=client_ip,
    )

    # Invalidate Admin Analytics Cache
    await cache_service.delete_cache_key(ADMIN_ANALYTICS_CACHE_KEY)

    user_detail = await admin_service.get_user_detail_by_id(db, user_id=user_id)
    return user_detail


@router.patch(
    "/users/{user_id}/role",
    response_model=UserDetailResponse,
    summary="Update user role (Admin Only)",
    description="Updates user role (USER <-> ADMIN). Enforces ADMIN role and records activity audit log.",
)
async def update_user_role_endpoint(
    user_id: str,
    role_in: UserRoleUpdate,
    request: Request,
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Update User Role (ADMIN ONLY).
    """
    updated_user = await admin_service.update_user_role(
        db, user_id=user_id, new_role=role_in.role
    )
    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    client_ip = request.client.host if request.client else None
    await activity_log_service.log_activity(
        db=db,
        user_id=admin_user.id,
        action="ROLE_UPDATED",
        details=f"Admin {admin_user.email} changed role of user {updated_user.email} to {updated_user.role}",
        ip_address=client_ip,
    )

    # Invalidate Admin Analytics Cache
    await cache_service.delete_cache_key(ADMIN_ANALYTICS_CACHE_KEY)

    user_detail = await admin_service.get_user_detail_by_id(db, user_id=user_id)
    return user_detail


@router.get(
    "/documents",
    response_model=DocumentList,
    summary="System-wide document overview across all users (Admin Only)",
    description="Returns list of all documents stored across the platform. Enforces ADMIN role.",
)
async def list_all_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    System-Wide Documents Overview (ADMIN ONLY).
    """
    documents, total = await admin_service.get_all_documents_admin(db, skip=skip, limit=limit)
    return DocumentList(items=documents, total=total)


@router.get(
    "/analytics",
    response_model=AdminAnalyticsResponse,
    summary="Admin Dashboard Analytics & Metrics (Admin Only - Redis Cached)",
    description="Computes system-wide totals, upload trends, file format breakdowns, and user role metrics. Cached in Redis.",
)
async def get_admin_analytics_endpoint(
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Admin Analytics Endpoint with Redis Caching.
    Cache Key: `analytics:admin:overview`
    """
    # 1. Try reading from Redis Cache
    cached_analytics = await cache_service.get_cached_json(ADMIN_ANALYTICS_CACHE_KEY)
    if cached_analytics:
        return AdminAnalyticsResponse(**cached_analytics)

    # 2. Compute Analytics from Database
    analytics = await analytics_service.get_admin_analytics(db)

    # 3. Cache result in Redis
    await cache_service.set_cached_json(ADMIN_ANALYTICS_CACHE_KEY, analytics.model_dump())

    return analytics


@router.get(
    "/activity-logs",
    response_model=ActivityLogList,
    summary="View system activity audit logs (Admin Only)",
    description="Queries paginated audit logs recorded for platform actions. Enforces ADMIN role.",
)
async def get_activity_logs_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    admin_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    View Activity Logs Endpoint (ADMIN ONLY).
    """
    logs, total = await activity_log_service.get_activity_logs(db, skip=skip, limit=limit)
    return ActivityLogList(items=logs, total=total)
