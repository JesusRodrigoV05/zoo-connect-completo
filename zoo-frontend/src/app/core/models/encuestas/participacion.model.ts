import { Respuesta } from "./respuesta.model";

export interface Participacion {
  idParticipacion: number;
  encuestaId: number;
  usuarioId: number;
  fechaParticipacion: string;
  completada: boolean;
  respuestas: Respuesta[];
}
