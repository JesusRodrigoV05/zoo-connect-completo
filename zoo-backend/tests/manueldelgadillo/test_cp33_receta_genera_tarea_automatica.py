"""CP33: Verificar receta con generación automática de tareas (recordatorios)."""
from decimal import Decimal
from unittest.mock import MagicMock

from app.crud import veterinario as crud_vet
from app.models import veterinario as models_vet
from app.models.inventario import Producto
from app.models.tarea import TareaRecurrente
from app.models.user import User
from app.schemas import veterinario as schemas_vet

from .conftest import query_first


def test_cp33_receta_genera_tarea_automatica():
    db = MagicMock()

    historial = MagicMock()
    historial.estado = True
    historial.animal_id = 3
    historial.animal = MagicMock(nombre_animal="Simba", habitat_id=1)

    producto = MagicMock(spec=Producto)
    producto.is_active = True
    usuario = MagicMock()

    query_first(
        db,
        {
            models_vet.HistorialMedico: historial,
            Producto: producto,
            User: usuario,
        },
    )

    receta_in = schemas_vet.RecetaMedicaCreate(
        producto_id=5,
        dosis=Decimal("10.00"),
        frecuencia="Diariamente",
        duracion_dias=7,
        instrucciones_administracion="Con comida",
        generar_tarea_automatica=True,
        frecuencia_cron="0 8 * * *",
        usuario_asignado_id=4,
    )

    crud_vet.create_receta(db, receta_in, historial_id=99)

    assert db.add.call_count >= 2
    tarea_calls = [
        call.args[0]
        for call in db.add.call_args_list
        if isinstance(call.args[0], TareaRecurrente)
    ]
    assert len(tarea_calls) == 1
    tarea = tarea_calls[0]
    assert tarea.frecuencia_cron == "0 8 * * *"
    assert tarea.usuario_asignado_id == 4
    assert tarea.animal_id == 3
    db.commit.assert_called_once()
