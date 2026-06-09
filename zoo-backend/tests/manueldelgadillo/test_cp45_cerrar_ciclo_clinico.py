"""CP45: Verificar el cierre del ciclo clínico (historial finalizado)."""
from unittest.mock import MagicMock

import pytest
from fastapi import HTTPException

from app.crud import veterinario as crud_vet
from app.schemas import veterinario as schemas_vet


def test_cp45_cerrar_ciclo_clinico():
    db = MagicMock()
    historial_abierto = MagicMock()
    historial_abierto.estado = True

    update_in = schemas_vet.HistorialMedicoUpdate(
        estado=False,
        diagnostico_definitivo="Alta médica",
    )

    crud_vet.update_historial(db, historial_abierto, update_in)

    assert historial_abierto.estado is False
    assert historial_abierto.diagnostico_definitivo == "Alta médica"
    db.commit.assert_called_once()

    historial_cerrado = MagicMock()
    historial_cerrado.estado = False

    with pytest.raises(HTTPException) as exc_info:
        crud_vet._check_historial_editable(historial_cerrado)

    assert exc_info.value.status_code == 409
