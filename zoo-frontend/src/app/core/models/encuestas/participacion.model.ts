import { Respuesta } from "./respuesta.model";

export interface Participacion {
  idParticipacion: number;
  encuestaId: number;
  usuarioId: string;
  fechaParticipacion: string;
  completada: boolean;
  respuestas: Respuesta[];
}
