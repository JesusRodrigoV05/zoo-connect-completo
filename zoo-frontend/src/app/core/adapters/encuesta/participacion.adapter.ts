import { Participacion } from "@models/encuestas/participacion.model";
import {
  BackendRespuestaResponse,
  RespuestaAdapter,
} from "./respuesta.adapter";

export interface BackendParticipacionResponse {
  id_participacion: number;
  encuesta_id: number;
  usuario_id: number;
  fecha_participacion: string;
  completada: boolean;
  respuestas: BackendRespuestaResponse[];
}

export interface BackendCreateParticipacionRequest {
  encuesta_id: number;
}

export class ParticipacionAdapter {
  static fromBackend(backendData: BackendParticipacionResponse): Participacion {
    return {
      idParticipacion: backendData.id_participacion,
      encuestaId: backendData.encuesta_id,
      usuarioId: backendData.usuario_id,
      fechaParticipacion: backendData.fecha_participacion,
      completada: backendData.completada,
      respuestas: backendData.respuestas.map(RespuestaAdapter.fromBackend),
    };
  }

  static toBackendCreate(
    encuestaId: number,
  ): BackendCreateParticipacionRequest {
    return {
      encuesta_id: encuestaId,
    };
  }
}
