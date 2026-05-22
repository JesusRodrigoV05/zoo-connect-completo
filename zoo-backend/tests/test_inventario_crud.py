"""
Pruebas Unitarias - Gestión de Inventario (Backend)
Framework: Pytest 9.0.3
Módulos bajo prueba: app.crud.inventario, app.schemas.inventario, app.models.inventario
"""
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.crud.inventario import (
    create_tipo_producto,
    delete_tipo_producto,
    update_tipo_producto,
    update_producto,
    _validate_producto_fks,
)
from app.schemas.inventario import (
    TipoProductoCreate,
    TipoProductoUpdate,
    ProductoUpdate,
)
from app.models.inventario import TipoProducto, Producto


# =============================================================================
# TEST 1: Crear TipoProducto exitosamente
# =============================================================================
def test_create_tipo_producto_exitoso():
    """
    Verifica que create_tipo_producto persiste el objeto en BD
    cuando no existe un registro previo con el mismo nombre.
    """
    # 1. Preparación de la prueba
    db = MagicMock()
    tipo_producto_in = TipoProductoCreate(
        nombre_tipo_producto="Alimento",
        descripcion_tipo_producto="Alimento para animales",
    )

    # 2. Lógica de la prueba
    # Simula que no existe ningún TipoProducto con ese nombre
    with patch(
        "app.crud.inventario.get_tipo_producto_by_nombre", return_value=None
    ):
        result = create_tipo_producto(db, tipo_producto_in)

    # 3. Verificación del resultado esperado (Assert)
    db.add.assert_called_once()
    db.commit.assert_called_once()
    db.refresh.assert_called_once()


# =============================================================================
# TEST 2: Crear TipoProducto duplicado lanza HTTPException 409
# =============================================================================
def test_create_tipo_producto_duplicado_lanza_excepcion():
    """
    Verifica que create_tipo_producto lanza HTTPException con status 409
    cuando ya existe un TipoProducto con el mismo nombre.
    """
    # 1. Preparación de la prueba
    db = MagicMock()
    tipo_producto_in = TipoProductoCreate(
        nombre_tipo_producto="Alimento",
        descripcion_tipo_producto="Duplicado",
    )
    existing = MagicMock(spec=TipoProducto)
    existing.is_active = True

    # 2. Lógica de la prueba
    # Simula que ya existe un TipoProducto activo con ese nombre
    with patch(
        "app.crud.inventario.get_tipo_producto_by_nombre", return_value=existing
    ):
        with pytest.raises(HTTPException) as exc_info:
            create_tipo_producto(db, tipo_producto_in)

    # 3. Verificación del resultado esperado (Assert)
    assert exc_info.value.status_code == 409
    assert "ya existe" in exc_info.value.detail


# =============================================================================
# TEST 3: Soft-delete de TipoProducto marca is_active = False
# =============================================================================
def test_delete_tipo_producto_marca_inactivo():
    """
    Verifica que delete_tipo_producto realiza un borrado lógico
    estableciendo is_active = False, sin eliminar el registro de BD.
    """
    # 1. Preparación de la prueba
    db = MagicMock()
    db_tipo_producto = TipoProducto()
    db_tipo_producto.is_active = True

    # 2. Lógica de la prueba
    result = delete_tipo_producto(db, db_tipo_producto)

    # 3. Verificación del resultado esperado (Assert)
    assert db_tipo_producto.is_active is False
    db.add.assert_called_once_with(db_tipo_producto)
    db.commit.assert_called_once()


# =============================================================================
# TEST 4: update_producto no modifica stock_actual
# =============================================================================
def test_update_producto_excluye_stock_actual():
    """
    Verifica que update_producto ignora el campo stock_actual
    y solo actualiza los campos permitidos (nombre_producto, stock_minimo, etc.).
    """
    # 1. Preparación de la prueba
    db = MagicMock()
    db_producto = MagicMock(spec=Producto)
    db_producto.stock_actual = Decimal("50.00")
    db_producto.tipo_producto_id = 1
    db_producto.unidad_medida_id = 1

    producto_in = ProductoUpdate(
        nombre_producto="Carne modificada",
        stock_minimo=Decimal("10.00"),
    )

    # 2. Lógica de la prueba
    update_producto(db, db_producto, producto_in)

    # 3. Verificación del resultado esperado (Assert)
    # stock_actual no debe haber sido modificado por la función
    assert db_producto.stock_actual == Decimal("50.00")
    db.commit.assert_called_once()


# =============================================================================
# TEST 5: _validate_producto_fks con tipo inactivo lanza HTTPException 400
# =============================================================================
def test_validate_producto_fks_tipo_inactivo_lanza_excepcion():
    """
    Verifica que _validate_producto_fks lanza HTTPException con status 400
    cuando el TipoProducto referenciado existe pero está marcado como inactivo.
    """
    # 1. Preparación de la prueba
    db = MagicMock()
    tipo_inactivo = MagicMock(spec=TipoProducto)
    tipo_inactivo.is_active = False

    # 2. Lógica de la prueba
    # El tipo existe pero está inactivo (is_active=False)
    with patch(
        "app.crud.inventario.get_tipo_producto", return_value=tipo_inactivo
    ):
        with pytest.raises(HTTPException) as exc_info:
            _validate_producto_fks(db, tipo_producto_id=1, unidad_medida_id=1)

    # 3. Verificación del resultado esperado (Assert)
    assert exc_info.value.status_code == 400
    assert "inactivo" in exc_info.value.detail
