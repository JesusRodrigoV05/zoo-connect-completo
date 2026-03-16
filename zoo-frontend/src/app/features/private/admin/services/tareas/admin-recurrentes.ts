import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";
import {
  CreateTareaRecurrente,
  TareaRecurrente,
} from "../../models/tareas/tarea.model";
import { TareaRecurrenteAdapter } from "../../adapters/tareas.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminRecurrentes {
  private http = inject(HttpClient);
  readonly apiUrl = environment.apiUrl;
  private tareasRecurrentesUrl = `${this.apiUrl}/tareas/recurrentes`;

  getRecurrentes(
    page: number = 1,
    size: number = 20,
    includeInactive = false,
  ): Observable<PaginatedResponse<TareaRecurrente>> {
    const params = new HttpParams()
      .set("page", page)
      .set("size", size)
      .set("include_inactive", includeInactive);

    return this.http.get<any>(this.tareasRecurrentesUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map((item: any) =>
          TareaRecurrenteAdapter.fromBackend(item),
        ),
      })),
    );
  }

  getRecurrenteById(id: number): Observable<TareaRecurrente> {
    return this.http
      .get<any>(`${this.tareasRecurrentesUrl}/${id}`)
      .pipe(map((item) => TareaRecurrenteAdapter.fromBackend(item)));
  }

  createRecurrente(data: CreateTareaRecurrente): Observable<TareaRecurrente> {
    const payload = TareaRecurrenteAdapter.toCreate(data);
    return this.http
      .post<any>(this.tareasRecurrentesUrl, payload)
      .pipe(map((item) => TareaRecurrenteAdapter.fromBackend(item)));
  }

  updateRecurrente(
    id: number,
    data: Partial<CreateTareaRecurrente>,
  ): Observable<TareaRecurrente> {
    const payload = TareaRecurrenteAdapter.toCreate(
      data as CreateTareaRecurrente,
    );
    return this.http
      .put<any>(`${this.tareasRecurrentesUrl}/${id}`, payload)
      .pipe(map((item) => TareaRecurrenteAdapter.fromBackend(item)));
  }

  deleteRecurrente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tareasRecurrentesUrl}/${id}`);
  }
}
