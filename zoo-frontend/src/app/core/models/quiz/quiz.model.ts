export enum DificultadTrivia {
  FACIL = "Fácil",
  MEDIO = "Medio",
  DIFICIL = "Difícil",
}

export interface Trivia {
  id: number;
  fecha: string;
  cantidadPreguntas: number;
  dificultad: DificultadTrivia | string;
  usuarioId: number;
}

export type CreateTrivia = Omit<Trivia, "id" | "usuarioId">;

export interface ParticipacionTrivia {
  id: number;
  usuarioId: number;
  aciertos: number;
  fecha: string;
  triviaId: number;
}

export type CreateParticipacion = Pick<
  ParticipacionTrivia,
  "triviaId" | "aciertos"
>;

export interface GeneratedQuestion {
  id?: number;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: string;
  explicacion: string;
}

export interface GeneratedQuiz {
  titulo: string;
  dificultad: string;
  tema: string;
  preguntas: GeneratedQuestion[];
}
