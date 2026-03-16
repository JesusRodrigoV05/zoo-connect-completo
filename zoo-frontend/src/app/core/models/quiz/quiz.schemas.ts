import { z } from "zod";

export const QuizSchema = z.object({
  titulo: z.string(),
  dificultad: z.string(),
  tema: z.string(),
  preguntas: z.array(
    z.object({
      id: z.number().optional(),
      pregunta: z.string(),
      opciones: z.array(z.string()),
      respuestaCorrecta: z.string(),
      explicacion: z.string(),
    }),
  ),
});

export const QuizJsonSchema = z.toJSONSchema(QuizSchema);
