import { PaginatedResponse } from "@models/common";

export interface Procedimiento {
  id: number;
  nombre: string;
  descripcion: string;
  fechaProgramada: Date;
  estado: string;
}

export interface ProcedimientoForm {
  nombre: string;
  descripcion: string;
  fechaProgramada: Date | string;
  estado?: string;
}

export interface ProcedimientoResponse {
  id_procedimiento: number;
  nombre: string;
  descripcion: string;
  fecha_programada: string;
  estado: string;
}

export interface ProcedimientoListResponse extends Omit<
  PaginatedResponse<any>,
  "items"
> {
  items: ProcedimientoResponse[];
}
