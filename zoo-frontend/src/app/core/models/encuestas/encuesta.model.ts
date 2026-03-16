export interface OpcionPregunta {
  idOpcion: number;
  textoOpcion: string;
  orden: number;
}

export interface Pregunta {
  idPregunta: number;
  textoPregunta: string;
  esOpcionUnica: boolean;
  orden: number;
  opciones: OpcionPregunta[];
}

export interface Encuesta {
  idEncuesta: number;
  titulo: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  isActive: boolean;
  preguntas: Pregunta[];
}

export type CreateOpcion = Omit<OpcionPregunta, "idOpcion">;

export type UpdateOpcion = Partial<CreateOpcion>;

export type CreatePregunta = Omit<Pregunta, "idPregunta" | "opciones"> & {
  opciones: CreateOpcion[];
};

export type UpdatePregunta = Partial<Omit<Pregunta, "idPregunta" | "opciones">>;
