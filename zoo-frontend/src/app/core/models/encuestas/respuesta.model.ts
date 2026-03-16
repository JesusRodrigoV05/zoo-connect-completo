export interface Respuesta {
  id: number;
  preguntaId: number;
  opcionId: number | null;
  respuestaTexto: string | null;
  participacionId: number;
}

export type CreateRespuesta = Omit<Respuesta, "id">;
