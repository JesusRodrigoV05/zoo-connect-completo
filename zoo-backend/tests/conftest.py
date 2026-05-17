import sys
import types
from collections.abc import Generator
from unittest.mock import MagicMock

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

# ── Bootstrap: mock missing modules BEFORE any app import ──
_perm_mod = types.ModuleType("app.crud.permission")
_perm_mod.ensure_permissions_catalog = MagicMock()
_perm_mod.ensure_role_permissions = MagicMock()
sys.modules["app.crud.permission"] = _perm_mod

import app.scripts.create_admin as _ca_mod
_ca_mod.create_default_admin = _ca_mod.init_db

from app.core.config import settings
from app.core.enums import UserRole
import app.models

from app.core.security import get_password_hash
from app.db.base import Base
from app.models.role import Role
from app.models.user import User

TEST_DB_URL = "sqlite://"

engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


def seed_roles(session: Session) -> dict[str, Role]:
    roles = {}
    for role in UserRole:
        r = Role(name=role.value)
        session.add(r)
        session.flush()
        roles[role.value] = r
    session.commit()
    return roles


def create_user(session: Session, role_name: str = UserRole.VISITANTE.value) -> User:
    role = session.query(Role).filter(Role.name == role_name).first()
    user = User(
        email=f"{role_name}@test.com",
        username=role_name,
        hashed_password=get_password_hash("password123"),
        role_id=role.id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db_session(setup_database: None) -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    seed_roles(session)
    yield session

    session.close()
    transaction.rollback()
    connection.close()
