import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TareaAdapter } from "@app/features/private/admin/adapters/tareas.adapter";
import {
  CompletarTareaAlimentacion,
  CompletarTareaSimple,
  SugerenciaDietaResponse,
  Tarea,
} from "@app/features/private/admin/models/tareas/tarea.model";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class EjecucionTareas {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tareas`;
  private readonly alimentacionUrl = `${environment.apiUrl}/alimentacion`;

  getMyTasks(
    page = 1,
    size = 20,
    isCompleted = false,
  ): Observable<PaginatedResponse<Tarea>> {
    const params = new HttpParams()
      .set("page", page)
      .set("size", size)
      .set("is_completed", isCompleted);

    return this.http.get<any>(`${this.apiUrl}/mis-tareas`, { params }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i: any) => TareaAdapter.fromBackend(i)),
      })),
    );
  }

  completeSimpleTask(
    id: number,
    data: CompletarTareaSimple,
  ): Observable<Tarea> {
    const payload = TareaAdapter.toCompletarSimple(data);
    return this.http
      .post<any>(`${this.apiUrl}/${id}/completar-simple`, payload)
      .pipe(map((item) => TareaAdapter.fromBackend(item)));
  }

  completeFeedingTask(
    id: number,
    data: CompletarTareaAlimentacion,
  ): Observable<any> {
    const payload = TareaAdapter.toCompletarAlimentacion(data);
    return this.http.post<any>(
      `${this.apiUrl}/${id}/completar-alimentacion`,
      payload,
    );
  }

  getSugerenciaDieta(idTarea: number): Observable<SugerenciaDietaResponse> {
    return this.http.get<SugerenciaDietaResponse>(
      `${this.alimentacionUrl}/${idTarea}/sugerencia-dieta`,
    );
  }
}
