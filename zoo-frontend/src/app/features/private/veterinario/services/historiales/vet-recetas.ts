import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  Receta,
  RecetaForm,
  RecetaListResponse,
  RecetaResponse,
} from "../../models/historiales/receta.model";
import { RecetaAdapter } from "../../adapters/historiales/receta.adapter";

@Injectable({
  providedIn: "root",
})
export class VetRecetas {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/veterinario`;

  getRecetas(
    page: number = 1,
    size: number = 50,
    filters?: { animalId?: number; usuarioId?: number; productoId?: number },
  ): Observable<PaginatedResponse<Receta>> {
    let params = new HttpParams().set("page", page).set("size", size);

    if (filters?.animalId) params = params.set("animal_id", filters.animalId);
    if (filters?.usuarioId)
      params = params.set("usuario_asignado_id", filters.usuarioId);
    if (filters?.productoId)
      params = params.set("producto_id", filters.productoId);

    return this.http
      .get<RecetaListResponse>(`${this.baseUrl}/recetas`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(RecetaAdapter.toDomain),
        })),
      );
  }

  getRecetaById(id: number): Observable<Receta> {
    return this.http
      .get<RecetaResponse>(`${this.baseUrl}/recetas/${id}`)
      .pipe(map(RecetaAdapter.toDomain));
  }

  createReceta(historialId: number, data: RecetaForm): Observable<Receta> {
    const payload = RecetaAdapter.toCreatePayload(data);
    const url = `${this.baseUrl}/historiales/${historialId}/recetas`;

    return this.http
      .post<RecetaResponse>(url, payload)
      .pipe(map(RecetaAdapter.toDomain));
  }

  deleteReceta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/recetas/${id}`);
  }
}
