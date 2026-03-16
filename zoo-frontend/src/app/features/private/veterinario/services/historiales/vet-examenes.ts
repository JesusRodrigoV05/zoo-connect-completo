import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import {
  OrdenExamen,
  OrdenExamenForm,
  OrdenListResponse,
  OrdenResponse,
  ResultadoExamen,
  ResultadoResponse,
  ResultadoUploadForm,
} from "../../models/historiales/examenes.model";
import { ExamenAdapter } from "../../adapters/historiales/examenes.adapter";

@Injectable({
  providedIn: "root",
})
export class VetExamenes {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/veterinario`;

  getOrdenes(
    page: number = 1,
    size: number = 50,
    filters?: { animalId?: number; tipoExamenId?: number; estado?: string },
  ): Observable<PaginatedResponse<OrdenExamen>> {
    let params = new HttpParams().set("page", page).set("size", size);

    if (filters?.animalId) params = params.set("animal_id", filters.animalId);
    if (filters?.tipoExamenId)
      params = params.set("tipo_examen_id", filters.tipoExamenId);
    if (filters?.estado) params = params.set("estado", filters.estado);

    return this.http
      .get<OrdenListResponse>(`${this.baseUrl}/ordenes-examen`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(ExamenAdapter.toDomainOrden),
        })),
      );
  }

  getOrdenById(id: number): Observable<OrdenExamen> {
    return this.http
      .get<OrdenResponse>(`${this.baseUrl}/ordenes-examen/${id}`)
      .pipe(map(ExamenAdapter.toDomainOrden));
  }

  createOrden(
    historialId: number,
    data: OrdenExamenForm,
  ): Observable<OrdenExamen> {
    const payload = ExamenAdapter.toCreateOrdenPayload(data);
    const url = `${this.baseUrl}/historiales/${historialId}/ordenes-examen`;

    return this.http
      .post<OrdenResponse>(url, payload)
      .pipe(map(ExamenAdapter.toDomainOrden));
  }

  deleteOrden(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/ordenes-examen/${id}`);
  }

  uploadResultado(
    ordenId: number,
    data: ResultadoUploadForm,
  ): Observable<ResultadoExamen> {
    const formData = ExamenAdapter.toUploadPayload(data);
    const url = `${this.baseUrl}/ordenes-examen/${ordenId}/resultados`;

    return this.http
      .post<ResultadoResponse>(url, formData)
      .pipe(map(ExamenAdapter.toDomainResultado));
  }

  deleteResultado(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}resultados-examen/${id}`);
  }
}
