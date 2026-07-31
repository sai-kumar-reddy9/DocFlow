from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user
from app.models.user import User
from app.schemas.admin import UserDashboardStats
from app.services import analytics_service, cache_service

router = APIRouter()


@router.get(
    "/user-stats",
    response_model=UserDashboardStats,
    summary="Fetch dashboard analytics metrics for current user (Redis Cached)",
    description="Computes user 7-day upload trend, file format breakdown, and storage quota usage. Cached in Redis.",
)
async def get_user_dashboard_stats_endpoint(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    User Dashboard Analytics Endpoint with Redis Caching.
    Cache Key: `dashboard:user:{user_id}`
    """
    cache_key = cache_service.build_user_dashboard_cache_key(current_user.id)

    # 1. Try reading from Redis Cache
    cached_stats = await cache_service.get_cached_json(cache_key)
    if cached_stats:
        return UserDashboardStats(**cached_stats)

    # 2. Compute Analytics from Database
    stats = await analytics_service.get_user_dashboard_stats(db, user_id=current_user.id)

    # 3. Cache result in Redis
    await cache_service.set_cached_json(cache_key, stats.model_dump())

    return stats
