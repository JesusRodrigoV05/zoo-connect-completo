import { CreateRespuesta, Respuesta } from "@models/encuestas/respuesta.model";

export interface BackendRespuestaResponse {
  id_respuesta: number;
  pregunta_id: number;
  opcion_id: number | null;
  respuesta_texto: string;
  participacion_id: number;
}

export interface BackendCreateRespuestaRequest {
  pregunta_id: number;
  opcion_id: number | null;
  participacion_id: number;
  respuesta_texto: string | null;
}

export class RespuestaAdapter {
  static fromBackend(backendData: BackendRespuestaResponse): Respuesta {
    return {
      id: backendData.id_respuesta,
      preguntaId: backendData.pregunta_id,
      opcionId: backendData.opcion_id,
      respuestaTexto: backendData.respuesta_texto,
      participacionId: backendData.participacion_id,
    };
  }

  static toBackendCreate(dto: CreateRespuesta): BackendCreateRespuestaRequest {
    return {
      pregunta_id: dto.preguntaId,
      opcion_id: dto.opcionId,
      participacion_id: dto.participacionId,
      respuesta_texto: dto.respuestaTexto,
    };
  }
}
