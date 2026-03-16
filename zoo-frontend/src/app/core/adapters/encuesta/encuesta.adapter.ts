import { Encuesta, Pregunta, OpcionPregunta } from "../../models/encuestas/encuesta.model";

export class EncuestaAdapter {
  private static mapOpcionesFromBackend(backendOptions: BackendOpcion[]): OpcionPregunta[] {
    return backendOptions.map(opcion => ({
      idOpcion: opcion.id_opcion,
      textoOpcion: opcion.texto_opcion,
      orden: opcion.orden
    }));
  }

  private static mapPreguntasFromBackend(backendQuestions: BackendPregunta[]): Pregunta[] {
    return backendQuestions.map(pregunta => ({
      idPregunta: pregunta.id_pregunta,
      textoPregunta: pregunta.texto_pregunta,
      esOpcionUnica: pregunta.es_opcion_unica,
      orden: pregunta.orden,
      opciones: this.mapOpcionesFromBackend(pregunta.opciones || [])
    }));
  }

  static fromBackend(backendSurvey: BackendEncuestaResponse): Encuesta {
    return {
      idEncuesta: backendSurvey.id_encuesta,
      titulo: backendSurvey.titulo,
      descripcion: backendSurvey.descripcion,
      fechaInicio: backendSurvey.fecha_inicio,
      fechaFin: backendSurvey.fecha_fin,
      isActive: backendSurvey.is_active,
      preguntas: this.mapPreguntasFromBackend(backendSurvey.preguntas || [])
    };
  }
}

export interface BackendOpcion {
  id_opcion: number;
  texto_opcion: string;
  orden: number;
}

export interface BackendPregunta {
  id_pregunta: number;
  texto_pregunta: string;
  es_opcion_unica: boolean;
  orden: number;
  opciones?: BackendOpcion[];
}

export interface BackendEncuestaResponse {
  id_encuesta: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  is_active: boolean;
  preguntas?: BackendPregunta[];
}