from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, field_validator
from typing import List, Union

# correo
from pydantic import validator, EmailStr


class Settings(BaseSettings):
    # heredando de basesettings indicamos que no sea un basenormal y que lea automaticamente las varibles de entorno
    # del .en
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    MEDIA_DIR: str = "./media"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    DEFAULT_ADMIN_EMAIL: str
    DEFAULT_ADMIN_PASSWORD: str
    #
    CLOUDINARY_CLOUD_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    #
    # correo
    MAIL_USERNAME: EmailStr
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    MAIL_FROM_NAME: str = "ZooConnect"
    # 2fa
    TOTP_ENCRYPTION_KEY: str
    # redis
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    # automatizacion tareas
    TIMEZONE: str = "America/La_Paz"

    @property
    def REDIS_URL(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"

    #
    FRONTEND_RESET_PASSWORD_URL: AnyHttpUrl = "http://localhost:3000/reset-password"
    PASSWORD_RESET_TOKEN_EXPIRE_MINUTES: int = 30

    # ReCAPTCHA v2 (Google) - Visible widget
    RECAPTCHA_SECRET_KEY: str = "6Lcxxxxxxxxxxxxxxxxxxxxxxxxx"
    RECAPTCHA_SITE_KEY: str = "6Lcxxxxxxxxxxxxxxxxxxxxxxxxx"
    RECAPTCHA_VERIFY_URL: str = "https://www.google.com/recaptcha/api/siteverify"
    #
    #
    # Políticas de histórico de contraseñas por rol
    PASSWORD_HISTORY_ADMIN_MAX: int = 5
    PASSWORD_HISTORY_ESPECIALISTA_MAX: int = 5  # veterinario, cuidador
    PASSWORD_HISTORY_PACIENTE_MAX: int = 3  # visitante
    PASSWORD_HISTORY_USUARIO_BASICO_MAX: int = 3
    #
    # Días de validez de contraseña por rol
    PASSWORD_VALIDITY_ADMIN_DAYS: int = 90
    PASSWORD_VALIDITY_ESPECIALISTA_DAYS: int = 90
    PASSWORD_VALIDITY_PACIENTE_DAYS: int = 180
    PASSWORD_VALIDITY_USUARIO_BASICO_DAYS: int = 180
    #

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: str | List[str]):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignorar campos extra como RECAPTCHA



settings = Settings()
