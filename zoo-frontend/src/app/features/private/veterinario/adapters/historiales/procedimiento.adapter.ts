import {
  Procedimiento,
  ProcedimientoForm,
  ProcedimientoResponse,
} from "../../models/historiales/procedimiento.model";

export const ProcedimientoAdapter = {
  toDomain: (data: ProcedimientoResponse): Procedimiento => ({
    id: data.id_procedimiento,
    nombre: data.nombre,
    descripcion: data.descripcion,
    fechaProgramada: new Date(data.fecha_programada),
    estado: data.estado,
  }),

  toCreatePayload: (data: ProcedimientoForm) => ({
    nombre: data.nombre,
    descripcion: data.descripcion,
    fecha_programada:
      data.fechaProgramada instanceof Date
        ? data.fechaProgramada.toISOString()
        : data.fechaProgramada,
  }),

  toUpdatePayload: (data: Partial<ProcedimientoForm>) => ({
    nombre: data.nombre,
    descripcion: data.descripcion,
    fecha_programada:
      data.fechaProgramada instanceof Date
        ? data.fechaProgramada.toISOString()
        : data.fechaProgramada,
    estado: data.estado,
  }),
};
