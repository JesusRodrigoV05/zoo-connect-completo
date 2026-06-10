/**
 * Pruebas Unitarias - Gestión de Inventario (Frontend)
 * Framework: Vitest 4.1.7
 * Módulos bajo prueba: adapters/producto.adapter.ts (ProductoAdapter, TipoProductoAdapter,
 *                       UnidadMedidaAdapter, ProveedorAdapter)
 *
 * Las pruebas son puras (sin Angular TestBed ni DOM): solo validan
 * la lógica de mapeo entre el formato del backend (snake_case)
 * y el modelo del frontend (camelCase).
 */
import { describe, it, expect } from 'vitest';

import {
  ProductoAdapter,
  TipoProductoAdapter,
  UnidadMedidaAdapter,
  ProveedorAdapter,
} from '../app/features/private/admin/adapters/producto.adapter';

// =============================================================================
// TEST 1: TipoProductoAdapter.fromBackend mapea correctamente desde snake_case
// =============================================================================
describe('TipoProductoAdapter', () => {
  it('debe mapear correctamente los campos snake_case del backend a camelCase del frontend', () => {
    // 1. Preparación de la prueba
    const backendData = {
      id_tipo_producto: 5,
      nombre_tipo_producto: 'Alimento',
      descripcion_tipo_producto: 'Alimento para mamíferos',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-06-01T00:00:00Z',
    };

    // 2. Lógica de la prueba
    const result = TipoProductoAdapter.fromBackend(backendData);

    // 3. Verificación del resultado esperado (Assert)
    expect(result.id).toBe(5);
    expect(result.nombre).toBe('Alimento');
    expect(result.descripcion).toBe('Alimento para mamíferos');
    expect(result.isActive).toBe(true);
  });
});

// =============================================================================
// TEST 2: ProductoAdapter.fromBackend convierte stock numérico correctamente
// =============================================================================
describe('ProductoAdapter', () => {
  it('debe convertir stock_minimo y stock_actual a tipo Number', () => {
    // 1. Preparación de la prueba
    // El backend devuelve los valores Decimal como strings JSON
    const backendData = {
      id_producto: 10,
      nombre_producto: 'Carne de res',
      descripcion_producto: 'Carne fresca',
      stock_minimo: '5.00',
      stock_actual: '20.50',
      photo_url: null,
      public_id: null,
      is_active: true,
      tipo_producto_id: 1,
      unidad_medida_id: 2,
      tipo_producto: {
        id_tipo_producto: 1,
        nombre_tipo_producto: 'Carne',
        descripcion_tipo_producto: null,
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      unidad_medida: {
        id_unidad: 2,
        nombre_unidad: 'Kilogramos',
        abreviatura: 'kg',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
    };

    // 2. Lógica de la prueba
    const result = ProductoAdapter.fromBackend(backendData);

    // 3. Verificación del resultado esperado (Assert)
    expect(typeof result.stockMinimo).toBe('number');
    expect(typeof result.stockActual).toBe('number');
    expect(result.stockMinimo).toBe(5);
    expect(result.stockActual).toBe(20.5);
    expect(result.nombre).toBe('Carne de res');
  });

  // ===========================================================================
  // TEST 3: ProductoAdapter.toCreate genera payload correcto para el backend
  // ===========================================================================
  it('debe generar el payload snake_case correcto al crear un producto', () => {
    // 1. Preparación de la prueba
    const createData = {
      nombre: 'Pollo',
      descripcion: 'Pollo fresco',
      stockMinimo: 10,
      tipoProductoId: 3,
      unidadMedidaId: 1,
    };

    // 2. Lógica de la prueba
    const payload = ProductoAdapter.toCreate(createData);

    // 3. Verificación del resultado esperado (Assert)
    expect(payload.nombre_producto).toBe('Pollo');
    expect(payload.descripcion_producto).toBe('Pollo fresco');
    expect(payload.stock_minimo).toBe(10);
    expect(payload.tipo_producto_id).toBe(3);
    expect(payload.unidad_medida_id).toBe(1);
    // El payload no debe tener claves camelCase
    expect(payload.nombre).toBeUndefined();
    expect(payload.tipoProductoId).toBeUndefined();
  });
});

// =============================================================================
// TEST 4: ProveedorAdapter.toUpdate genera payload con is_active correctamente
// =============================================================================
describe('ProveedorAdapter', () => {
  it('debe incluir is_active en el payload de actualización del proveedor', () => {
    // 1. Preparación de la prueba
    const updateData = {
      nombre: 'Proveedor XYZ',
      telefono: '555-1234',
      email: 'xyz@proveedor.com',
      isActive: false,
    };

    // 2. Lógica de la prueba
    const payload = ProveedorAdapter.toUpdate(updateData);

    // 3. Verificación del resultado esperado (Assert)
    expect(payload.nombre_proveedor).toBe('Proveedor XYZ');
    expect(payload.telefono_proveedor).toBe('555-1234');
    expect(payload.email_proveedor).toBe('xyz@proveedor.com');
    expect(payload.is_active).toBe(false);
  });
});

// =============================================================================
// TEST 5: UnidadMedidaAdapter.fromBackend mapea id_unidad al campo id
// =============================================================================
describe('UnidadMedidaAdapter', () => {
  it('debe mapear id_unidad a id y abreviatura al campo abreviatura', () => {
    // 1. Preparación de la prueba
    const backendData = {
      id_unidad: 7,
      nombre_unidad: 'Kilogramos',
      abreviatura: 'kg',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    // 2. Lógica de la prueba
    const result = UnidadMedidaAdapter.fromBackend(backendData);

    // 3. Verificación del resultado esperado (Assert)
    expect(result.id).toBe(7);
    expect(result.nombre).toBe('Kilogramos');
    expect(result.abreviatura).toBe('kg');
    expect(result.isActive).toBe(true);
    // El resultado no debe exponer el campo original del backend
    expect((result as any).id_unidad).toBeUndefined();
  });
});
