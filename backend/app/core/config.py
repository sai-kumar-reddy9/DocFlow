import os
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Application Core Settings.
    Reads environment variables from `.env` using Pydantic v2 `BaseSettings`.
    """
    PROJECT_NAME: str = "DocFlow - Secure Document Workflow Platform"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # JWT Authentication & Security Configuration
    SECRET_KEY: str = "docflow_super_secret_jwt_key_32_bytes_long_change_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    COOKIE_NAME: str = "access_token"

    # Database Configuration
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres_password"
    POSTGRES_DB: str = "docflow_db"

    # Async Database URL (SQLAlchemy AsyncSession with asyncpg)
    DATABASE_URL: Optional[str] = None

    # Sync Database URL (Alembic migration engine)
    SYNC_DATABASE_URL: Optional[str] = None

    # Enable SQLite fallback if PostgreSQL service is not running locally
    USE_SQLITE_FALLBACK: bool = False

    # Redis Cache & Rate Limiting Configuration
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    REDIS_PASSWORD: Optional[str] = None
    REDIS_URL: Optional[str] = None
    CACHE_TTL_SECONDS: int = 300  # 5 minutes
    ENABLE_REDIS_CACHE: bool = True

    def get_database_url(self) -> str:
        if self.USE_SQLITE_FALLBACK:
            return "sqlite+aiosqlite:///./docflow.db"
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    def get_sync_database_url(self) -> str:
        if self.USE_SQLITE_FALLBACK:
            return "sqlite:///./docflow.db"
        if self.SYNC_DATABASE_URL:
            return self.SYNC_DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    def get_redis_url(self) -> str:
        if self.REDIS_URL:
            return self.REDIS_URL
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
