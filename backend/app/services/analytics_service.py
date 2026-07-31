from datetime import datetime, timedelta, timezone
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, extract

from app.models.user import User
from app.models.document import Document
from app.schemas.admin import (
    AdminOverviewStats,
    UploadTrendItem,
    FileTypeItem,
    UserRoleItem,
    AdminAnalyticsResponse,
    UserDashboardStats,
)

# Standardized chart palette matching Recharts components
FILE_TYPE_COLORS = {
    ".pdf": "#ef4444",   # Vibrant Red
    "pdf": "#ef4444",
    ".docx": "#3b82f6",  # Vibrant Blue
    "docx": "#3b82f6",
    ".txt": "#10b981",   # Vibrant Emerald
    "txt": "#10b981",
    "other": "#8b5cf6",  # Vibrant Purple
}

ROLE_COLORS = {
    "USER": "#3b82f6",   # Blue
    "ADMIN": "#f59e0b",  # Amber / Gold
}


async def get_admin_analytics(db: AsyncSession) -> AdminAnalyticsResponse:
    """
    Computes system-wide analytics metrics for Admin Dashboard.
    """
    # 1. System Overview Metrics
    users_count_res = await db.execute(select(func.count(User.id)))
    total_users = users_count_res.scalar() or 0

    active_users_res = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    active_users = active_users_res.scalar() or 0

    docs_count_res = await db.execute(select(func.count(Document.id)))
    total_documents = docs_count_res.scalar() or 0

    storage_bytes_res = await db.execute(select(func.coalesce(func.sum(Document.file_size), 0)))
    total_storage_bytes = int(storage_bytes_res.scalar() or 0)
    total_storage_mb = round(total_storage_bytes / (1024 * 1024), 2)

    overview = AdminOverviewStats(
        total_users=total_users,
        active_users=active_users,
        total_documents=total_documents,
        total_storage_bytes=total_storage_bytes,
        total_storage_mb=total_storage_mb,
    )

    # 2. 7-Day Upload Trend Calculation
    today = datetime.now(timezone.utc).date()
    upload_trend: List[UploadTrendItem] = []

    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_name = target_date.strftime("%a")  # Mon, Tue, Wed...
        date_str = target_date.strftime("%Y-%m-%d")

        stmt = select(func.count(Document.id)).where(
            func.date(Document.created_at) == target_date
        )
        count_res = await db.execute(stmt)
        daily_count = count_res.scalar() or 0

        upload_trend.append(
            UploadTrendItem(
                day=day_name,
                date=date_str,
                uploads=int(daily_count),
            )
        )

    # 3. File Type Format Breakdown
    file_type_stmt = (
        select(Document.file_extension, func.count(Document.id))
        .group_by(Document.file_extension)
    )
    file_type_res = await db.execute(file_type_stmt)
    file_type_rows = file_type_res.all()

    file_type_distribution: List[FileTypeItem] = []
    for ext, count in file_type_rows:
        cleaned_ext = ext.replace(".", "").upper()
        color = FILE_TYPE_COLORS.get(ext.lower(), FILE_TYPE_COLORS["other"])
        file_type_distribution.append(
            FileTypeItem(name=cleaned_ext, value=int(count), color=color)
        )

    if not file_type_distribution:
        file_type_distribution = [
            FileTypeItem(name="PDF", value=0, color="#ef4444"),
            FileTypeItem(name="DOCX", value=0, color="#3b82f6"),
            FileTypeItem(name="TXT", value=0, color="#10b981"),
        ]

    # 4. User Roles Distribution
    role_stmt = select(User.role, func.count(User.id)).group_by(User.role)
    role_res = await db.execute(role_stmt)
    role_rows = role_res.all()

    user_role_distribution: List[UserRoleItem] = []
    for role_name, count in role_rows:
        color = ROLE_COLORS.get(role_name, "#6b7280")
        user_role_distribution.append(
            UserRoleItem(name=role_name, value=int(count), color=color)
        )

    return AdminAnalyticsResponse(
        overview=overview,
        upload_trend=upload_trend,
        file_type_distribution=file_type_distribution,
        user_role_distribution=user_role_distribution,
    )


async def get_user_dashboard_stats(
    db: AsyncSession,
    user_id: str,
) -> UserDashboardStats:
    """
    Computes User Dashboard statistics for Recharts components.
    """
    # 1. Past 7 days upload trend for this user
    today = datetime.now(timezone.utc).date()
    uploads_7_days: List[UploadTrendItem] = []

    for i in range(6, -1, -1):
        target_date = today - timedelta(days=i)
        day_name = target_date.strftime("%a")
        date_str = target_date.strftime("%Y-%m-%d")

        stmt = (
            select(func.count(Document.id))
            .where(Document.owner_id == user_id)
            .where(func.date(Document.created_at) == target_date)
        )
        count_res = await db.execute(stmt)
        daily_count = count_res.scalar() or 0

        uploads_7_days.append(
            UploadTrendItem(day=day_name, date=date_str, uploads=int(daily_count))
        )

    # 2. File Format Breakdown for this user
    file_type_stmt = (
        select(Document.file_extension, func.count(Document.id))
        .where(Document.owner_id == user_id)
        .group_by(Document.file_extension)
    )
    file_type_res = await db.execute(file_type_stmt)
    file_type_rows = file_type_res.all()

    file_type_distribution: List[FileTypeItem] = []
    for ext, count in file_type_rows:
        cleaned_ext = ext.replace(".", "").upper()
        color = FILE_TYPE_COLORS.get(ext.lower(), FILE_TYPE_COLORS["other"])
        file_type_distribution.append(
            FileTypeItem(name=cleaned_ext, value=int(count), color=color)
        )

    if not file_type_distribution:
        file_type_distribution = [
            FileTypeItem(name="PDF", value=0, color="#ef4444"),
            FileTypeItem(name="DOCX", value=0, color="#3b82f6"),
            FileTypeItem(name="TXT", value=0, color="#10b981"),
        ]

    # 3. User Storage Quota Calculation
    storage_stmt = select(
        func.coalesce(func.sum(Document.file_size), 0),
        func.count(Document.id),
    ).where(Document.owner_id == user_id)
    storage_res = await db.execute(storage_stmt)
    total_bytes_val, total_files_val = storage_res.first()

    storage_used_bytes = int(total_bytes_val or 0)
    total_files = int(total_files_val or 0)
    storage_limit_bytes = 5 * 1024 * 1024 * 1024  # 5 GB
    storage_used_mb = round(storage_used_bytes / (1024 * 1024), 2)
    storage_percentage = round((storage_used_bytes / storage_limit_bytes) * 100, 2)

    return UserDashboardStats(
        uploads_7_days=uploads_7_days,
        file_type_distribution=file_type_distribution,
        storage_used_bytes=storage_used_bytes,
        storage_limit_bytes=storage_limit_bytes,
        storage_used_mb=storage_used_mb,
        storage_percentage=storage_percentage,
        total_files=total_files,
    )
