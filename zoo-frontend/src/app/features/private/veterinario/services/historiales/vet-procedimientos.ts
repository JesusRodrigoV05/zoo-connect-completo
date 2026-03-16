import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  Procedimiento,
  ProcedimientoForm,
  ProcedimientoListResponse,
  ProcedimientoResponse,
} from "../../models/historiales/procedimiento.model";
import { ProcedimientoAdapter } from "../../adapters/historiales/procedimiento.adapter";

@Injectable({
  providedIn: "root",
})
export class VetProcedimientos {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/veterinario`;

  getProcedimientos(
    page: number = 1,
    size: number = 50,
    filters?: { animalId?: number; estado?: string },
  ): Observable<PaginatedResponse<Procedimiento>> {
    let params = new HttpParams().set("page", page).set("size", size);

    if (filters?.animalId) params = params.set("animal_id", filters.animalId);
    if (filters?.estado) params = params.set("estado", filters.estado);

    return this.http
      .get<ProcedimientoListResponse>(`${this.baseUrl}/procedimientos`, {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(ProcedimientoAdapter.toDomain),
        })),
      );
  }

  createProcedimiento(
    historialId: number,
    data: ProcedimientoForm,
  ): Observable<Procedimiento> {
    const payload = ProcedimientoAdapter.toCreatePayload(data);
    const url = `${this.baseUrl}/historiales/${historialId}/procedimientos`;

    return this.http
      .post<ProcedimientoResponse>(url, payload)
      .pipe(map(ProcedimientoAdapter.toDomain));
  }

  updateProcedimiento(
    id: number,
    data: ProcedimientoForm,
  ): Observable<Procedimiento> {
    const payload = ProcedimientoAdapter.toUpdatePayload(data);
    const url = `${this.baseUrl}/procedimientos/${id}`;

    return this.http
      .put<ProcedimientoResponse>(url, payload)
      .pipe(map(ProcedimientoAdapter.toDomain));
  }

  deleteProcedimiento(id: number): Observable<void> {
    const url = `${this.baseUrl}/procedimientos/${id}`;
    return this.http.delete<void>(url);
  }
}
