export interface OptionStat {
  id: string;
  label: string;
  count: number;
}

export interface QuestionStat {
  id: string;
  text: string;
  options: OptionStat[];
  hasData: boolean;
}

export interface SurveyStats {
  totalParticipations: number;
  questions: QuestionStat[];
}

export interface BackendOptionStat {
  texto_opcion: string | null;
  conteo_respuestas: number;
}

export interface BackendQuestionStat {
  texto_pregunta: string;
  opciones: Record<string, BackendOptionStat>;
}

export interface BackendStatsResponse {
  total_participaciones: number;
  estadisticas_preguntas: Record<string, BackendQuestionStat>;
}
