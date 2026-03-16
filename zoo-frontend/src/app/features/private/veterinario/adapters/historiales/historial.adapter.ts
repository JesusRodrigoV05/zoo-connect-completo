import {
  Historial,
  HistorialForm,
  HistorialResponse,
} from "../../models/historiales/historial.model";
import { ExamenAdapter } from "./examenes.adapter";
import { ProcedimientoAdapter } from "./procedimiento.adapter";
import { RecetaAdapter } from "./receta.adapter";
import { TipoAtencionAdapter } from "./veterinario-config.adapter";

export const HistorialAdapter = {
  toDomain: (data: HistorialResponse): Historial => ({
    id: data.id_historial,
    anamnesis: data.anamnesis,
    peso: Number(data.peso_actual) || 0,
    temperatura: Number(data.temperatura) || 0,
    frecuenciaCardiaca: data.frecuencia_cardiaca,
    frecuenciaRespiratoria: data.frecuencia_respiratoria,
    examenFisico: data.examen_fisico_obs,
    diagnosticoPresuntivo: data.diagnostico_presuntivo,
    diagnosticoDefinitivo: data.diagnostico_definitivo,
    fechaAtencion: new Date(data.fecha_atencion),
    abierto: data.estado,

    tipoAtencion: data.tipo_atencion
      ? TipoAtencionAdapter.toDomain(data.tipo_atencion)
      : undefined,

    veterinario: data.veterinario
      ? {
          id: data.veterinario.id,
          nombre: data.veterinario.username,
          email: data.veterinario.email,
        }
      : undefined,

    animal: data.animal
      ? {
          id: data.animal.id_animal,
          nombre: data.animal.nombre_animal,
          especie: data.animal.especie?.nombre_especie || "Desconocida",
        }
      : undefined,

    recetas: (data.recetas || []).map((r) => RecetaAdapter.toDomain(r)),

    ordenesExamen: (data.ordenes_examen || []).map((o) =>
      ExamenAdapter.toDomainOrden(o),
    ),

    procedimientos: (data.procedimientos || []).map((p) =>
      ProcedimientoAdapter.toDomain(p),
    ),
  }),

  toCreatePayload: (data: HistorialForm) => ({
    anamnesis: data.anamnesis,
    peso_actual: data.peso,
    temperatura: data.temperatura,
    frecuencia_cardiaca: data.frecuenciaCardiaca,
    frecuencia_respiratoria: data.frecuenciaRespiratoria,
    examen_fisico_obs: data.examenFisico,
    diagnostico_presuntivo: data.diagnosticoPresuntivo,
    diagnostico_definitivo: data.diagnosticoDefinitivo,
    animal_id: data.animalId,
    tipo_atencion_id: data.tipoAtencionId,
  }),

  toUpdatePayload: (data: Partial<HistorialForm>) => ({
    anamnesis: data.anamnesis,
    peso_actual: data.peso,
    temperatura: data.temperatura,
    frecuencia_cardiaca: data.frecuenciaCardiaca,
    frecuencia_respiratoria: data.frecuenciaRespiratoria,
    examen_fisico_obs: data.examenFisico,
    diagnostico_presuntivo: data.diagnosticoPresuntivo,
    diagnostico_definitivo: data.diagnosticoDefinitivo,
    tipo_atencion_id: data.tipoAtencionId,
    estado: data.abierto,
  }),
};
