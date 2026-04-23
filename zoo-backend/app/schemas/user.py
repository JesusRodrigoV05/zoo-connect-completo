from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID
import re

def validate_password_strength_func(v: str) -> str:
    if len(v) < 8:
        raise ValueError('La contraseña debe tener 8 caracteres como minimo')
    if not re.search(r"[A-Z]", v):
        raise ValueError("La contraseña debe contener al menos una mayuscula")
    if not re.search(r"[0-9]", v):
        raise ValueError("La contraseña debe contener al menos un numero")
    return v

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str
    @field_validator('password')
    def validate_password_strength(cls, v: str) -> str:
        return validate_password_strength_func(v)

class AdminUserCreate(UserBase):
    password: str
    role_id: UUID
    is_active: Optional[bool] = True
    @field_validator('password')
    def validate_password_strength(cls, v: str) -> str:
        return validate_password_strength_func(v)

class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role_id: Optional[UUID] = None
    is_active: Optional[bool] = None

class UserUpdateProfile(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None

class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    is_active: bool
    is_admin: bool
    role_id: UUID
    photo_url: Optional[str] = None 
    created_at: datetime 

    class Config:
        from_attributes = True

class UserOutWithRole(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    is_active: bool
    is_admin: bool
    role_id: UUID
    photo_url: Optional[str] = None 
    created_at: datetime 

    class Config:
        from_attributes = True
