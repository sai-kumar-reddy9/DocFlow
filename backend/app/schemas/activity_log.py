from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict


class ActivityLogResponse(BaseModel):
    """
    Schema for activity audit log entries.
    """
    id: str
    user_id: Optional[str] = None
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ActivityLogList(BaseModel):
    """
    Schema for paginated activity log list.
    """
    items: List[ActivityLogResponse]
    total: int
