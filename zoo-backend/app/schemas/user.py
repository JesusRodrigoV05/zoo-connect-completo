from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from pydantic import field_validator

# Reuse password policy validator
from app.core.password_policy import validate_password_strength_func


class UserBase(BaseModel):
    email: EmailStr
    username: str


class UserCreate(UserBase):
    password: Optional[str] = None
    # Si se establece a True, el servidor generará una contraseña segura para el usuario
    generate_password: bool = False
    # Token de reCAPTCHA v3 para validación server-side
    recaptcha_token: Optional[str] = None


class AdminUserCreate(UserBase):
    password: str
    role_id: int
    is_active: Optional[bool] = True

    @field_validator("password")
    def validate_password_strength(cls, v: str) -> str:
        return validate_password_strength_func(v)


class AdminUserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    role_id: Optional[int] = None
    is_active: Optional[bool] = None


class UserUpdateProfile(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    photo_url: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    is_admin: bool = False
    role_id: int
    photo_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# pagination
class UserOutWithRole(BaseModel):
    id: int
    email: EmailStr
    username: str
    is_active: bool
    is_admin: bool
    role_id: int
    photo_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfileOut(UserOutWithRole):
    permissions: list[str] = Field(default_factory=list)


class UserCreateResponse(UserOut):
    generated_password: Optional[str] = None

    class Config:
        from_attributes = True
