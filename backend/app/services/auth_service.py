from typing import Tuple
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.user import UserCreate
from app.services import user_service
from app.core.security import verify_password, create_access_token


async def register_new_user(db: AsyncSession, user_in: UserCreate) -> User:
    """
    Business Logic: Checks if email exists, raises 400 if duplicate, or creates user.
    """
    existing_user = await user_service.get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )
    return await user_service.create_user(db, user_in=user_in)


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """
    Business Logic: Validates user credentials and account active status.
    Raises HTTP 401 on invalid credentials or inactive account.
    """
    user = await user_service.get_user_by_email(db, email=email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been disabled.",
        )

    return user


def generate_user_token(user: User) -> str:
    """
    Generates a signed JWT Access Token for the authenticated user.
    """
    return create_access_token(subject=user.id, role=user.role)
