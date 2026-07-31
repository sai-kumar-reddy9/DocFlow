from contextlib import asynccontextmanager
import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.core.database import get_db
from app.core.redis import init_redis, close_redis, check_redis_status
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI Lifespan Context Manager.
    Initializes Redis connection pool on startup and closes pool on shutdown.
    """
    # Startup: initialize Redis client
    await init_redis()
    yield
    # Shutdown: close Redis client connection
    await close_redis()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router (/api/v1/auth/..., /api/v1/documents/...)
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "api_v1": f"{settings.API_V1_STR}",
    }


@app.get("/health", tags=["Health"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    System Diagnostic Health Check.
    Verifies FastAPI server status, PostgreSQL/SQLite database connection, and Redis cache health.
    """
    db_status = "DISCONNECTED"
    try:
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_status = "CONNECTED"
    except Exception as e:
        db_status = f"ERROR: {str(e)}"

    # Redis Health Check
    redis_info = await check_redis_status()

    return {
        "status": "ONLINE",
        "platform": settings.PROJECT_NAME,
        "database": {
            "status": db_status,
            "engine": "SQLAlchemy 2.0 AsyncSession",
        },
        "redis": redis_info,
        "environment": {
            "debug": settings.DEBUG,
            "api_prefix": settings.API_V1_STR,
        }
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
