import pytest
from sqlalchemy.orm import Session

from app.core.enums import AnimalState
from app.models.animal import Especie, Habitat
from app.models.user import User
from app.schemas.animal import AnimalCreate, AnimalFavoritoCreate


class TestCrudFavoritos:
    # Test #15
    # Verificar que agregar un favorito lo persista con usuario_id y animal_id correctos
    def test_add_favorite_ok(self, db_session: Session, admin_user: User, test_especie: Especie, test_habitat: Habitat):
        from app.crud.animal import add_animal_to_favorites, create_animal

        animal = create_animal(db_session, AnimalCreate(
            nombre_animal="Favorito", genero=True,
            especie_id=test_especie.id_especie, habitat_id=test_habitat.id_habitat,
            procedencia_animal="Test", estado_operativo=AnimalState.SALUDABLE,
            es_publico=True, descripcion="Favorito",
        ))

        fav = add_animal_to_favorites(db_session, admin_user.id, AnimalFavoritoCreate(animal_id=animal.id_animal))
        assert fav.id_animal_favorito is not None
        assert fav.usuario_id == admin_user.id
        assert fav.animal_id == animal.id_animal

    # Test #16
    # Verificar que agregar el mismo favorito dos veces lance ValueError
    def test_add_favorite_duplicado_rechazado(self, db_session: Session, admin_user: User, test_especie: Especie, test_habitat: Habitat):
        from app.crud.animal import add_animal_to_favorites, create_animal

        animal = create_animal(db_session, AnimalCreate(
            nombre_animal="Dupe", genero=True,
            especie_id=test_especie.id_especie, habitat_id=test_habitat.id_habitat,
            procedencia_animal="Test", estado_operativo=AnimalState.SALUDABLE,
            es_publico=True, descripcion="Duplicado",
        ))

        add_animal_to_favorites(db_session, admin_user.id, AnimalFavoritoCreate(animal_id=animal.id_animal))
        with pytest.raises(ValueError, match="ya esta en tu lista"):
            add_animal_to_favorites(db_session, admin_user.id, AnimalFavoritoCreate(animal_id=animal.id_animal))

    # Test #17
    # Verificar que eliminar un favorito inexistente devuelva False
    def test_remove_favorite_no_existe_retorna_false(self, db_session: Session, admin_user: User):
        from app.crud.animal import remove_animal_from_favorites

        result = remove_animal_from_favorites(db_session, admin_user.id, 9999)
        assert result is False
