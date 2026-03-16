import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";
import {
  CreateEntradaRequest,
  EntradaInventario,
} from "../../models/entradas-salidas/transacciones.model";
import { EntradaAdapter } from "../../adapters/transacciones.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminEntradas {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  readonly entradasUrl = `${this.apiUrl}/transacciones/entradas`;

  getEntradas(
    page: number = 1,
    size: number = 50,
  ): Observable<PaginatedResponse<EntradaInventario>> {
    const params = new HttpParams().set("page", page).set("size", size);
    return this.http.get<any>(this.entradasUrl, { params }).pipe(
      map((res) => ({
        ...res,
        items: res.items.map((i: any) => EntradaAdapter.fromBackend(i)),
      })),
    );
  }

  createEntrada(data: CreateEntradaRequest): Observable<EntradaInventario> {
    const payload = EntradaAdapter.toCreate(data);
    return this.http
      .post<any>(this.entradasUrl, payload)
      .pipe(map((item) => EntradaAdapter.fromBackend(item)));
  }
}
