import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { map, Observable } from "rxjs";
import {
  CreateSalidaRequest,
  SalidaInventario,
} from "../../models/entradas-salidas/transacciones.model";
import { PaginatedResponse } from "@models/common";
import { SalidaAdapter } from "../../adapters/transacciones.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminSalidas {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  readonly salidasUrl = `${this.apiUrl}/transacciones/salidas`;

  getSalidas(
    page: number = 1,
    size: number = 50,
  ): Observable<PaginatedResponse<SalidaInventario>> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<any>(this.salidasUrl, { params }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i: any) => SalidaAdapter.fromBackend(i)),
      })),
    );
  }

  getSalidaById(id: number): Observable<SalidaInventario> {
    return this.http
      .get<any>(`${this.salidasUrl}/${id}`)
      .pipe(map((item) => SalidaAdapter.fromBackend(item)));
  }

  createSalida(data: CreateSalidaRequest): Observable<SalidaInventario> {
    const payload = SalidaAdapter.toCreate(data);
    return this.http
      .post<any>(this.salidasUrl, payload)
      .pipe(map((item) => SalidaAdapter.fromBackend(item)));
  }
}
