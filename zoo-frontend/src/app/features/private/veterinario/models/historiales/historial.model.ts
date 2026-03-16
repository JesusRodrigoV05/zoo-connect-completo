import { PaginatedResponse } from "@models/common";
import { TipoAtencion, TipoAtencionResponse } from "./veterinario-config.model";

export interface Historial {
  id: number;
  anamnesis: string;
  peso: number;
  temperatura: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  examenFisico: string;
  diagnosticoPresuntivo: string;
  diagnosticoDefinitivo: string;
  fechaAtencion: Date;
  abierto: boolean;

  veterinario?: { id: number; nombre: string; email: string };
  animal?: { id: number; nombre: string; especie: string; foto?: string };
  tipoAtencion?: TipoAtencion;

  recetas: any[];
  ordenesExamen: any[];
  procedimientos: any[];
}

export interface HistorialForm {
  anamnesis: string;
  peso: number;
  temperatura: number;
  frecuenciaCardiaca: number;
  frecuenciaRespiratoria: number;
  examenFisico: string;
  diagnosticoPresuntivo: string;
  diagnosticoDefinitivo: string;
  animalId: number;
  tipoAtencionId: number;
  abierto: boolean;
}

export interface HistorialResponse {
  id_historial: number;
  anamnesis: string;
  peso_actual: number | string;
  temperatura: number | string;
  frecuencia_cardiaca: number;
  frecuencia_respiratoria: number;
  examen_fisico_obs: string;
  diagnostico_presuntivo: string;
  diagnostico_definitivo: string;
  fecha_atencion: string;
  estado: boolean;

  veterinario?: { id: number; username: string; email: string };
  animal?: {
    id_animal: number;
    nombre_animal: string;
    especie?: { nombre_especie: string };
  };
  tipo_atencion?: TipoAtencionResponse;

  recetas?: any[];
  ordenes_examen?: any[];
  procedimientos?: any[];
}

export interface HistorialListResponse extends Omit<
  PaginatedResponse<any>,
  "items"
> {
  items: HistorialResponse[];
}
