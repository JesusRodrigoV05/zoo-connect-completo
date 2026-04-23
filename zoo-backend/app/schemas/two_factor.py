from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional
from datetime import datetime

class TwoFactorBase(BaseModel):
    user_id: UUID

class TwoFactorOut(TwoFactorBase):
    id: UUID
    user_id: UUID
    code: str
    created_at: datetime
    is_used: bool

    class Config:
        from_attributes = True

class TOTPSetupResponse(BaseModel):
    secret: str
    uri: str

class VerifyTOTP(BaseModel):
    code: str

class TOTPBackupCodesResponse(BaseModel):
    backup_codes: List[str]

class TOTPDisableRequest(BaseModel):
    code: str

# Aliases para compatibilidad con el código existente
TOTPVerifyRequest = VerifyTOTP
