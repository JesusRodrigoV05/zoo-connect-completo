import {
  BackendEncuestaResponse,
  BackendOpcion,
  BackendPregunta,
  EncuestaAdapter,
  surveyStatsAdapter,
} from "@adapters/encuesta";
import { OpcionAdapter } from "@adapters/encuesta/opcion.adapter";
import { PreguntaAdapter } from "@adapters/encuesta/pregunta.adapter";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import {
  CreateOpcion,
  CreatePregunta,
  Encuesta,
  OpcionPregunta,
  Pregunta,
  UpdateOpcion,
  UpdatePregunta,
} from "@app/core/models/encuestas/encuesta.model";
import { environment } from "@env";
import { BackendStatsResponse } from "@models/encuestas";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminEncuestas {
  private readonly http = inject(HttpClient);

  private apiUrl = environment.apiUrl;
  private surveysUrl = `${this.apiUrl}/surveys`;
  private encuestasUrl = `${this.surveysUrl}/surveys`;
  private preguntasUrl = `${this.surveysUrl}/surveys/preguntas`;
  private opcionesUrl = `${this.surveysUrl}/surveys/opciones`;

  createSurvey(surveyData: any) {
    return this.http.post<any>(this.encuestasUrl, surveyData);
  }

  getAllSurveys(skip: number = 0, limit: number = 10): Observable<Encuesta[]> {
    return this.http
      .get<BackendEncuestaResponse[]>(this.encuestasUrl, {
        params: { skip, limit },
      })
      .pipe(
        map((surveys) =>
          surveys.map((survey) => EncuestaAdapter.fromBackend(survey)),
        ),
      );
  }

  getSurveyById(surveyId: string): Observable<Encuesta> {
    return this.http
      .get<BackendEncuestaResponse>(`${this.encuestasUrl}/${surveyId}`)
      .pipe(map((survey) => EncuestaAdapter.fromBackend(survey)));
  }

  getStats(surveyId: string) {
    return this.http
      .get<BackendStatsResponse>(`${this.encuestasUrl}/${surveyId}/stats`)
      .pipe(map((response) => surveyStatsAdapter(response)));
  }

  updateSurvey(id: number, surveyData: any) {
    return this.http.put(`${this.encuestasUrl}/${id}`, surveyData);
  }

  deleteSurvey(id: number): Observable<void> {
    return this.http.delete<void>(`${this.encuestasUrl}/${id}`);
  }

  addPreguntaToSurvey(
    encuestaId: number,
    preguntaData: CreatePregunta,
  ): Observable<Pregunta> {
    const body = PreguntaAdapter.toBackendCreate(preguntaData);
    return this.http
      .post<BackendPregunta>(
        `${this.encuestasUrl}/${encuestaId}/preguntas`,
        body,
      )
      .pipe(map(PreguntaAdapter.fromBackend));
  }

  updatePregunta(
    preguntaId: number,
    preguntaData: UpdatePregunta,
  ): Observable<Pregunta> {
    const body = PreguntaAdapter.toBackendUpdate(preguntaData);
    return this.http
      .put<BackendPregunta>(`${this.preguntasUrl}/${preguntaId}`, body)
      .pipe(map(PreguntaAdapter.fromBackend));
  }

  /**
   * DELETE /zooconnect/surveys/surveys/preguntas/{pregunta_id}
   */
  deletePregunta(preguntaId: number): Observable<void> {
    return this.http.delete<void>(`${this.preguntasUrl}/${preguntaId}`);
  }

  addOpcionToPregunta(
    preguntaId: number,
    opcionData: CreateOpcion,
  ): Observable<OpcionPregunta> {
    const body = OpcionAdapter.toBackendCreate(opcionData);
    return this.http
      .post<BackendOpcion>(`${this.preguntasUrl}/${preguntaId}/opciones`, body)
      .pipe(map(OpcionAdapter.fromBackend));
  }

  updateOpcion(
    opcionId: number,
    opcionData: UpdateOpcion,
  ): Observable<OpcionPregunta> {
    const body = {
      texto_opcion: opcionData.textoOpcion,
      orden: opcionData.orden,
    };
    return this.http
      .put<BackendOpcion>(`${this.opcionesUrl}/${opcionId}`, body)
      .pipe(map(OpcionAdapter.fromBackend));
  }

  deleteOpcion(opcionId: number): Observable<void> {
    return this.http.delete<void>(`${this.opcionesUrl}/${opcionId}`);
  }
}
