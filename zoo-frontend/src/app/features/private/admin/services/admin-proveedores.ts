import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";
import {
  CreateProveedor,
  Proveedor,
  UpdateProveedor,
} from "../models/productos.model";
import { ProveedorAdapter } from "../adapters/producto.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminProveedores {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly inventoryUrl = `${this.apiUrl}/inventario/proveedores`;

  getProveedores(
    page: number = 1,
    size: number = 20,
    includeInactive = false,
  ): Observable<PaginatedResponse<Proveedor>> {
    const params = new HttpParams()
      .set("page", page)
      .set("size", size)
      .set("include_inactive", includeInactive);

    return this.http.get<any>(this.inventoryUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map((item: any) =>
          ProveedorAdapter.fromBackend(item),
        ),
      })),
    );
  }

  getProveedorById(id: number): Observable<Proveedor> {
    return this.http
      .get<any>(`${this.inventoryUrl}/${id}`)
      .pipe(map((item) => ProveedorAdapter.fromBackend(item)));
  }

  createProveedor(data: CreateProveedor): Observable<Proveedor> {
    const payload = ProveedorAdapter.toCreate(data);
    return this.http
      .post<any>(this.inventoryUrl, payload)
      .pipe(map((item) => ProveedorAdapter.fromBackend(item)));
  }

  updateProveedor(id: number, data: UpdateProveedor): Observable<Proveedor> {
    const payload = ProveedorAdapter.toUpdate(data);
    return this.http
      .put<any>(`${this.inventoryUrl}/${id}`, payload)
      .pipe(map((item) => ProveedorAdapter.fromBackend(item)));
  }

  deleteProveedor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.inventoryUrl}/${id}`);
  }
}
