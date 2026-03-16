import {
  OrdenExamen,
  OrdenExamenForm,
  OrdenResponse,
  ResultadoExamen,
  ResultadoResponse,
  ResultadoUploadForm,
} from "../../models/historiales/examenes.model";

export const ExamenAdapter = {
  toDomainResultado: (data: ResultadoResponse): ResultadoExamen => ({
    id: data.id_resultado,
    fecha: new Date(data.fecha_resultado),
    conclusiones: data.conclusiones,
    archivoUrl: data.archivo_url,
  }),

  toDomainOrden: (data: OrdenResponse): OrdenExamen => ({
    id: data.id_orden,
    instrucciones: data.instrucciones,
    estado: data.estado,
    fechaCreacion: new Date(data.created_at),

    tipoExamen: {
      id: data.tipo_examen?.id_tipo_examen || 0,
      nombre: data.tipo_examen?.nombre_tipo_examen || "Desconocido",
      descripcion: data.tipo_examen?.descripcion || "",
    },

    resultados: (data.resultados || []).map((r) =>
      ExamenAdapter.toDomainResultado(r),
    ),
  }),

  toCreateOrdenPayload: (data: OrdenExamenForm) => ({
    instrucciones: data.instrucciones,
    tipo_examen_id: data.tipoExamenId,
  }),

  toUploadPayload: (data: ResultadoUploadForm): FormData => {
    const formData = new FormData();
    formData.append("conclusiones", data.conclusiones);
    formData.append("file", data.archivo);
    return formData;
  },
};
