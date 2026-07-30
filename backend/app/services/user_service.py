from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Queries database for a User record matching the given email address.
    """
    result = await db.execute(select(User).where(User.email == email.lower().strip()))
    return result.scalars().first()


async def get_user_by_id(db: AsyncSession, user_id: str) -> Optional[User]:
    """
    Queries database for a User record matching the given user ID.
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalars().first()


async def create_user(db: AsyncSession, user_in: UserCreate, role: str = "USER") -> User:
    """
    Registers a new User in the database with an Argon2id hashed password.
    By default, all new users receive role="USER". Admin roles must be assigned
    via admin tools or explicit service utility calls.
    """
    normalized_role = role.upper() if role else "USER"
    if normalized_role not in ["USER", "ADMIN"]:
        normalized_role = "USER"

    hashed_pwd = get_password_hash(user_in.password)

    db_user = User(
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
        full_name=user_in.full_name.strip(),
        role=normalized_role,
        is_active=True,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_user_role(db: AsyncSession, user: User, new_role: str) -> User:
    """
    Updates the role permission of a target user (Admin action).
    """
    target_role = new_role.upper()
    if target_role not in ["USER", "ADMIN"]:
        target_role = "USER"
    user.role = target_role
    await db.commit()
    await db.refresh(user)
    return user
