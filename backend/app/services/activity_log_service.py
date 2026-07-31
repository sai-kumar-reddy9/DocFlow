from typing import Optional, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.activity_log import ActivityLog


async def log_activity(
    db: AsyncSession,
    user_id: Optional[str],
    action: str,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> ActivityLog:
    """
    Creates and records an audit activity log entry in the database.
    """
    log_entry = ActivityLog(
        user_id=user_id,
        action=action,
        details=details,
        ip_address=ip_address,
    )
    db.add(log_entry)
    await db.commit()
    await db.refresh(log_entry)
    return log_entry


async def get_activity_logs(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[ActivityLog], int]:
    """
    Queries activity logs with pagination, sorted by created_at descending.
    """
    total_query = await db.execute(select(func.count(ActivityLog.id)))
    total = total_query.scalar() or 0

    result = await db.execute(
        select(ActivityLog)
        .order_by(ActivityLog.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    logs = list(result.scalars().all())
    return logs, total
