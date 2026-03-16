import {
  BackendStatsResponse,
  QuestionStat,
  SurveyStats,
} from "@models/encuestas";

export const surveyStatsAdapter = (
  backend: BackendStatsResponse,
): SurveyStats => {
  const questions: QuestionStat[] = Object.entries(
    backend.estadisticas_preguntas,
  )
    .map(([qId, qData]) => {
      const options = Object.entries(qData.opciones)
        .map(([optId, optData]) => ({
          id: optId,
          label: optData.texto_opcion || "Sin respuesta",
          count: optData.conteo_respuestas,
          originalText: optData.texto_opcion,
        }))
        .filter((opt) => opt.originalText !== null);

      return {
        id: qId,
        text: qData.texto_pregunta,
        options: options,
        hasData: options.length > 0,
      };
    })
    .filter((q) => q.hasData);

  return {
    totalParticipations: backend.total_participaciones,
    questions,
  };
};
