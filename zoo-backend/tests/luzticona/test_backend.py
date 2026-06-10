import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException

from app.models.user import User
from app.schemas.user import UserCreate, AdminUserCreate, AdminUserUpdate
from app.crud.user import (
    get_user, get_user_by_email, create_public_user, 
    create_user_by_admin, update_user_by_admin, delete_user_by_admin
)


class TestBackendUsuarios:
    
    def test_user_email_validation_and_normalization(self):
        # 1) Preparación
        # 2) Lógica - Intentar crear usuario con email en mayúsculas y espacios
        user = User(
            email="  TEST@ZOO.COM  ",
            username="testuser",
            hashed_password="hashed123",
            role_id=1,
        )
        # 3) Assert
        assert user.email == "test@zoo.com"
    
    def test_user_username_strips_whitespace(self):
        # 1) Preparación
        # 2) Lógica - Username con espacios
        user = User(
            email="test@zoo.com",
            username="  testuser  ",
            hashed_password="hashed123",
            role_id=1,
        )
        # 3) Assert
        assert user.username == "testuser"
    
    def test_create_user_password_too_short_rejected(self):
        # 1) Preparación
        # 2) Lógica - Contraseña muy corta (solo 4 caracteres)
        with pytest.raises(ValidationError) as exc:
            UserCreate(
                email="test@zoo.com",
                username="testuser",
                password="123"  # Menos de 8 caracteres
            )
        # 3) Assert
        assert "8 caracteres" in str(exc.value)
    
    def test_create_user_password_without_uppercase_rejected(self):
        # 1) Preparación
        # 2) Lógica - Contraseña sin mayúscula
        with pytest.raises(ValidationError) as exc:
            UserCreate(
                email="test@zoo.com",
                username="testuser",
                password="test12345"  # Sin mayúscula
            )
        # 3) Assert
        assert "mayuscula" in str(exc.value)
    
    def test_create_user_password_without_number_rejected(self):
        # 1) Preparación
        # 2) Lógica - Contraseña sin número
        with pytest.raises(ValidationError) as exc:
            UserCreate(
                email="test@zoo.com",
                username="testuser",
                password="TestTest"  # Sin número
            )
        # 3) Assert
        assert "numero" in str(exc.value)