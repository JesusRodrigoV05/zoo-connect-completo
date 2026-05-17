from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_active_user, get_db
from app.core.enums import AnimalState
from app.main import app as main_app
from app.models.animal import Especie, Habitat
from app.models.user import User
from app.schemas.animal import AnimalCreate


class TestRoutesAnimals:
    # Test #18
    # Verificar que el endpoint GET /animals/ retorne paginacion con items
    def test_list_animals_retorna_paginado(self, client, db_session: Session, test_especie: Especie, test_habitat: Habitat):
        from app.crud.animal import create_animal

        for i in range(2):
            create_animal(db_session, AnimalCreate(
                nombre_animal=f"Publico{i}", genero=True,
                especie_id=test_especie.id_especie, habitat_id=test_habitat.id_habitat,
                procedencia_animal="Test", estado_operativo=AnimalState.SALUDABLE,
                es_publico=True, descripcion="Publico",
            ))

        response = client.get("/zooconnect/animals/animals/")
        assert response.status_code == 200
        body = response.json()
        assert "items" in body
        assert len(body["items"]) == 2

    # Test #19
    # Verificar que obtener un animal con ID inexistente devuelva 404
    def test_get_animal_404(self, client):
        response = client.get("/zooconnect/animals/animals/99999")
        assert response.status_code == 404
        assert "no encontrado" in response.json()["detail"].lower()

    # Test #20
    # Verificar que un usuario sin permisos no pueda crear animales (403)
    def test_create_animal_sin_permiso_retorna_403(self, db_session: Session, visitante_user: User, test_especie: Especie, test_habitat: Habitat):
        main_app.dependency_overrides.clear()
        main_app.dependency_overrides[get_db] = lambda: db_session
        main_app.dependency_overrides[get_current_active_user] = lambda: visitante_user

        with (
            patch("app.main.init_db"),
            patch("app.main.create_default_admin"),
            patch("app.main.setup_scheduler"),
        ):
            with TestClient(main_app) as c:
                payload = {
                    "nombre_animal": "Hacker", "genero": True,
                    "especie_id": test_especie.id_especie,
                    "habitat_id": test_habitat.id_habitat,
                    "procedencia_animal": "N/A",
                    "estado_operativo": AnimalState.SALUDABLE.value,
                    "es_publico": True, "descripcion": "Intento sin permisos",
                }
                response = c.post("/zooconnect/animals/animals/", json=payload)
                assert response.status_code == 403

        main_app.dependency_overrides.clear()
