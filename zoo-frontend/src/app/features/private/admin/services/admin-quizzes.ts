import {
  ParticipacionAdapter,
  ParticipacionApiResponse,
  TriviaAdapter,
  TriviaApiResponse,
} from "@adapters/quiz";
import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import {
  CreateParticipacion,
  CreateTrivia,
  ParticipacionTrivia,
  Trivia,
} from "@models/quiz";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminQuizzes {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly triviaUrl = `${this.apiUrl}/trivia`;

  getAllTrivias(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Trivia>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http
      .get<PaginatedResponse<TriviaApiResponse>>(this.triviaUrl, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(TriviaAdapter.fromApi),
        })),
        catchError(() =>
          throwError(() => new Error("Error al obtener trivias")),
        ),
      );

    /* // Si NO es paginado y solo devuelve un array:
      return this.http.get<TriviaApiResponse[]>(this.triviaUrl).pipe(
        map(TriviaAdapter.fromApiArray),
        catchError(() => throwError(() => new Error("Error al obtener trivias"))),
      );
      */
  }

  getTriviaById(triviaId: number): Observable<Trivia> {
    return this.http
      .get<TriviaApiResponse>(`${this.triviaUrl}/${triviaId}`)
      .pipe(
        map(TriviaAdapter.fromApi),
        catchError(() =>
          throwError(() => new Error("Error al obtener la trivia")),
        ),
      );
  }

  createTrivia(triviaData: CreateTrivia): Observable<Trivia> {
    const request = TriviaAdapter.toCreateRequest(triviaData);
    return this.http.post<TriviaApiResponse>(this.triviaUrl, request).pipe(
      map(TriviaAdapter.fromApi),
      catchError(() => throwError(() => new Error("Error al crear la trivia"))),
    );
  }
  updateTrivia(
    triviaId: number,
    triviaData: Partial<CreateTrivia>,
  ): Observable<Trivia> {
    const request = TriviaAdapter.toUpdateRequest(triviaData);
    return this.http
      .put<TriviaApiResponse>(`${this.triviaUrl}/${triviaId}`, request)
      .pipe(
        map(TriviaAdapter.fromApi),
        catchError(() =>
          throwError(() => new Error("Error al actualizar la trivia")),
        ),
      );
  }

  deleteTrivia(triviaId: number): Observable<void> {
    return this.http.delete<void>(`${this.triviaUrl}/${triviaId}`).pipe(
      catchError((error) => {
        return throwError(() => new Error("Error al eliminar la trivia"));
      }),
    );
  }
  participarTrivia(data: CreateParticipacion): Observable<ParticipacionTrivia> {
    const request = ParticipacionAdapter.toCreateRequest(data);
    return this.http
      .post<ParticipacionApiResponse>(`${this.triviaUrl}/participar`, request)
      .pipe(
        map(ParticipacionAdapter.fromApi),
        catchError(() =>
          throwError(() => new Error("Error al registrar participación")),
        ),
      );
  }

  getParticipaciones(
    triviaId: number,
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<ParticipacionTrivia>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http
      .get<
        PaginatedResponse<ParticipacionApiResponse>
      >(`${this.triviaUrl}/${triviaId}/participaciones`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(ParticipacionAdapter.fromApi),
        })),
        catchError(() =>
          throwError(() => new Error("Error al obtener participaciones")),
        ),
      );

    /* // Si NO es paginado y solo devuelve un array:
      return this.http.get<ParticipacionApiResponse[]>(`${this.triviaUrl}/${triviaId}/participaciones`).pipe(
        map(ParticipacionAdapter.fromApiArray),
        catchError(() => throwError(() => new Error("Error al obtener participaciones"))),
      );
      */
  }
}
