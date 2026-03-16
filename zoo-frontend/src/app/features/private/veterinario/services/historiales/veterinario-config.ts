import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import {
  TipoAtencion,
  TipoAtencionResponse,
  TipoExamen,
  TipoExamenResponse,
} from "../../models/historiales/veterinario-config.model";
import { map, Observable } from "rxjs";
import {
  TipoAtencionAdapter,
  TipoExamenAdapter,
} from "../../adapters/historiales/veterinario-config.adapter";

@Injectable({
  providedIn: "root",
})
export class VeterinarioConfig {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/veterinario`;

  getTiposAtencion(includeInactive = false): Observable<TipoAtencion[]> {
    const params = new HttpParams().set("include_inactive", includeInactive);

    return this.http
      .get<TipoAtencionResponse[]>(`${this.apiUrl}/tipos-atencion`, { params })
      .pipe(map((response) => response.map(TipoAtencionAdapter.toDomain)));
  }

  createTipoAtencion(
    data: Omit<TipoAtencion, "id" | "activo">,
  ): Observable<TipoAtencion> {
    const payload = TipoAtencionAdapter.toCreatePayload(data);

    return this.http
      .post<TipoAtencionResponse>(`${this.apiUrl}/tipos-atencion`, payload)
      .pipe(map(TipoAtencionAdapter.toDomain));
  }

  updateTipoAtencion(
    id: number,
    data: Partial<TipoAtencion>,
  ): Observable<TipoAtencion> {
    const payload = TipoAtencionAdapter.toUpdatePayload(data);

    return this.http
      .put<TipoAtencionResponse>(`${this.apiUrl}/tipos-atencion/${id}`, payload)
      .pipe(map(TipoAtencionAdapter.toDomain));
  }

  deleteTipoAtencion(id: number): Observable<TipoAtencion> {
    return this.http
      .delete<TipoAtencionResponse>(`${this.apiUrl}/tipos-atencion/${id}`)
      .pipe(map(TipoAtencionAdapter.toDomain));
  }

  getTiposExamen(includeInactive = false): Observable<TipoExamen[]> {
    const params = new HttpParams().set("include_inactive", includeInactive);

    return this.http
      .get<TipoExamenResponse[]>(`${this.apiUrl}/tipos-examen`, { params })
      .pipe(map((response) => response.map(TipoExamenAdapter.toDomain)));
  }

  createTipoExamen(
    data: Omit<TipoExamen, "id" | "activo">,
  ): Observable<TipoExamen> {
    const payload = TipoExamenAdapter.toCreatePayload(data);

    return this.http
      .post<TipoExamenResponse>(`${this.apiUrl}/tipos-examen`, payload)
      .pipe(map(TipoExamenAdapter.toDomain));
  }

  updateTipoExamen(
    id: number,
    data: Partial<TipoExamen>,
  ): Observable<TipoExamen> {
    const payload = TipoExamenAdapter.toUpdatePayload(data);

    return this.http
      .put<TipoExamenResponse>(`${this.apiUrl}/tipos-examen/${id}`, payload)
      .pipe(map(TipoExamenAdapter.toDomain));
  }

  deleteTipoExamen(id: number): Observable<TipoExamen> {
    return this.http
      .delete<TipoExamenResponse>(`${this.apiUrl}/tipos-examen/${id}`)
      .pipe(map(TipoExamenAdapter.toDomain));
  }
}
