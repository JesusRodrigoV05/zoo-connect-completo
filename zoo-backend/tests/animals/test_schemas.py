from datetime import date

import pytest
from pydantic import ValidationError

from app.core.enums import AnimalState
from app.schemas.animal import AnimalCreate, AnimalUpdate, EspecieCreate


class TestAnimalCreateSchema:
    # Test #1
    # Validar que crear un animal con fecha de ingreso anterior a la fecha de nacimiento lance un error
    def test_fecha_ingreso_anterior_a_nacimiento_rechazada(self):
        with pytest.raises(ValidationError) as exc:
            AnimalCreate(
                nombre_animal="Test",
                genero=True,
                especie_id=1,
                habitat_id=1,
                fecha_nacimiento=date(2024, 6, 1),
                fecha_ingreso=date(2024, 1, 1),
                procedencia_animal="Test",
                estado_operativo=AnimalState.SALUDABLE,
                es_publico=True,
                descripcion="Test",
            )
        assert "fecha de ingreso" in str(exc.value).lower()

    # Test #2
    # Verificar que fechas correctas (nacimiento anterior a ingreso) no lancen error
    def test_fechas_validas_pasan_sin_error(self):
        animal = AnimalCreate(
            nombre_animal="Test",
            genero=True,
            especie_id=1,
            habitat_id=1,
            fecha_nacimiento=date(2024, 1, 1),
            fecha_ingreso=date(2024, 6, 1),
            procedencia_animal="Test",
            estado_operativo=AnimalState.SALUDABLE,
            es_publico=True,
            descripcion="Test",
        )
        assert animal.fecha_nacimiento == date(2024, 1, 1)
        assert animal.fecha_ingreso == date(2024, 6, 1)

    # Test #3
    # Verificar que crear una especie sin campos obligatorios lance ValidationError
    def test_especie_create_campos_obligatorios(self):
        with pytest.raises(ValidationError):
            EspecieCreate()

    # Test #4
    # Verificar que AnimalUpdate con solo un campo incluya solo ese campo al usar exclude_unset
    def test_animal_update_campos_parciales(self):
        data = {"nombre_animal": "Nuevo nombre"}
        update = AnimalUpdate(**data)
        dump = update.model_dump(exclude_unset=True)
        assert dump == {"nombre_animal": "Nuevo nombre"}
