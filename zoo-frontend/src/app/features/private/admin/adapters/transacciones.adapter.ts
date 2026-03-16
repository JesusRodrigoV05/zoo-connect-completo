import {
  CreateEntradaRequest,
  CreateSalidaRequest,
  CreateTipoSalida,
  EntradaInventario,
  SalidaInventario,
  TipoSalida,
  UpdateTipoSalida,
} from "../models/entradas-salidas/transacciones.model";
import { ProductoAdapter, ProveedorAdapter } from "./producto.adapter";

export class TipoSalidaAdapter {
  static fromBackend(data: any): TipoSalida {
    return {
      id: data.id_tipo_salida,
      nombre: data.nombre_tipo_salida,
      descripcion: data.descripcion_tipo_salida,
      isActive: data.is_active,
    };
  }

  static toCreate(data: CreateTipoSalida): any {
    return {
      nombre_tipo_salida: data.nombre,
      descripcion_tipo_salida: data.descripcion,
    };
  }

  static toUpdate(data: UpdateTipoSalida): any {
    return {
      nombre_tipo_salida: data.nombre,
      descripcion_tipo_salida: data.descripcion,
      is_active: data.isActive,
    };
  }
}

export class EntradaAdapter {
  static fromBackend(data: any): EntradaInventario {
    return {
      id: data.id_entrada_inventario,
      fecha: data.fecha_entrada,
      usuarioId: data.usuario_id,
      proveedorId: data.proveedor_id,
      proveedor: data.proveedor
        ? ProveedorAdapter.fromBackend(data.proveedor)
        : undefined,
      detalles:
        data.detalles?.map((d: any) => ({
          id: d.id_detalle_entrada,
          productoId: d.producto_id,
          producto: d.producto
            ? ProductoAdapter.fromBackend(d.producto)
            : undefined,
          cantidad: Number(d.cantidad_entrada),
          fechaCaducidad: d.fecha_caducidad,
          lote: d.lote,
        })) || [],
    };
  }

  static toCreate(data: CreateEntradaRequest): any {
    return {
      proveedor_id: data.proveedorId,
      detalles: data.detalles.map((d) => ({
        producto_id: d.productoId,
        cantidad_entrada: d.cantidad,
        fecha_caducidad: d.fechaCaducidad,
        lote: d.lote,
      })),
    };
  }
}

export class SalidaAdapter {
  static fromBackend(data: any): SalidaInventario {
    return {
      id: data.id_salida,
      fecha: data.fecha_salida,
      usuarioId: data.usuario_id,
      tipoSalidaId: data.tipo_salida?.id_tipo_salida,
      tipoSalida: data.tipo_salida
        ? TipoSalidaAdapter.fromBackend(data.tipo_salida)
        : undefined,
      detalles:
        data.detalles?.map((d: any) => ({
          id: d.id_detalle_salida,
          productoId: d.producto?.id_producto,
          producto: d.producto
            ? ProductoAdapter.fromBackend(d.producto)
            : undefined,
          cantidad: Number(d.cantidad_salida),
          animalId: d.animal?.id_animal,
          habitatId: d.habitat?.id_habitat,
        })) || [],
    };
  }

  static toCreate(data: CreateSalidaRequest): any {
    return {
      tipo_salida: data.tipoSalidaId,
      detalles: data.detalles.map((d) => ({
        producto_id: d.productoId,
        cantidad_salida: d.cantidad,
        animal_id: d.animalId,
        habitat_id: d.habitatId,
      })),
    };
  }
}
