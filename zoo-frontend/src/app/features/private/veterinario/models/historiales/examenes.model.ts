import { PaginatedResponse } from "@models/common";

export interface ResultadoExamen {
  id: number;
  fecha: Date;
  conclusiones: string;
  archivoUrl: string;
}

export interface OrdenExamen {
  id: number;
  instrucciones: string;
  estado: string;
  fechaCreacion: Date;

  tipoExamen: {
    id: number;
    nombre: string;
    descripcion: string;
  };

  resultados: ResultadoExamen[];
}

export interface OrdenExamenForm {
  instrucciones: string;
  tipoExamenId: number;
}

export interface ResultadoUploadForm {
  conclusiones: string;
  archivo: File;
}

export interface ResultadoResponse {
  id_resultado: number;
  fecha_resultado: string;
  conclusiones: string;
  archivo_url: string;
}

export interface OrdenResponse {
  id_orden: number;
  instrucciones: string;
  estado: string;
  created_at: string;
  tipo_examen?: {
    id_tipo_examen: number;
    nombre_tipo_examen: string;
    descripcion: string;
  };
  resultados?: ResultadoResponse[];
}

export interface OrdenListResponse extends Omit<
  PaginatedResponse<any>,
  "items"
> {
  items: OrdenResponse[];
}
