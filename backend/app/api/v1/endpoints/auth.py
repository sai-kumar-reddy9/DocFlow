from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_active_user, require_admin
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services import auth_service

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new user account",
    description="Registers a new user with Argon2id password hashing and returns the created user details.",
)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    User Registration Endpoint.
    Delegates validation and user creation to auth_service.
    """
    user = await auth_service.register_new_user(db, user_in=user_in)
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Authenticate user and obtain JWT token",
    description="Authenticates credentials, returns JWT access token, and sets HTTP-only cookie.",
)
async def login(
    response: Response,
    user_in: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    User Login Endpoint (JSON Body).
    Validates email and password, issues JWT access token, and sets HTTP-only cookie.
    """
    # Validate user credentials via auth_service
    user = await auth_service.authenticate_user(
        db, email=user_in.email, password=user_in.password
    )

    # Issue JWT Token
    access_token = auth_service.generate_user_token(user)

    # Set HTTP-only Cookie for browser security
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=access_token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # Set to True in HTTPS production environments
    )

    return Token(access_token=access_token, token_type="bearer")


@router.post(
    "/logout",
    summary="Logout user and clear auth cookie",
    description="Clears the HTTP-only JWT access token cookie.",
)
async def logout(response: Response) -> Any:
    """
    User Logout Endpoint.
    """
    response.delete_cookie(key=settings.COOKIE_NAME)
    return {"message": "Successfully logged out."}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Fetch current authenticated user profile",
    description="Returns the details of the currently authenticated user extracted from JWT token or HTTP-only cookie.",
)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """
    Protected Endpoint: Get current user profile.
    """
    return current_user


@router.get(
    "/admin-only-test",
    summary="RBAC Test: Admin-only protected route",
    description="Verifies Role-Based Access Control by restricting access strictly to ADMIN role users.",
)
async def admin_only_test(
    admin_user: User = Depends(require_admin),
) -> Any:
    """
    Protected Endpoint: Demonstrates RBAC enforcement (ADMIN only).
    """
    return {
        "message": f"Hello Administrator {admin_user.full_name}! You have verified RBAC authorization.",
        "admin_id": admin_user.id,
        "role": admin_user.role,
    }
