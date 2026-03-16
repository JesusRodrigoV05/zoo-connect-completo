import {
  CreateTriviaRequest,
  ParticipacionAdapter,
  ParticipacionApiResponse,
  ParticiparTriviaRequest,
  TriviaAdapter,
  TriviaApiResponse,
} from "@adapters/quiz";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import {
  CreateParticipacion,
  CreateTrivia,
  ParticipacionTrivia,
  Trivia,
} from "@models/quiz";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class QuizManagement {
  private readonly http = inject(HttpClient);

  private apiUrl = environment.apiUrl;
  readonly quizUrl = `${this.apiUrl}/trivia`;

  getTrivias(): Observable<Trivia[]> {
    return this.http
      .get<TriviaApiResponse[]>(`${this.quizUrl}/`)
      .pipe(map((response) => TriviaAdapter.fromApiArray(response)));
  }

  getTriviaById(id: number): Observable<Trivia> {
    return this.http
      .get<TriviaApiResponse>(`${this.quizUrl}/${id}`)
      .pipe(map((response) => TriviaAdapter.fromApi(response)));
  }

  createTrivia(trivia: CreateTrivia): Observable<Trivia> {
    const payload: CreateTriviaRequest = TriviaAdapter.toCreateRequest(trivia);

    return this.http
      .post<TriviaApiResponse>(`${this.quizUrl}/`, payload)
      .pipe(map((response) => TriviaAdapter.fromApi(response)));
  }

  submitParticipation(
    participation: CreateParticipacion,
  ): Observable<ParticipacionTrivia> {
    const payload: ParticiparTriviaRequest =
      ParticipacionAdapter.toCreateRequest(participation);

    return this.http
      .post<ParticipacionApiResponse>(`${this.quizUrl}/participar`, payload)
      .pipe(map((response) => ParticipacionAdapter.fromApi(response)));
  }

  getTriviaParticipations(triviaId: number): Observable<ParticipacionTrivia[]> {
    return this.http
      .get<
        ParticipacionApiResponse[]
      >(`${this.quizUrl}/${triviaId}/participaciones`)
      .pipe(map((response) => ParticipacionAdapter.fromApiArray(response)));
  }
}
