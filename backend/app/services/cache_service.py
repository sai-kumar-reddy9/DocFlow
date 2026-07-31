import json
import logging
from typing import Optional, Any
from app.core.redis import get_redis
from app.core.config import settings

logger = logging.getLogger(__name__)


def build_user_documents_cache_key(user_id: str) -> str:
    """Returns Redis key for user document list."""
    return f"documents:user:{user_id}"


def build_user_dashboard_cache_key(user_id: str) -> str:
    """Returns Redis key for user dashboard statistics."""
    return f"dashboard:user:{user_id}"


async def get_cached_json(key: str) -> Optional[Any]:
    """
    Attempts to retrieve and deserialize JSON cached value from Redis.
    Returns None if cache miss, key expired, or Redis unavailable.
    """
    try:
        redis = await get_redis()
        if not redis:
            return None

        cached_val = await redis.get(key)
        if cached_val:
            logger.debug(f"Cache HIT for key: {key}")
            return json.loads(cached_val)
        logger.debug(f"Cache MISS for key: {key}")
    except Exception as e:
        logger.warning(f"Failed to read from Redis cache ({str(e)}). Proceeding with database query.")

    return None


async def set_cached_json(
    key: str,
    data: Any,
    ttl_seconds: int = settings.CACHE_TTL_SECONDS,
) -> None:
    """
    Serializes data to JSON and stores it in Redis with specified TTL.
    """
    try:
        redis = await get_redis()
        if not redis:
            return

        serialized_data = json.dumps(data, default=str)
        await redis.set(key, serialized_data, ex=ttl_seconds)
        logger.debug(f"Stored Redis cache key: {key} (TTL: {ttl_seconds}s)")
    except Exception as e:
        logger.warning(f"Failed to set Redis cache key '{key}': {str(e)}")


async def delete_cache_key(key: str) -> None:
    """
    Deletes a specific cache key from Redis.
    """
    try:
        redis = await get_redis()
        if not redis:
            return
        await redis.delete(key)
        logger.debug(f"Deleted Redis cache key: {key}")
    except Exception as e:
        logger.warning(f"Failed to delete Redis cache key '{key}': {str(e)}")


async def invalidate_user_cache(user_id: str) -> None:
    """
    Cache Invalidation Flow:
    Invalidates document list and dashboard statistics cache keys for specified user
    whenever documents are uploaded or deleted.
    """
    doc_key = build_user_documents_cache_key(user_id)
    dash_key = build_user_dashboard_cache_key(user_id)
    await delete_cache_key(doc_key)
    await delete_cache_key(dash_key)
    logger.info(f"Invalidated Redis caches for user_id={user_id}")
