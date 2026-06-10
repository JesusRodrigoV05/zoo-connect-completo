import os
import sys

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["DEFAULT_ADMIN_EMAIL"] = "admin@test.com"
os.environ["DEFAULT_ADMIN_PASSWORD"] = "test123"
os.environ["CLOUDINARY_CLOUD_NAME"] = "test"
os.environ["CLOUDINARY_API_KEY"] = "test"
os.environ["CLOUDINARY_API_SECRET"] = "test"
os.environ["MAIL_USERNAME"] = "test@test.com"
os.environ["MAIL_PASSWORD"] = "test"
os.environ["MAIL_FROM"] = "test@test.com"
os.environ["TOTP_ENCRYPTION_KEY"] = "test-key-32chars-xxxxxxxx"

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session as SASession

from app.db.base import Base
from app.models import *
from app.core.enums import UserRole
from app.models.role import Role


@pytest.fixture(scope="session")
def engine():
    return create_engine("sqlite:///:memory:", echo=False)


@pytest.fixture(scope="session")
def tables(engine):
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture
def db_session(engine, tables):
    connection = engine.connect()
    transaction = connection.begin()
    session = SASession(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def test_role_admin(db_session):
    """Crea el rol de administrador para pruebas"""
    role = Role(
        id=1,
        name=UserRole.ADMINISTRADOR.value,
        description="Administrador del sistema"
    )
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role


@pytest.fixture
def test_role_visitante(db_session):
    """Crea el rol de visitante para pruebas"""
    role = Role(
        id=2,
        name=UserRole.VISITANTE.value,
        description="Visitante del zoológico"
    )
    db_session.add(role)
    db_session.commit()
    db_session.refresh(role)
    return role


@pytest.fixture
def test_user_data():
    """Datos de prueba para crear usuario"""
    return {
        "email": "test@zoo.com",
        "username": "testuser",
        "password": "Test123456",
    }