import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";
import {
  CreateTipoProducto,
  TipoProducto,
  UpdateTipoProducto,
} from "../models/productos.model";
import { TipoProductoAdapter } from "../adapters/producto.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminTipoProductos {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly inventoryUrl = `${this.apiUrl}/inventario/tipos-producto`;

  getTipos(
    page: number = 1,
    size: number = 20,
    includeInactive = false,
  ): Observable<PaginatedResponse<TipoProducto>> {
    const params = new HttpParams()
      .set("page", page)
      .set("size", size)
      .set("include_inactive", includeInactive);

    return this.http.get<any>(this.inventoryUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map((item: any) =>
          TipoProductoAdapter.fromBackend(item),
        ),
      })),
    );
  }

  getTipoById(id: number): Observable<TipoProducto> {
    return this.http
      .get<any>(`${this.inventoryUrl}/${id}`)
      .pipe(map((item) => TipoProductoAdapter.fromBackend(item)));
  }

  createTipo(data: CreateTipoProducto): Observable<TipoProducto> {
    const payload = TipoProductoAdapter.toCreate(data);
    return this.http
      .post<any>(this.inventoryUrl, payload)
      .pipe(map((item) => TipoProductoAdapter.fromBackend(item)));
  }

  updateTipo(id: number, data: UpdateTipoProducto): Observable<TipoProducto> {
    const payload = TipoProductoAdapter.toUpdate(data);
    return this.http
      .put<any>(`${this.inventoryUrl}/${id}`, payload)
      .pipe(map((item) => TipoProductoAdapter.fromBackend(item)));
  }

  deleteTipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.inventoryUrl}/${id}`);
  }
}
