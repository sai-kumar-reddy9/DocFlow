from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserCreate(BaseModel):
    """
    Schema for public user registration request body.
    Note: Public registration never accepts a role field. All self-registered
    users are created with role="USER" by default to prevent privilege escalation.
    """
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters long")
    full_name: str = Field(..., min_length=2, description="Full name of the user")


class UserLogin(BaseModel):
    """
    Schema for user authentication / login request body.
    """
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """
    Schema returned for public/authenticated user representation.
    Excludes sensitive fields like hashed_password.
    """
    id: str
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    """
    Schema for admin role modification.
    """
    role: str = Field(..., description="Target role: USER or ADMIN")
