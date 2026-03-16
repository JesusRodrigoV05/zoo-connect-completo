import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { TareaAdapter } from "@app/features/private/admin/adapters/tareas.adapter";
import {
  CreateTareaManual,
  Tarea,
} from "@app/features/private/admin/models/tareas/tarea.model";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminOperacionesTarea {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/tareas`;

  createManualTask(data: CreateTareaManual): Observable<Tarea> {
    const payload = TareaAdapter.toCreateManual(data);
    return this.http
      .post<any>(`${this.apiUrl}/`, payload)
      .pipe(map((item) => TareaAdapter.fromBackend(item)));
  }

  getUnassignedTasks(
    page = 1,
    size = 50,
  ): Observable<PaginatedResponse<Tarea>> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<any>(`${this.apiUrl}/sin-asignar`, { params }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i: any) => TareaAdapter.fromBackend(i)),
      })),
    );
  }

  getAssignedTasksToday(
    page = 1,
    size = 50,
  ): Observable<PaginatedResponse<Tarea>> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<any>(`${this.apiUrl}/asignadas-hoy`, { params }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i: any) => TareaAdapter.fromBackend(i)),
      })),
    );
  }

  assignTask(tareaId: number, usuarioId: number): Observable<Tarea> {
    return this.http
      .put<any>(`${this.apiUrl}/${tareaId}/asignar`, {
        usuario_asignado_id: usuarioId,
      })
      .pipe(map((item) => TareaAdapter.fromBackend(item)));
  }
}
