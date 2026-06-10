"""CP35: Verificar la emisión de una Orden de Examen Clínico."""
from unittest.mock import MagicMock

from app.crud import veterinario as crud_vet
from app.models import veterinario as models_vet
from app.schemas import veterinario as schemas_vet

from .conftest import query_first


def test_cp35_emitir_orden_examen():
    db = MagicMock()

    historial = MagicMock()
    historial.estado = True
    tipo_examen = MagicMock()
    tipo_examen.is_active = True

    query_first(
        db,
        {
            models_vet.HistorialMedico: historial,
            models_vet.TipoExamen: tipo_examen,
        },
    )

    orden_in = schemas_vet.OrdenExamenCreate(
        tipo_examen_id=7,
        instrucciones="Ayuno de 12 horas",
    )

    crud_vet.create_orden_examen(db, orden_in, historial_id=15)

    db.add.assert_called_once()
    orden = db.add.call_args[0][0]
    assert orden.tipo_examen_id == 7
    assert orden.instrucciones == "Ayuno de 12 horas"
    assert orden.estado == "Solicitado"
    assert orden.historial_medico_id == 15
    db.commit.assert_called_once()
