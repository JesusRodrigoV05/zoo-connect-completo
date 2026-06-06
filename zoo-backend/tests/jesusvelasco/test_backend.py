from datetime import date

import pytest
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.enums import AnimalState
from app.models.animal import Especie, Habitat, Animal
from app.schemas.animal import AnimalCreate


class TestBackend:
    def test_especie_strips_whitespace_from_text_fields(self):
        # 1) Preparación
        especie = Especie(
            nombre_cientifico="  Panthera leo  ",
            nombre_especie="  Leon  ",
            filo="  Chordata  ",
            clase="  Mammalia  ",
            orden="  Carnivora  ",
            familia="  Felidae  ",
            descripcion_especie="  Gran felino africano  ",
        )
        # 2) Lógica
        result_cientifico = especie.nombre_cientifico
        result_nombre = especie.nombre_especie
        result_filo = especie.filo
        # 3) Assert
        assert result_cientifico == "Panthera leo"
        assert result_nombre == "Leon"
        assert result_filo == "Chordata"

    def test_fecha_ingreso_anterior_a_nacimiento_rechazada(self):
        # 1) Preparación
        # 2) Lógica
        with pytest.raises(ValidationError) as exc:
            AnimalCreate(
                nombre_animal="Test", genero=True,
                especie_id=1, habitat_id=1,
                fecha_nacimiento=date(2024, 6, 1),
                fecha_ingreso=date(2024, 1, 1),
                procedencia_animal="Test",
                estado_operativo=AnimalState.SALUDABLE,
                es_publico=True, descripcion="Test",
            )
        # 3) Assert
        assert "fecha de ingreso" in str(exc.value).lower()

    def test_crear_animal_con_especie_invalida_lanza_error(self, db_session: Session, test_habitat: Habitat):
        # 1) Preparación
        from app.crud.animal import create_animal

        data = AnimalCreate(
            nombre_animal="Fantasma", genero=True,
            especie_id=9999, habitat_id=test_habitat.id_habitat,
            procedencia_animal="N/A",
            estado_operativo=AnimalState.SALUDABLE,
            es_publico=False, descripcion="Especie inexistente",
        )
        # 2) Lógica
        with pytest.raises(ValueError) as exc:
            create_animal(db_session, data)
        # 3) Assert
        assert "especie especificada no existe" in str(exc.value).lower()

    def test_animal_age_returns_none_without_birthdate(self):
        # 1) Preparación
        animal = Animal(
            nombre_animal="Simba", genero=True,
            especie_id=1, habitat_id=1,
            fecha_nacimiento=None, fecha_ingreso=None,
            procedencia_animal="Sabana",
            estado_operativo=AnimalState.SALUDABLE,
            es_publico=True, descripcion="Leon",
        )
        # 2) Lógica
        result = animal.age
        # 3) Assert
        assert result is None

    def test_animal_create_nombre_muy_largo_rechazado(self):
        # 1) Preparación
        # 2) Lógica
        with pytest.raises(ValidationError) as exc:
            AnimalCreate(
                nombre_animal="A" * 200, genero=True,
                especie_id=1, habitat_id=1,
                fecha_nacimiento=date(2020, 1, 1),
                fecha_ingreso=date(2020, 6, 1),
                procedencia_animal="Test",
                estado_operativo=AnimalState.SALUDABLE,
                es_publico=True, descripcion="Test",
            )
        # 3) Assert
        assert "nombre_animal" in str(exc.value)
        assert "100" in str(exc.value)
