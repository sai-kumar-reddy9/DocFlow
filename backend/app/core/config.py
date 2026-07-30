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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
