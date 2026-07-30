import uvicorn
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

from app.core.config import settings
from app.core.database import get_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["Health"])
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }


@app.get("/health", tags=["Health"])
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Phase 2 System & Database Connection Health Check.
    Verifies that FastAPI is running and SQLAlchemy AsyncSession can query PostgreSQL.
    """
    db_status = "DISCONNECTED"
    db_latency_ms = None

    try:
        start_time = uvicorn.Server.started if hasattr(uvicorn.Server, "started") else None
        result = await db.execute(text("SELECT 1"))
        if result.scalar() == 1:
            db_status = "CONNECTED"
    except Exception as e:
        db_status = f"ERROR: {str(e)}"

    return {
        "status": "ONLINE",
        "platform": settings.PROJECT_NAME,
        "database": {
            "status": db_status,
            "engine": "SQLAlchemy 2.0 AsyncSession (asyncpg)",
        },
        "environment": {
            "debug": settings.DEBUG,
            "api_prefix": settings.API_V1_STR,
        }
    }


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
