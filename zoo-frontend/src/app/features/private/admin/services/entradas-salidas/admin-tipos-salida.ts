import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { map, Observable } from "rxjs";
import {
  CreateTipoSalida,
  TipoSalida,
  UpdateTipoSalida,
} from "../../models/entradas-salidas/transacciones.model";
import { PaginatedResponse } from "@models/common";
import { TipoSalidaAdapter } from "../../adapters/transacciones.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminTiposSalida {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  readonly tiposSalidaUrl = `${this.apiUrl}/transacciones/tipos-salida`;

  getTipos(
    page: number = 1,
    size: number = 50,
    includeInactive = false,
  ): Observable<PaginatedResponse<TipoSalida>> {
    const params = new HttpParams()
      .set("page", page)
      .set("size", size)
      .set("include_inactive", includeInactive);
    return this.http.get<any>(this.tiposSalidaUrl, { params }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i: any) => TipoSalidaAdapter.fromBackend(i)),
      })),
    );
  }

  createTipo(data: CreateTipoSalida): Observable<TipoSalida> {
    return this.http
      .post<any>(this.tiposSalidaUrl, TipoSalidaAdapter.toCreate(data))
      .pipe(map((item) => TipoSalidaAdapter.fromBackend(item)));
  }

  updateTipo(id: number, data: UpdateTipoSalida): Observable<TipoSalida> {
    return this.http
      .put<any>(
        `${this.tiposSalidaUrl}/${id}`,
        TipoSalidaAdapter.toUpdate(data),
      )
      .pipe(map((item) => TipoSalidaAdapter.fromBackend(item)));
  }

  deleteTipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tiposSalidaUrl}/${id}`);
  }
}
