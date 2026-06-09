"""CP31: Verificar la creación de una nueva categoría de Tipo de Atención."""
from unittest.mock import MagicMock

from app.crud import veterinario as crud_vet
from app.schemas import veterinario as schemas_vet


def test_cp31_crear_tipo_atencion():
    db = MagicMock()
    obj_in = schemas_vet.TipoAtencionCreate(
        nombre_tipo_atencion="Tratamiento Ortopédico",
        descripcion="Atención especializada",
    )

    crud_vet.create_tipo_atencion(db, obj_in)

    db.add.assert_called_once()
    added = db.add.call_args[0][0]
    assert added.nombre_tipo_atencion == "Tratamiento Ortopédico"
    assert added.descripcion == "Atención especializada"
    db.commit.assert_called_once()
    db.refresh.assert_called_once()
