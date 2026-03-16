import { AnimalAdapter } from "@adapters/animales";
import {
  CompletarTareaAlimentacion,
  CompletarTareaSimple,
  CreateTareaManual,
  CreateTareaRecurrente,
  CreateTipoTarea,
  Tarea,
  TareaRecurrente,
  TipoTarea,
  UpdateTipoTarea,
} from "../models/tareas/tarea.model";
import { HabitatAdapter } from "@adapters/habitat";
import { UsuarioAdapter } from "@adapters/usuario";

export class TipoTareaAdapter {
  static fromBackend(data: any): TipoTarea {
    return {
      id: data.id_tipo_tarea,
      nombre: data.nombre_tipo_tarea,
      descripcion: data.descripcion_tipo_tarea,
      isActive: data.is_active,
    };
  }

  static toCreate(data: CreateTipoTarea): any {
    return {
      nombre_tipo_tarea: data.nombre,
      descripcion_tipo_tarea: data.descripcion,
    };
  }

  static toUpdate(data: UpdateTipoTarea): any {
    return {
      nombre_tipo_tarea: data.nombre,
      descripcion_tipo_tarea: data.descripcion,
      is_active: data.isActive,
    };
  }
}

export class TareaRecurrenteAdapter {
  static fromBackend(data: any): TareaRecurrente {
    return {
      id: data.id_tarea_recurrente,
      titulo: data.titulo_plantilla,
      descripcion: data.descripcion_plantilla,
      tipoTareaId: data.tipo_tarea_id,
      tipoTarea: data.tipo_tarea
        ? TipoTareaAdapter.fromBackend(data.tipo_tarea)
        : undefined,
      frecuenciaCron: data.frecuencia_cron,
      animalId: data.animal_id,
      habitatId: data.habitat_id,
      isActive: data.is_active,
    };
  }

  static toCreate(data: CreateTareaRecurrente): any {
    return {
      titulo_plantilla: data.titulo,
      descripcion_plantilla: data.descripcion,
      tipo_tarea_id: data.tipoTareaId,
      frecuencia_cron: data.frecuenciaCron,
      animal_id: data.animalId || null,
      habitat_id: data.habitatId || null,
      is_active: data.isActive,
    };
  }
}

export class TareaAdapter {
  static fromBackend(data: any): Tarea {
    return {
      id: data.id_tarea,
      titulo: data.titulo,
      descripcion: data.descripcion_tarea,
      fechaProgramada: data.fecha_programada,
      tipoTarea: data.tipo_tarea
        ? TipoTareaAdapter.fromBackend(data.tipo_tarea)
        : undefined,
      usuarioAsignado: data.usuario_asignado
        ? UsuarioAdapter.fromBackend(data.usuario_asignado)
        : undefined,
      animal: data.animal ? AnimalAdapter.fromBackend(data.animal) : undefined,
      habitat: data.habitat
        ? HabitatAdapter.toFrontend(data.habitat)
        : undefined,
      isCompleted: data.is_completed,
      fechaCompletada: data.fecha_completada,
      notasCompletacion: data.notas_completacion,
    };
  }

  static toCreateManual(data: CreateTareaManual): any {
    return {
      titulo: data.titulo,
      descripcion_tarea: data.descripcion,
      fecha_programada: data.fechaProgramada,
      tipo_tarea_id: data.tipoTareaId,
      usuario_asignado_id: data.usuarioAsignadoId || null,
      animal_id: data.animalId || null,
      habitat_id: data.habitatId || null,
    };
  }

  static toCompletarSimple(data: CompletarTareaSimple): any {
    return {
      notas_completacion: data.notasCompletacion,
    };
  }

  static toCompletarAlimentacion(data: CompletarTareaAlimentacion): any {
    return {
      notas_observaciones: data.notasObservaciones,
      detalles: data.detalles.map((d) => ({
        producto_id: d.productoId,
        cantidad_entregada: d.cantidadEntregada,
        cantidad_consumida: d.cantidadConsumida,
      })),
    };
  }
}
