import { AnimalAdapter, EspecieAdapter } from "@adapters/animales";
import {
  ProductoAdapter,
  UnidadMedidaAdapter,
} from "../../admin/adapters/producto.adapter";
import { CreateDietaRequest, Dieta } from "../models/alimentacion.model";

export class DietaAdapter {
  static fromBackend(data: any): Dieta {
    return {
      id: data.id_dieta,
      nombre: data.nombre_dieta,

      animalId: data.animal_id,
      animal: data.animal ? AnimalAdapter.fromBackend(data.animal) : undefined,

      especieId: data.especie_id,
      especie: data.especie ? EspecieAdapter.fromApi(data.especie) : undefined,

      detalles:
        data.detalles_dieta?.map((d: any) => ({
          id: d.id_detalle_dieta,

          productoId: d.producto_id,
          producto: d.producto
            ? ProductoAdapter.fromBackend(d.producto)
            : undefined,

          unidadMedidaId: d.unidad_medida_id,
          unidadMedida: d.unidad_medida
            ? UnidadMedidaAdapter.fromBackend(d.unidad_medida)
            : undefined,

          cantidad: Number(d.cantidad),
          frecuencia: d.frecuencia,
        })) || [],

      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static toCreate(data: CreateDietaRequest): any {
    return {
      nombre_dieta: data.nombre,
      animal_id: data.animalId,
      especie_id: data.especieId,
      detalles: data.detalles.map((d) => ({
        producto_id: d.productoId,
        unidad_medida_id: d.unidadMedidaId,
        cantidad: d.cantidad,
        frecuencia: d.frecuencia,
      })),
    };
  }
}
