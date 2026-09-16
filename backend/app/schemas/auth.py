from typing import Optional
from pydantic import BaseModel, EmailStr
import uuid
from datetime import datetime

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str
    expires_in: int

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    role: str
    organization_id: Optional[uuid.UUID]
    created_at: datetime

    model_config = {"from_attributes": True}
