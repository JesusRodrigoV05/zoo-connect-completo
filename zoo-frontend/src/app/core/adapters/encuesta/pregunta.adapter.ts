import { CreatePregunta, Pregunta, UpdatePregunta } from "@models/encuestas";
import { BackendPregunta } from "./encuesta.adapter";
import { BackendCreateOpcionRequest, OpcionAdapter } from "./opcion.adapter";

export interface BackendCreatePreguntaRequest {
  texto_pregunta: string;
  es_opcion_unica: boolean;
  orden: number;
  opciones: BackendCreateOpcionRequest[];
}

export interface BackendUpdatePreguntaRequest {
  texto_pregunta?: string;
  es_opcion_unica?: boolean;
  orden?: number;
}

export class PreguntaAdapter {
  static fromBackend(backendData: BackendPregunta): Pregunta {
    return {
      idPregunta: backendData.id_pregunta,
      textoPregunta: backendData.texto_pregunta,
      esOpcionUnica: backendData.es_opcion_unica,
      orden: backendData.orden,
      opciones: (backendData.opciones || []).map(OpcionAdapter.fromBackend),
    };
  }

  static toBackendCreate(data: CreatePregunta): BackendCreatePreguntaRequest {
    return {
      texto_pregunta: data.textoPregunta,
      es_opcion_unica: data.esOpcionUnica,
      orden: data.orden,
      opciones: data.opciones.map(OpcionAdapter.toBackendCreate),
    };
  }

  static toBackendUpdate(data: UpdatePregunta): BackendUpdatePreguntaRequest {
    const payload: BackendUpdatePreguntaRequest = {};
    if (data.textoPregunta !== undefined) {
      payload.texto_pregunta = data.textoPregunta;
    }
    if (data.esOpcionUnica !== undefined) {
      payload.es_opcion_unica = data.esOpcionUnica;
    }
    if (data.orden !== undefined) {
      payload.orden = data.orden;
    }
    return payload;
  }
}
