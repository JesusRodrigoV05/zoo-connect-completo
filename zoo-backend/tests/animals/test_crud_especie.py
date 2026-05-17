import pytest
from sqlalchemy.orm import Session

from app.models.animal import Especie
from app.schemas.animal import EspecieCreate


class TestCrudEspecie:
    # Test #5
    # Verificar que crear una especie la persista en DB y sea recuperable por ID
    def test_create_especie_persiste(self, db_session: Session):
        from app.crud.animal import create_especie, get_especie

        data = EspecieCreate(
            nombre_cientifico="Panthera tigris",
            nombre_especie="Tigre de Bengala",
            filo="Chordata",
            clase="Mammalia",
            orden="Carnivora",
            familia="Felidae",
            descripcion_especie="Gran felino rayado",
        )
        result = create_especie(db_session, data)
        assert result.id_especie is not None
        assert result.nombre_cientifico == "Panthera tigris"
        assert result.is_active is True

        fetched = get_especie(db_session, result.id_especie)
        assert fetched is not None
        assert fetched.nombre_especie == "Tigre de Bengala"

    # Test #6
    # Verificar busqueda de especie por nombre cientifico exacto y que devuelva None si no existe
    def test_get_especie_by_nombre_cientifico(self, db_session: Session, test_especie: Especie):
        from app.crud.animal import get_especie_by_nombre_cientifico

        found = get_especie_by_nombre_cientifico(db_session, "Panthera leo")
        assert found is not None
        assert found.id_especie == test_especie.id_especie

        not_found = get_especie_by_nombre_cientifico(db_session, "No existe")
        assert not_found is None

    # Test #7
    # Verificar que eliminar una especie haga soft delete (is_active=False) y no sea recuperable
    def test_delete_especie_soft_delete(self, db_session: Session, test_especie: Especie):
        from app.crud.animal import delete_especie, get_especie

        deleted = delete_especie(db_session, test_especie.id_especie)
        assert deleted is not None
        assert deleted.is_active is False

        after_delete = get_especie(db_session, test_especie.id_especie)
        assert after_delete is None

    # Test #8
    # Verificar que eliminar una especie ya inactiva devuelva None (no hay nada que desactivar)
    def test_delete_especie_ya_inactiva_retorna_none(self, db_session: Session, test_especie: Especie):
        from app.crud.animal import delete_especie

        delete_especie(db_session, test_especie.id_especie)
        result = delete_especie(db_session, test_especie.id_especie)
        assert result is None
