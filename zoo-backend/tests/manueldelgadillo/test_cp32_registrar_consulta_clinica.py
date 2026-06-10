"""CP32: Verificar que el veterinario puede registrar una consulta clínica."""
from decimal import Decimal
from unittest.mock import MagicMock

from app.crud import veterinario as crud_vet
from app.models import veterinario as models_vet
from app.models.animal import Animal
from app.schemas import veterinario as schemas_vet

from .conftest import query_first


def test_cp32_registrar_consulta_clinica():
    db = MagicMock()
    animal = MagicMock(spec=Animal)
    tipo = MagicMock()
    tipo.is_active = True
    query_first(db, {Animal: animal, models_vet.TipoAtencion: tipo})

    historial_in = schemas_vet.HistorialMedicoCreate(
        animal_id=1,
        tipo_atencion_id=2,
        anamnesis="Decaimiento",
        peso_actual=Decimal("120.50"),
        temperatura=Decimal("38.20"),
        frecuencia_cardiaca=80,
        frecuencia_respiratoria=22,
        diagnostico_presuntivo="Anemia leve",
    )

    crud_vet.create_historial(db, historial_in, veterinario_id=10)

    db.add.assert_called_once()
    historial = db.add.call_args[0][0]
    assert historial.animal_id == 1
    assert historial.tipo_atencion_id == 2
    assert historial.veterinario_id == 10
    assert historial.estado is True
    assert historial.diagnostico_presuntivo == "Anemia leve"
    db.commit.assert_called_once()
