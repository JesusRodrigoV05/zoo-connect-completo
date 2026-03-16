import { PaginatedResponse } from "@models/common";

export interface Receta {
  id: number;
  dosis: number;
  frecuencia: string;
  duracionDias: number;
  instrucciones: string;

  generaTarea: boolean;
  cron?: string;
  usuarioAsignadoId?: number;
  usuarioAsignadoNombre?: string;

  producto: {
    id: number;
    nombre: string;
    stockActual: number;
    unidadMedida: string;
  };

  unidadMedida: {
    id: number;
    nombre: string;
    abreviatura: string;
  };

  fechaCreacion: Date;
}

export interface RecetaForm {
  dosis: number;
  frecuencia: string;
  duracionDias: number;
  instrucciones: string;

  generarTarea: boolean;
  frecuenciaCron?: string;
  usuarioAsignadoId?: number;

  productoId: number;
  unidadMedidaId: number;
}

export interface RecetaResponse {
  id_receta: number;
  dosis: number | string;
  frecuencia: string;
  duracion_dias: number;
  instrucciones_administracion: string;
  generar_tarea_automatica: boolean;
  frecuencia_cron: string;
  usuario_asignado_id: number;
  created_at: string;

  producto?: {
    id_producto: number;
    nombre_producto: string;
    stock_actual: number | string;
    unidad_medida?: { abreviatura: string };
  };
  unidad_medida?: {
    id_unidad: number;
    nombre_unidad: string;
    abreviatura: string;
  };
  usuario_asignado?: {
    id: number;
    username: string;
  };
}

export interface RecetaListResponse extends Omit<
  PaginatedResponse<any>,
  "items"
> {
  items: RecetaResponse[];
}
