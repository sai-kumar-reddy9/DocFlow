import logging
from typing import Optional, Dict, Any
import redis.asyncio as aioredis
from redis.exceptions import RedisError, ConnectionError as RedisConnectionError
import fakeredis.aioredis as fake_aioredis

from app.core.config import settings

logger = logging.getLogger(__name__)

# Global Redis Client Singleton
_redis_client: Optional[Any] = None
_using_fake_redis: bool = False


async def init_redis() -> Any:
    """
    Initializes the Asynchronous Redis connection client.
    Attempts connection to configured Redis server.
    If Redis server is unreachable, gracefully falls back to FakeRedis in-memory client
    to guarantee application stability and seamless local development/testing.
    """
    global _redis_client, _using_fake_redis

    if not settings.ENABLE_REDIS_CACHE:
        logger.info("Redis caching is disabled in settings.")
        _redis_client = None
        return None

    try:
        redis_url = settings.get_redis_url()
        client = aioredis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True,
            socket_connect_timeout=1.0,  # Quick timeout for graceful fallback
        )
        await client.ping()
        _redis_client = client
        _using_fake_redis = False
        logger.info(f"Connected to Redis server at {settings.REDIS_HOST}:{settings.REDIS_PORT}")
    except (RedisError, RedisConnectionError, OSError) as e:
        logger.warning(
            f"Unable to connect to real Redis server ({str(e)}). "
            "Falling back to high-performance FakeRedis in-memory store for local execution."
        )
        _redis_client = fake_aioredis.FakeRedis(decode_responses=True)
        _using_fake_redis = True

    return _redis_client


async def get_redis() -> Any:
    """
    Returns the active Async Redis client singleton instance.
    Initializes connection if not yet established.
    """
    global _redis_client
    if _redis_client is None:
        await init_redis()
    return _redis_client


async def close_redis() -> None:
    """
    Closes the Redis connection during application shutdown.
    """
    global _redis_client
    if _redis_client is not None:
        try:
            await _redis_client.close()
        except Exception:
            pass
        _redis_client = None


async def check_redis_status() -> Dict[str, Any]:
    """
    Performs a health check ping against Redis.
    Returns diagnostic dict for /health endpoint.
    """
    client = await get_redis()
    if client is None:
        return {"status": "DISABLED", "details": "Redis cache is disabled in configuration."}

    try:
        pong = await client.ping()
        if pong:
            mode = "IN_MEMORY_EMULATOR" if _using_fake_redis else "STANDALONE_SERVER"
            return {
                "status": "CONNECTED",
                "mode": mode,
                "host": settings.REDIS_HOST,
                "port": settings.REDIS_PORT,
                "ttl_default_seconds": settings.CACHE_TTL_SECONDS,
            }
    except Exception as e:
        return {"status": "DISCONNECTED", "error": str(e)}

    return {"status": "UNAVAILABLE"}
