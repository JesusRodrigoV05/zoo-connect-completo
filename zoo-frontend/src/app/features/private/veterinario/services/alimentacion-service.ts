import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";
import {
  CreateDietaRequest,
  Dieta,
  UpdateDietaRequest,
} from "../models/alimentacion.model";
import { environment } from "@env";
import { DietaAdapter } from "../adapters/alimentacion.adapter";

@Injectable({
  providedIn: "root",
})
export class AlimentacionService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/alimentacion`;

  getDietas(page = 1, size = 20): Observable<PaginatedResponse<Dieta>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<any>(`${this.apiUrl}/dietas`, { params }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i: any) => DietaAdapter.fromBackend(i)),
      })),
    );
  }

  getDietaById(id: number): Observable<Dieta> {
    return this.http
      .get<any>(`${this.apiUrl}/dietas/${id}`)
      .pipe(map((item) => DietaAdapter.fromBackend(item)));
  }

  createDieta(data: CreateDietaRequest): Observable<Dieta> {
    const payload = DietaAdapter.toCreate(data);
    return this.http
      .post<any>(`${this.apiUrl}/dietas`, payload)
      .pipe(map((item) => DietaAdapter.fromBackend(item)));
  }

  updateDieta(id: number, data: UpdateDietaRequest): Observable<Dieta> {
    const payload = DietaAdapter.toCreate(data as CreateDietaRequest);
    return this.http
      .put<any>(`${this.apiUrl}/dietas/${id}`, payload)
      .pipe(map((item) => DietaAdapter.fromBackend(item)));
  }

  deleteDieta(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dietas/${id}`);
  }

  getSugerenciaDieta(tareaId: number): Observable<Dieta> {
    return this.http
      .get<any>(`${this.apiUrl}/${tareaId}/sugerencia-dieta`)
      .pipe(map((item) => DietaAdapter.fromBackend(item)));
  }
}
