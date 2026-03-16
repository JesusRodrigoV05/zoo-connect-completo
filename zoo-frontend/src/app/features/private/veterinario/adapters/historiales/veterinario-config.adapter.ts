import {
  TipoAtencion,
  TipoAtencionResponse,
  TipoExamen,
  TipoExamenResponse,
} from "../../models/historiales/veterinario-config.model";

export const TipoAtencionAdapter = {
  toDomain: (data: TipoAtencionResponse): TipoAtencion => ({
    id: data.id_tipo_atencion,
    nombre: data.nombre_tipo_atencion,
    descripcion: data.descripcion,
    activo: data.is_active,
  }),

  toCreatePayload: (data: Omit<TipoAtencion, "id" | "activo">) => ({
    nombre_tipo_atencion: data.nombre,
    descripcion: data.descripcion,
  }),

  toUpdatePayload: (data: Partial<TipoAtencion>) => ({
    nombre_tipo_atencion: data.nombre,
    descripcion: data.descripcion,
    is_active: data.activo,
  }),
};

export const TipoExamenAdapter = {
  toDomain: (data: TipoExamenResponse): TipoExamen => ({
    id: data.id_tipo_examen,
    nombre: data.nombre_tipo_examen,
    descripcion: data.descripcion,
    activo: data.is_active,
  }),

  toCreatePayload: (data: Omit<TipoExamen, "id" | "activo">) => ({
    nombre_tipo_examen: data.nombre,
    descripcion: data.descripcion,
  }),

  toUpdatePayload: (data: Partial<TipoExamen>) => ({
    nombre_tipo_examen: data.nombre,
    descripcion: data.descripcion,
    is_active: data.activo,
  }),
};
