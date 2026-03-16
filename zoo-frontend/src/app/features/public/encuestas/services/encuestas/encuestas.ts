import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { Observable, map } from "rxjs";
import {
  EncuestaAdapter,
  BackendEncuestaResponse,
  surveyStatsAdapter,
} from "@adapters/encuesta";
import { BackendStatsResponse, Encuesta } from "@models/encuestas";
import { Participacion } from "@models/encuestas/participacion.model";
import {
  BackendParticipacionResponse,
  ParticipacionAdapter,
} from "@adapters/encuesta/participacion.adapter";
import { CreateRespuesta, Respuesta } from "@models/encuestas/respuesta.model";
import {
  BackendRespuestaResponse,
  RespuestaAdapter,
} from "@adapters/encuesta/respuesta.adapter";

@Injectable({
  providedIn: "root",
})
export class EncuestaService {
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;
  private surveysUrl = `${this.apiUrl}/surveys`;
  private encuestasUrl = `${this.surveysUrl}/surveys`;

  private participationsUrl = `${this.surveysUrl}/participations`;
  private responsesUrl = `${this.surveysUrl}/responses`;

  getSurveys(skip: number = 0, limit: number = 10): Observable<Encuesta[]> {
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

  getSurveyById(surveyId: string | number): Observable<Encuesta> {
    return this.http
      .get<BackendEncuestaResponse>(`${this.encuestasUrl}/${surveyId}`)
      .pipe(map((survey) => EncuestaAdapter.fromBackend(survey)));
  }

  getStatsBySurveyId(surveyId: string | number) {
    return this.http
      .get<BackendStatsResponse>(`${this.encuestasUrl}/${surveyId}/stats`)
      .pipe(map((response) => surveyStatsAdapter(response)));
  }

  createParticipation(encuestaId: number): Observable<Participacion> {
    const body = ParticipacionAdapter.toBackendCreate(encuestaId);
    return this.http
      .post<BackendParticipacionResponse>(this.participationsUrl, body)
      .pipe(map(ParticipacionAdapter.fromBackend));
  }

  listUserParticipations(): Observable<Participacion[]> {
    return this.http
      .get<BackendParticipacionResponse[]>(this.participationsUrl)
      .pipe(
        map((participations) =>
          participations.map(ParticipacionAdapter.fromBackend),
        ),
      );
  }

  getParticipationById(participacionId: number): Observable<Participacion> {
    return this.http
      .get<BackendParticipacionResponse>(
        `${this.participationsUrl}/${participacionId}`,
      )
      .pipe(map(ParticipacionAdapter.fromBackend));
  }

  updateParticipationStatus(
    participacionId: number,
    completada: boolean,
  ): Observable<Participacion> {
    const body = { completada };
    return this.http
      .put<BackendParticipacionResponse>(
        `${this.participationsUrl}/${participacionId}`,
        body,
      )
      .pipe(map(ParticipacionAdapter.fromBackend));
  }

  submitResponse(respuestaData: CreateRespuesta): Observable<Respuesta> {
    const body = RespuestaAdapter.toBackendCreate(respuestaData);
    return this.http
      .post<BackendRespuestaResponse>(this.responsesUrl, body)
      .pipe(map(RespuestaAdapter.fromBackend));
  }

  public getUserParticipationCount(): Observable<number> {
    return this.http
      .get<BackendParticipacionResponse[]>(this.participationsUrl)
      .pipe(map((participations) => participations.length));
  }
}
