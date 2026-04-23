from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from uuid import UUID

class AuditLogUser(BaseModel):
    id: UUID
    username: str
    email: EmailStr

    class Config:
        from_attributes = True

class AuditLogOut(BaseModel):
    id: UUID
    event: str
    timestamp: datetime
    attempted_email: Optional[str] = None

    user: Optional[AuditLogUser] = None 

    class Config:
        from_attributes = True
