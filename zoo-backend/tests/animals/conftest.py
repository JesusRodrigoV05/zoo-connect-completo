from collections.abc import Generator
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.dependencies import (
    get_current_active_user,
    require_admin_user,
    require_animal_management_permission,
)
from app.core.enums import AnimalState, UserRole
from app.core.security import create_access_token
from app.db.session import get_db
from app.main import app
from app.models.user import User
from app.schemas.animal import EspecieCreate, HabitatCreate


def default_especie_data() -> dict:
    return {
        "nombre_cientifico": "Panthera leo",
        "nombre_especie": "Leon africano",
        "filo": "Chordata",
        "clase": "Mammalia",
        "orden": "Carnivora",
        "familia": "Felidae",
        "descripcion_especie": "El rey de la selva",
    }


def default_habitat_data() -> dict:
    return {
        "nombre_habitat": "Sabana africana",
        "tipo_habitat": "Sabana",
        "descripcion_habitat": "Extensa llanura con arboles dispersos",
        "condiciones_climaticas": "Calido, estacion seca y humeda",
    }


@pytest.fixture
def test_especie(db_session: Session):
    from app.crud.animal import create_especie

    data = default_especie_data()
    return create_especie(db_session, EspecieCreate(**data))


@pytest.fixture
def test_habitat(db_session: Session):
    from app.crud.animal import create_habitat

    data = default_habitat_data()
    return create_habitat(db_session, HabitatCreate(**data))


@pytest.fixture
def admin_user(db_session: Session) -> User:
    from tests.conftest import create_user

    return create_user(db_session, UserRole.ADMINISTRADOR.value)


@pytest.fixture
def visitante_user(db_session: Session) -> User:
    from tests.conftest import create_user

    return create_user(db_session, UserRole.VISITANTE.value)


@pytest.fixture
def client(db_session: Session, admin_user: User) -> Generator[TestClient, None, None]:
    app.dependency_overrides[get_db] = lambda: db_session
    app.dependency_overrides[get_current_active_user] = lambda: admin_user
    app.dependency_overrides[require_admin_user] = lambda: admin_user
    app.dependency_overrides[require_animal_management_permission] = lambda: admin_user

    with (
        patch("app.main.init_db"),
        patch("app.main.create_default_admin"),
        patch("app.main.setup_scheduler"),
    ):
        with TestClient(app) as c:
            yield c

    app.dependency_overrides.clear()
