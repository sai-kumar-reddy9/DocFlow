# 05 — Backend Architecture

## FastAPI Core Architecture

The DocFlow backend is built on **FastAPI** using asynchronous Python 3.11 features (`async`/`await`), **SQLAlchemy 2.0 AsyncSession**, and **Pydantic v2** data schemas.

```text
                               ┌────────────────────────────────┐
                               │     FastAPI Application        │
                               │        (app/main.py)           │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
                               ┌────────────────────────────────┐
                               │      API Router Aggregator     │
                               │     (app/api/v1/router.py)     │
                               └───────────────┬────────────────┘
                                               │
               ┌───────────────────────┬───────┴───────────────┬───────────────────────┐
               ▼                       ▼                       ▼                       ▼
      ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
      │  auth.py Router │     │documents.py Rtr │     │dashboard.py Rtr │     │ admin.py Router │
      └────────┬────────┘     └────────┬────────┘     └────────┬────────┘     └────────┬────────┘
               │                       │                       │                       │
               └───────────────────────┼───────────────────────┴───────────────────────┘
                                       │
                                       ▼ Dependency Injection (app/api/deps.py)
                         ┌───────────────────────────┐
                         │  - get_db                 │
                         │  - get_current_active_user│
                         │  - require_admin          │
                         │  - RateLimiterDependency  │
                         └─────────────┬─────────────┘
                                       │
                                       ▼ Business Logic Services (app/services/)
                         ┌───────────────────────────┐
                         │  - auth_service           │
                         │  - document_service       │
                         │  - analytics_service      │
                         │  - admin_service          │
                         │  - cache_service          │
                         │  - activity_log_service   │
                         └───────────────────────────┘
```

---

## Dependency Injection Design (`app/api/deps.py`)

FastAPI's dependency injection system decouples database session management, authentication verification, role authorization, and rate limiting from HTTP request handlers.

### 1. Database Dependency (`get_db`)
```python
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```
Ensures every HTTP request gets an isolated async database session with automatic cleanup.

### 2. User Authentication Dependency (`get_current_active_user`)
1. Reads `access_token` from HTTP-only cookie or `Authorization: Bearer <token>` header.
2. Decodes JWT using `SECRET_KEY` and algorithm `HS256`.
3. Verifies token expiration (`exp`) and extracts `sub` (User ID).
4. Queries PostgreSQL database for `User` ORM record.
5. Verifies `user.is_active is True`. Raises `HTTP 401 Unauthorized` if invalid or disabled.

### 3. Role Authorization Dependency (`require_admin`)
```python
async def require_admin(
    current_user: User = Depends(get_current_active_user)
) -> User:
    if current_user.role != "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Admin access required."
        )
    return current_user
```
Enforces strict Role-Based Access Control (RBAC) across administrative endpoints.

---

## Custom Redis Sliding-Window Rate Limiter (`app/core/rate_limiter.py`)

Rate limiting protects sensitive endpoints against denial-of-service and brute-force attacks using atomic Redis sorted sets (`ZSET`).

### Implementation Logic
```python
class RateLimiterDependency:
    def __init__(self, prefix: str, max_requests: int, window_seconds: int):
        self.prefix = prefix
        self.max_requests = max_requests
        self.window_seconds = window_seconds

    async def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{self.prefix}:{client_ip}"
        now = time.time()
        clear_before = now - self.window_seconds

        redis_client = await get_redis()
        if redis_client:
            pipe = redis_client.pipeline()
            pipe.zremrangebyscore(key, 0, clear_before)
            pipe.zadd(key, {str(now): now})
            pipe.zcard(key)
            pipe.expire(key, self.window_seconds)
            results = await pipe.execute()
            request_count = results[2]

            if request_count > self.max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Rate limit exceeded. Maximum {self.max_requests} requests per {self.window_seconds}s."
                )
```

### Protection Thresholds
- **Login Endpoint (`POST /auth/login`)**: Max 5 requests per minute per IP (`prefix="auth_login"`).
- **Upload Endpoint (`POST /documents/upload`)**: Max 10 uploads per minute per user/IP (`prefix="doc_upload"`).

---

## Caching Strategy & Redis Integration (`app/services/cache_service.py`)

Redis caches expensive analytical query results to maintain sub-10ms response times.

### Cache Key Structure
- **User Document List**: `documents:user:{user_id}` (TTL: 300s)
- **User Dashboard Stats**: `dashboard:user:{user_id}` (TTL: 300s)
- **Admin System Analytics**: `analytics:admin:overview` (TTL: 300s)

### Cache Invalidation Rules
Whenever a state-modifying action occurs:
- **On File Upload (`POST /documents/upload`)**: Invalidates `documents:user:{user_id}`, `dashboard:user:{user_id}`, and `analytics:admin:overview`.
- **On File Delete (`DELETE /documents/{id}`)**: Invalidates `documents:user:{user_id}`, `dashboard:user:{user_id}`, and `analytics:admin:overview`.
- **On Status/Role Update (`PATCH /admin/users/{id}/*`)**: Invalidates `analytics:admin:overview`.

---

## Activity Logging Service (`app/services/activity_log_service.py`)

Audit logs record critical security and system events asynchronously into PostgreSQL.

### Logged Events
- `USER_REGISTERED`: Recorded when a new user signs up.
- `USER_LOGIN`: Recorded on successful authentication.
- `DOCUMENT_UPLOADED`: Recorded when a document is saved to disk and DB.
- `DOCUMENT_DELETED`: Recorded when a file is deleted.
- `USER_ENABLED` / `USER_DISABLED`: Recorded on admin status toggle.
- `ROLE_UPDATED`: Recorded when an admin toggles a user's role.

---

## Centralized Error Handling & Exception Management

FastAPI endpoints handle errors uniformly with standardized HTTP status codes and JSON error responses:

| Exception Type | HTTP Code | Cause / Trigger | Response Body |
| :--- | :--- | :--- | :--- |
| **`HTTPException`** | `400 Bad Request` | Invalid file format, size > 10MB, or modifying protected admin. | `{"detail": "File size exceeds 10MB limit."}` |
| **`HTTPException`** | `401 Unauthorized` | Invalid password, expired JWT, or missing cookie. | `{"detail": "Invalid email or password."}` |
| **`HTTPException`** | `403 Forbidden` | Accessing document owned by another user or non-admin hitting `/admin/*`. | `{"detail": "Access forbidden: You do not have permission."}` |
| **`HTTPException`** | `404 Not Found` | Document ID or User ID does not exist in DB. | `{"detail": "Document not found."}` |
| **`HTTPException`** | `429 Too Many Requests` | Redis rate limit boundary breached. | `{"detail": "Rate limit exceeded."}` |
