from datetime import datetime, timedelta, timezone
from types import SimpleNamespace

from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

import app.models  # noqa: F401
from app.core import dependencies, policia
from app.api.v1 import animals, auth
from app.crud import permission as crud_permission
from app.crud import token as crud_token
from app.db.base import Base
from app.models.permission import Permission
from app.models.refresh_token import RefreshToken
from app.models.role import Role
from app.models.role_permission import RolePermission
from app.models.user import User


def make_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    testing_session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return testing_session()


def test_protected_endpoint_returns_403_without_required_permission(monkeypatch):
    test_app = FastAPI()
    test_app.include_router(animals.router, prefix="/zooconnect/animals")
    client = TestClient(test_app)

    test_app.dependency_overrides[dependencies.get_current_active_user] = lambda: SimpleNamespace(
        id=1,
        is_active=True,
        is_admin=False,
    )
    test_app.dependency_overrides[dependencies.get_db] = lambda: object()
    monkeypatch.setattr(crud_permission, "user_has_permissions", lambda db, user_id, required: False)

    payload = {
        "nombre_cientifico": "Panthera leo",
        "nombre_especie": "Leon",
        "filo": "Chordata",
        "clase": "Mammalia",
        "orden": "Carnivora",
        "familia": "Felidae",
        "descripcion_especie": "Especie de prueba",
    }
    response = client.post("/zooconnect/animals/species/", json=payload)

    test_app.dependency_overrides.clear()

    assert response.status_code == 403


def test_user_access_is_granted_by_role_permission():
    db = make_session()
    role = Role(name="operaciones")
    permission = Permission(
        code="animals_create_species",
        name="Crear especie",
        module="animales",
    )
    db.add_all([role, permission])
    db.commit()
    db.refresh(role)
    db.refresh(permission)

    user = User(
        email="role-access@zooconnect.com",
        username="role-access",
        hashed_password="not-used",
        role_id=role.id,
        is_active=True,
    )
    db.add(user)
    db.add(RolePermission(role_id=role.id, permission_id=permission.id, allowed=True))
    db.commit()
    db.refresh(user)

    assert crud_permission.user_has_permissions(db, user.id, ["animals_create_species"])


def test_revoked_refresh_token_is_not_valid():
    db = make_session()
    user = User(
        email="refresh@zooconnect.com",
        username="refresh",
        hashed_password="not-used",
        role_id=1,
        is_active=True,
    )
    role = Role(id=1, name="visitante")
    db.add(role)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = RefreshToken(
        user_id=user.id,
        jti="revoked-token",
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        revoked=True,
    )
    db.add(token)
    db.commit()

    assert crud_token.is_refresh_token_valid(db, "revoked-token") is False


def test_account_locked_until_future_is_rejected():
    user = SimpleNamespace(locked_until=datetime.now(timezone.utc) + timedelta(minutes=5))

    assert policia.is_account_locked(user) is True


def test_invalid_2fa_session_token_returns_401():
    test_app = FastAPI()
    test_app.include_router(auth.router, prefix="/zooconnect/auth")
    client = TestClient(test_app)

    response = client.post(
        "/zooconnect/auth/2fa/verify-login",
        json={"session_token": "invalid-token", "code": "123456"},
    )

    assert response.status_code == 401
