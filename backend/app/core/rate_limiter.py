import logging
from typing import Optional
from fastapi import Request, HTTPException, status
from app.core.redis import get_redis

logger = logging.getLogger(__name__)


async def check_rate_limit(
    identifier: str,
    prefix: str,
    max_requests: int,
    window_seconds: int,
) -> None:
    """
    Redis-backed Rate Limiter using atomic INCR and EXPIRE windowing.
    Increments request count for the identifier. If count exceeds max_requests within
    window_seconds, raises HTTP 429 Too Many Requests.
    """
    try:
        redis = await get_redis()
        if not redis:
            return

        cache_key = f"ratelimit:{prefix}:{identifier}"
        current_count = await redis.incr(cache_key)

        # Set expiration on the first request in the time window
        if current_count == 1:
            await redis.expire(cache_key, window_seconds)

        if current_count > max_requests:
            ttl_remaining = await redis.ttl(cache_key)
            ttl = ttl_remaining if ttl_remaining > 0 else window_seconds
            logger.warning(f"Rate limit triggered for '{cache_key}' (Requests: {current_count}/{max_requests})")
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Rate limit exceeded ({max_requests} per {window_seconds}s). Please try again in {ttl} seconds.",
                headers={"Retry-After": str(ttl)},
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Rate limiter check error ({str(e)}). Allowing request through.")


class RateLimiterDependency:
    """
    FastAPI Dependency wrapper for rate limiting endpoints.
    """
    def __init__(self, prefix: str, max_requests: int, window_seconds: int):
        self.prefix = prefix
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request) -> None:
        # Identify client by IP address or client host
        client_ip = request.client.host if request.client else "unknown_ip"
        await check_rate_limit(
            identifier=client_ip,
            prefix=self.prefix,
            max_requests=self.max_requests,
            window_seconds=self.window_seconds,
        )
