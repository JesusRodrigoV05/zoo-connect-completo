import {
  Receta,
  RecetaForm,
  RecetaResponse,
} from "../../models/historiales/receta.model";

export const RecetaAdapter = {
  toDomain: (data: RecetaResponse): Receta => ({
    id: data.id_receta,
    dosis: Number(data.dosis) || 0,
    frecuencia: data.frecuencia,
    duracionDias: data.duracion_dias,
    instrucciones: data.instrucciones_administracion,

    generaTarea: data.generar_tarea_automatica,
    cron: data.frecuencia_cron,
    usuarioAsignadoId: data.usuario_asignado_id,
    usuarioAsignadoNombre: data.usuario_asignado?.username,

    producto: {
      id: data.producto?.id_producto || 0,
      nombre: data.producto?.nombre_producto || "Desconocido",
      stockActual: Number(data.producto?.stock_actual) || 0,
      unidadMedida: data.producto?.unidad_medida?.abreviatura || "",
    },

    unidadMedida: {
      id: data.unidad_medida?.id_unidad || 0,
      nombre: data.unidad_medida?.nombre_unidad || "",
      abreviatura: data.unidad_medida?.abreviatura || "",
    },

    fechaCreacion: new Date(data.created_at),
  }),

  toCreatePayload: (data: RecetaForm) => ({
    dosis: data.dosis,
    frecuencia: data.frecuencia,
    duracion_dias: data.duracionDias,
    instrucciones_administracion: data.instrucciones,

    generar_tarea_automatica: data.generarTarea,
    frecuencia_cron: data.frecuenciaCron || "",
    usuario_asignado_id: data.usuarioAsignadoId || null,

    producto_id: data.productoId,
    unidad_medida_id: data.unidadMedidaId,
  }),
};
