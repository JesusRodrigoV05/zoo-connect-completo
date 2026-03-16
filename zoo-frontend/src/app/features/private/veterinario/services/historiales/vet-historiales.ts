import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  Historial,
  HistorialForm,
  HistorialListResponse,
  HistorialResponse,
} from "../../models/historiales/historial.model";
import { HistorialAdapter } from "../../adapters/historiales/historial.adapter";

@Injectable({
  providedIn: "root",
})
export class VetHistoriales {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/veterinario/historiales`;

  getHistoriales(
    page: number = 1,
    size: number = 50,
    filters?: { animalId?: number; soloMios?: boolean; estado?: boolean },
  ): Observable<PaginatedResponse<Historial>> {
    let params = new HttpParams().set("page", page).set("size", size);

    if (filters?.animalId) params = params.set("animal_id", filters.animalId);
    if (filters?.soloMios) params = params.set("solo_mis_registros", true);
    if (filters?.estado !== undefined)
      params = params.set("estado", filters.estado);

    return this.http.get<HistorialListResponse>(this.apiUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map(HistorialAdapter.toDomain),
      })),
    );
  }

  getHistorialById(id: number): Observable<Historial> {
    return this.http
      .get<HistorialResponse>(`${this.apiUrl}/${id}`)
      .pipe(map(HistorialAdapter.toDomain));
  }

  createHistorial(data: HistorialForm): Observable<Historial> {
    const payload = HistorialAdapter.toCreatePayload(data);
    return this.http
      .post<HistorialResponse>(this.apiUrl, payload)
      .pipe(map(HistorialAdapter.toDomain));
  }

  updateHistorial(
    id: number,
    data: Partial<HistorialForm>,
  ): Observable<Historial> {
    const payload = HistorialAdapter.toUpdatePayload(data);
    return this.http
      .put<HistorialResponse>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(HistorialAdapter.toDomain));
  }

  cerrarHistorial(id: number): Observable<Historial> {
    const payload = { estado: false };

    return this.http
      .put<HistorialResponse>(`${this.apiUrl}/${id}`, payload)
      .pipe(map(HistorialAdapter.toDomain));
  }
}
