from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class UserStatusUpdate(BaseModel):
    """
    Schema for enabling/disabling user account.
    """
    is_active: bool = Field(..., description="Set user active status")


class UserDetailResponse(BaseModel):
    """
    Detailed User Representation including aggregate document and storage stats.
    """
    id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    total_documents: int = 0
    total_storage_bytes: int = 0

    model_config = ConfigDict(from_attributes=True)


class UserListResponse(BaseModel):
    """
    Paginated list of platform users.
    """
    items: List[UserDetailResponse]
    total: int


class AdminOverviewStats(BaseModel):
    """
    System-wide summary metrics for Admin Dashboard.
    """
    total_users: int
    active_users: int
    total_documents: int
    total_storage_bytes: int
    total_storage_mb: float


class UploadTrendItem(BaseModel):
    """
    Daily upload count item for trend line/bar charts.
    """
    day: str
    date: str
    uploads: int


class FileTypeItem(BaseModel):
    """
    File format breakdown item for Pie/Bar charts.
    """
    name: str
    value: int
    color: Optional[str] = None


class UserRoleItem(BaseModel):
    """
    User role breakdown item for Pie charts.
    """
    name: str
    value: int
    color: Optional[str] = None


class AdminAnalyticsResponse(BaseModel):
    """
    Aggregated Analytics response for Admin Dashboard.
    """
    overview: AdminOverviewStats
    upload_trend: List[UploadTrendItem]
    file_type_distribution: List[FileTypeItem]
    user_role_distribution: List[UserRoleItem]


class UserDashboardStats(BaseModel):
    """
    User-level Dashboard Analytics payload matching Recharts component expectations.
    """
    uploads_7_days: List[UploadTrendItem]
    file_type_distribution: List[FileTypeItem]
    storage_used_bytes: int
    storage_limit_bytes: int = 5 * 1024 * 1024 * 1024  # 5 GB
    storage_used_mb: float
    storage_percentage: float
    total_files: int
