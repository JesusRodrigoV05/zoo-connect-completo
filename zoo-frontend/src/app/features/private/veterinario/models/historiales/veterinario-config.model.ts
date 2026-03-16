export interface TipoAtencion {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface TipoExamen {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface TipoAtencionResponse {
  id_tipo_atencion: number;
  nombre_tipo_atencion: string;
  descripcion: string;
  is_active: boolean;
}

export interface TipoExamenResponse {
  id_tipo_examen: number;
  nombre_tipo_examen: string;
  descripcion: string;
  is_active: boolean;
}
