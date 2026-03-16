import {
  CreateParticipacion,
  CreateTrivia,
  DificultadTrivia,
  ParticipacionTrivia,
  Trivia,
} from "@models/quiz";

export interface TriviaApiResponse {
  id_trivia: number;
  fecha_trivia: string;
  cantidad_preguntas: number;
  dificultad: string;
  usuario_id: number;
}

export interface CreateTriviaRequest {
  fecha_trivia: string;
  cantidad_preguntas: number;
  dificultad: string;
}

export type UpdateTriviaRequest = Partial<CreateTriviaRequest>;

export interface ParticipacionApiResponse {
  id_participacion_trivia: number;
  usuario_id: number;
  aciertos: number;
  fecha_trivia: string;
  trivia_id: number;
}

export interface ParticiparTriviaRequest {
  trivia_id: number;
  aciertos: number;
}

export class TriviaAdapter {
  static fromApi(apiResponse: TriviaApiResponse): Trivia {
    return {
      id: apiResponse.id_trivia,
      fecha: apiResponse.fecha_trivia,
      cantidadPreguntas: apiResponse.cantidad_preguntas,
      dificultad: apiResponse.dificultad as DificultadTrivia,
      usuarioId: apiResponse.usuario_id,
    };
  }

  static fromApiArray(apiResponses: TriviaApiResponse[]): Trivia[] {
    return apiResponses.map((response) => this.fromApi(response));
  }

  static toCreateRequest(trivia: CreateTrivia): CreateTriviaRequest {
    return {
      fecha_trivia: trivia.fecha,
      cantidad_preguntas: trivia.cantidadPreguntas,
      dificultad: trivia.dificultad,
    };
  }

  static toUpdateRequest(trivia: Partial<CreateTrivia>): UpdateTriviaRequest {
    const request: UpdateTriviaRequest = {};

    if (trivia.fecha !== undefined) {
      request.fecha_trivia = trivia.fecha;
    }
    if (trivia.cantidadPreguntas !== undefined) {
      request.cantidad_preguntas = trivia.cantidadPreguntas;
    }
    if (trivia.dificultad !== undefined) {
      request.dificultad = trivia.dificultad;
    }

    return request;
  }
}

export class ParticipacionAdapter {
  static fromApi(apiResponse: ParticipacionApiResponse): ParticipacionTrivia {
    return {
      id: apiResponse.id_participacion_trivia,
      usuarioId: apiResponse.usuario_id,
      aciertos: apiResponse.aciertos,
      fecha: apiResponse.fecha_trivia,
      triviaId: apiResponse.trivia_id,
    };
  }

  static fromApiArray(
    apiResponses: ParticipacionApiResponse[],
  ): ParticipacionTrivia[] {
    return apiResponses.map((response) => this.fromApi(response));
  }

  static toCreateRequest(
    participacion: CreateParticipacion,
  ): ParticiparTriviaRequest {
    return {
      trivia_id: participacion.triviaId,
      aciertos: participacion.aciertos,
    };
  }
}
