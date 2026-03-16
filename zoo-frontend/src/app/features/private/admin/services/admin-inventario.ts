import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { map, Observable } from "rxjs";
import {
  CreateProducto,
  Producto,
  UpdateProducto,
} from "../models/productos.model";
import { ProductoAdapter } from "../adapters/producto.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminInventario {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly inventoryUrl = `${this.apiUrl}/inventario/productos`;
  readonly alertasStockUrl = `${this.apiUrl}/transacciones/alertas-stock`;

  getProducts(
    page: number = 1,
    size: number = 20,
    includeInactive: boolean = false,
    nombre?: string | null,
    tipoProductoId?: number | null,
  ): Observable<PaginatedResponse<Producto>> {
    let params = new HttpParams()
      .set("page", page)
      .set("size", size)
      .set("include_inactive", includeInactive);

    if (nombre) {
      params = params.set("nombre", nombre);
    }

    if (tipoProductoId) {
      params = params.set("tipo_producto_id", tipoProductoId);
    }

    return this.http.get<any>(this.inventoryUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map((item: any) =>
          ProductoAdapter.fromBackend(item),
        ),
      })),
    );
  }

  getProductById(id: number): Observable<Producto> {
    return this.http
      .get<any>(`${this.inventoryUrl}/${id}`)
      .pipe(map((item) => ProductoAdapter.fromBackend(item)));
  }

  createProduct(
    productData: CreateProducto,
    file?: File,
  ): Observable<Producto> {
    const formData = new FormData();

    const backendData = ProductoAdapter.toCreate(productData);
    formData.append("producto_data_json", JSON.stringify(backendData));

    if (file) {
      formData.append("file", file);
    }

    return this.http
      .post<any>(this.inventoryUrl, formData)
      .pipe(map((item) => ProductoAdapter.fromBackend(item)));
  }

  updateProduct(id: number, productData: UpdateProducto): Observable<Producto> {
    const payload = ProductoAdapter.toUpdate(productData);
    return this.http
      .put<any>(`${this.inventoryUrl}/${id}`, payload)
      .pipe(map((item) => ProductoAdapter.fromBackend(item)));
  }

  updateProductImage(id: number, file: File): Observable<Producto> {
    const formData = new FormData();
    formData.append("file", file);

    return this.http
      .put<any>(`${this.inventoryUrl}/${id}/imagen`, formData)
      .pipe(map((item) => ProductoAdapter.fromBackend(item)));
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.inventoryUrl}/${id}`);
  }

  deleteProductImage(id: number): Observable<Producto> {
    return this.http
      .delete<any>(`${this.inventoryUrl}/${id}/imagen`)
      .pipe(map((item) => ProductoAdapter.fromBackend(item)));
  }

  getStockAlertProducts(
    page: number = 1,
    size: number = 20,
  ): Observable<PaginatedResponse<Producto>> {
    let params = new HttpParams().set("page", page).set("size", size);

    return this.http.get<any>(this.alertasStockUrl, { params }).pipe(
      map((response) => ({
        ...response,
        items: response.items.map((item: any) =>
          ProductoAdapter.fromBackend(item),
        ),
      })),
    );
  }
}
