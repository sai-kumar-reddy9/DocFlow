from typing import List, Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from app.models.user import User
from app.models.document import Document
from app.schemas.admin import UserDetailResponse


async def get_all_users_with_stats(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[UserDetailResponse], int]:
    """
    Retrieves all platform users with calculated total_documents and total_storage_bytes.
    """
    # Total count query
    total_query = await db.execute(select(func.count(User.id)))
    total_users = total_query.scalar() or 0

    # User query with left outer join aggregate stats
    stmt = (
        select(
            User,
            func.coalesce(func.count(Document.id), 0).label("doc_count"),
            func.coalesce(func.sum(Document.file_size), 0).label("storage_bytes"),
        )
        .outerjoin(Document, User.id == Document.owner_id)
        .group_by(User.id)
        .order_by(User.created_at.desc())
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()

    user_details = []
    for user, doc_count, storage_bytes in rows:
        user_details.append(
            UserDetailResponse(
                id=user.id,
                email=user.email,
                full_name=user.full_name,
                role=user.role,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at,
                total_documents=int(doc_count),
                total_storage_bytes=int(storage_bytes),
            )
        )

    return user_details, total_users


async def get_user_detail_by_id(
    db: AsyncSession,
    user_id: str,
) -> Optional[UserDetailResponse]:
    """
    Fetches a single user detail record with document and storage statistics.
    """
    stmt = (
        select(
            User,
            func.coalesce(func.count(Document.id), 0).label("doc_count"),
            func.coalesce(func.sum(Document.file_size), 0).label("storage_bytes"),
        )
        .outerjoin(Document, User.id == Document.owner_id)
        .where(User.id == user_id)
        .group_by(User.id)
    )

    result = await db.execute(stmt)
    row = result.first()
    if not row:
        return None

    user, doc_count, storage_bytes = row
    return UserDetailResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at,
        total_documents=int(doc_count),
        total_storage_bytes=int(storage_bytes),
    )


async def update_user_status(
    db: AsyncSession,
    user_id: str,
    is_active: bool,
) -> Optional[User]:
    """
    Enables or Disables a target user account.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        return None

    user.is_active = is_active
    await db.commit()
    await db.refresh(user)
    return user


async def update_user_role(
    db: AsyncSession,
    user_id: str,
    new_role: str,
) -> Optional[User]:
    """
    Updates the role permission of a target user (USER <-> ADMIN).
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        return None

    user.role = new_role.upper()
    await db.commit()
    await db.refresh(user)
    return user


async def get_all_documents_admin(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> Tuple[List[Document], int]:
    """
    Retrieves system-wide documents across all users for Admin Overview.
    """
    total_query = await db.execute(select(func.count(Document.id)))
    total_docs = total_query.scalar() or 0

    result = await db.execute(
        select(Document)
        .order_by(Document.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    documents = list(result.scalars().all())
    return documents, total_docs
