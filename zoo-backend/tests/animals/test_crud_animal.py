from datetime import date

import pytest
from sqlalchemy.orm import Session

from app.core.enums import AnimalState
from app.models.animal import Especie, Habitat
from app.schemas.animal import AnimalCreate, AnimalUpdate


class TestCrudAnimal:
    # Test #9
    # Verificar que crear un animal valido lo persista y asocie correctamente a su especie
    def test_create_animal_ok(self, db_session: Session, test_especie: Especie, test_habitat: Habitat):
        from app.crud.animal import create_animal

        data = AnimalCreate(
            nombre_animal="Tigresa",
            genero=False,
            especie_id=test_especie.id_especie,
            habitat_id=test_habitat.id_habitat,
            fecha_nacimiento=date(2019, 3, 10),
            fecha_ingreso=date(2020, 5, 1),
            procedencia_animal="India",
            estado_operativo=AnimalState.SALUDABLE,
            es_publico=True,
            descripcion="Tigresa de Bengala",
        )
        result = create_animal(db_session, data)
        assert result.id_animal is not None
        assert result.nombre_animal == "Tigresa"
        assert result.especie.nombre_cientifico == "Panthera leo"

    # Test #10
    # Verificar que crear un animal con especie_id inexistente lance ValueError
    def test_create_animal_especie_invalida(self, db_session: Session, test_habitat: Habitat):
        from app.crud.animal import create_animal

        data = AnimalCreate(
            nombre_animal="Fantasma",
            genero=True,
            especie_id=9999,
            habitat_id=test_habitat.id_habitat,
            procedencia_animal="N/A",
            estado_operativo=AnimalState.SALUDABLE,
            es_publico=False,
            descripcion="Especie inexistente",
        )
        with pytest.raises(ValueError, match="especie especificada no existe"):
            create_animal(db_session, data)

    # Test #11
    # Verificar que crear un animal con habitat_id inexistente lance ValueError
    def test_create_animal_habitat_invalido(self, db_session: Session, test_especie: Especie):
        from app.crud.animal import create_animal

        data = AnimalCreate(
            nombre_animal="Fantasma",
            genero=True,
            especie_id=test_especie.id_especie,
            habitat_id=9999,
            procedencia_animal="N/A",
            estado_operativo=AnimalState.SALUDABLE,
            es_publico=False,
            descripcion="Habitat inexistente",
        )
        with pytest.raises(ValueError, match="habitat especificado no existe"):
            create_animal(db_session, data)

    # Test #12
    # Verificar que actualizar atributos de un animal persista los cambios correctamente
    def test_update_animal_cambia_atributos(self, db_session: Session, test_especie: Especie, test_habitat: Habitat):
        from app.crud.animal import create_animal, update_animal

        animal = create_animal(
            db_session,
            AnimalCreate(
                nombre_animal="Rex", genero=True,
                especie_id=test_especie.id_especie,
                habitat_id=test_habitat.id_habitat,
                procedencia_animal="Cautiverio",
                estado_operativo=AnimalState.SALUDABLE,
                es_publico=True,
                descripcion="Original",
            ),
        )

        updated = update_animal(
            db_session, animal=animal,
            animal_in=AnimalUpdate(nombre_animal="Rex Actualizado", descripcion="Actualizado"),
        )
        assert updated.nombre_animal == "Rex Actualizado"
        assert updated.descripcion == "Actualizado"

    # Test #13
    # Verificar que actualizar un animal con habitat_id inexistente lance ValueError
    def test_update_animal_habitat_invalido(self, db_session: Session, test_especie: Especie, test_habitat: Habitat):
        from app.crud.animal import create_animal, update_animal

        animal = create_animal(
            db_session,
            AnimalCreate(
                nombre_animal="Rex", genero=True,
                especie_id=test_especie.id_especie,
                habitat_id=test_habitat.id_habitat,
                procedencia_animal="Cautiverio",
                estado_operativo=AnimalState.SALUDABLE,
                es_publico=True,
                descripcion="Original",
            ),
        )
        with pytest.raises(ValueError, match="habitat especificado no existe"):
            update_animal(db_session, animal=animal, animal_in=AnimalUpdate(habitat_id=9999))

    # Test #14
    # Verificar que list_animals filtre correctamente por es_publico=True vs sin filtro
    def test_list_animals_filtro_publico(self, db_session: Session, test_especie: Especie, test_habitat: Habitat):
        from app.crud.animal import create_animal, list_animals

        for i in range(3):
            create_animal(db_session, AnimalCreate(
                nombre_animal=f"Publico{i}", genero=True,
                especie_id=test_especie.id_especie, habitat_id=test_habitat.id_habitat,
                procedencia_animal="Test", estado_operativo=AnimalState.SALUDABLE,
                es_publico=True, descripcion="Publico",
            ))
        create_animal(db_session, AnimalCreate(
            nombre_animal="Privado", genero=True,
            especie_id=test_especie.id_especie, habitat_id=test_habitat.id_habitat,
            procedencia_animal="Test", estado_operativo=AnimalState.SALUDABLE,
            es_publico=False, descripcion="No publico",
        ))

        solo_publicos = list_animals(db_session, es_publico=True).all()
        assert len(solo_publicos) == 3

        todos = list_animals(db_session, es_publico=None).all()
        assert len(todos) == 4
