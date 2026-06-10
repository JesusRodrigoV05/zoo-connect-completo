"""
Pruebas Unitarias - Gestión de Tareas (Backend - Schemas)
Framework: Pytest 9.0.3
Módulos bajo prueba: app.schemas.tarea
"""

from datetime import date
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.schemas.tarea import (
    TareaCreate,
    TipoTareaUpdate,
    TareaRecurrenteCreate,
    TareaAlimentacionCompletar,
    DetalleAlimentacionCreate,
)

# =============================================================================
# TEST 1: Serialización correcta de TareaCreate
# =============================================================================
def test_tarea_create_serializa_correctamente():
    """
    Verifica que el esquema TareaCreate guarde y devuelva correctamente
    los datos obligatorios asignados al instanciarlo.
    """
    # 1. Preparación de la prueba (Arrange)
    tarea = TareaCreate(
        titulo="Limpiar jaula",
        descripcion_tarea="Limpiar la jaula del leon",
        fecha_programada=date(2024, 6, 1),
        tipo_tarea_id=1,
    )

    # 2. Lógica de la prueba (Act)
    result = tarea.model_dump()

    # 3. Verificación del resultado esperado (Assert)
    assert result["titulo"] == "Limpiar jaula"
    assert result["fecha_programada"] == date(2024, 6, 1)
    assert result["tipo_tarea_id"] == 1
    assert result["usuario_asignado_id"] is None


# =============================================================================
# TEST 2: Valor por defecto de TareaRecurrenteCreate
# =============================================================================
def test_tarea_recurrente_create_default_is_active_true():
    """
    Verifica que al crear una TareaRecurrenteCreate, el campo
    'is_active' se inicialice automáticamente en True por defecto.
    """
    # 1. Preparación de la prueba (Arrange)
    tarea = TareaRecurrenteCreate(
        titulo_plantilla="Limpieza diaria",
        descripcion_plantilla="Limpieza general del habitat",
        tipo_tarea_id=1,
        frecuencia_cron="0 8 * * *",
    )

    # 2. Lógica de la prueba (Act)
    result = tarea.model_dump()

    # 3. Verificación del resultado esperado (Assert)
    assert result["is_active"] is True


# =============================================================================
# TEST 3: Campos opcionales en TipoTareaUpdate
# =============================================================================
def test_tipo_tarea_update_campos_son_opcionales():
    """
    Verifica que TipoTareaUpdate pueda instanciarse vacío, confirmando
    que todos sus campos de actualización son opcionales.
    """
    # 1. Preparación de la prueba (Arrange)
    update = TipoTareaUpdate()

    # 2. Lógica de la prueba (Act)
    result = update.model_dump(exclude_unset=True)

    # 3. Verificación del resultado esperado (Assert)
    assert result == {}


# =============================================================================
# TEST 4: Serialización de detalles en TareaAlimentacionCompletar
# =============================================================================
def test_tarea_alimentacion_completar_serializa_detalles():
    """
    Verifica que TareaAlimentacionCompletar anide y serialice correctamente
    una lista de sub-esquemas DetalleAlimentacionCreate.
    """
    # 1. Preparación de la prueba (Arrange)
    detalle = DetalleAlimentacionCreate(
        producto_id=1,
        cantidad_entregada=Decimal("10.50"),
        cantidad_consumida=Decimal("9.00"),
    )
    payload = TareaAlimentacionCompletar(
        notas_observaciones="Consumo normal",
        detalles=[detalle],
    )

    # 2. Lógica de la prueba (Act)
    result = payload.model_dump()

    # 3. Verificación del resultado esperado (Assert)
    assert result["notas_observaciones"] == "Consumo normal"
    assert len(result["detalles"]) == 1
    assert result["detalles"][0]["producto_id"] == 1
    assert float(result["detalles"][0]["cantidad_entregada"]) == 10.50


# =============================================================================
# TEST 5: Cantidad consumida opcional en DetalleAlimentacionCreate
# =============================================================================
def test_detalle_alimentacion_create_cantidad_consumida_opcional():
    """
    Verifica que DetalleAlimentacionCreate no requiera obligatoriamente
    el campo 'cantidad_consumida' y lo maneje como None si se omite.
    """
    # 1. Preparación de la prueba (Arrange)
    # 2. Lógica de la prueba (Act)
    detalle = DetalleAlimentacionCreate(
        producto_id=1,
        cantidad_entregada=Decimal("5.00"),
    )

    # 3. Verificación del resultado esperado (Assert)
    assert detalle.cantidad_consumida is None