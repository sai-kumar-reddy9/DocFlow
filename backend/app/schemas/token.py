from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """
    Schema returned upon successful authentication.
    """
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    """
    Schema representing decoded JWT claims.
    """
    sub: Optional[str] = None
    role: Optional[str] = None
    exp: Optional[int] = None
