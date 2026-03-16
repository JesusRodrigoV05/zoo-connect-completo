import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { environment } from "@env";
import {
  Especie,
  CreateEspecie,
  UpdateEspecie,
} from "@app/core/models/animales/especie.model";
import {
  EspecieAdapter,
  EspecieApiResponse,
  CreateEspecieRequest,
} from "@app/core/adapters/animales/especie.adapter";
import { PaginatedResponse } from "@models/common";

@Injectable({
  providedIn: "root",
})
export class AdminEspecies {
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.apiUrl;
  private readonly especiesUrl = `${this.apiUrl}/animals/species`;

  /**
   * Obtiene todas las especies con paginación
   */
  getAllSpecies(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Especie>> {
    const validPage = Number.isFinite(page) && page > 0 ? page : 1;
    const validSize = Number.isFinite(size) && size > 0 ? size : 10;

    const params = new HttpParams()
      .set("page", validPage.toString())
      .set("size", validSize.toString());

    return this.http
      .get<PaginatedResponse<EspecieApiResponse>>(this.especiesUrl, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((especie) =>
            EspecieAdapter.fromApi(especie),
          ),
        })),
        catchError((error) => {
          return throwError(() => new Error("Error al obtener especies"));
        }),
      );
  }

  /**
   * Obtiene una especie por ID
   */
  getSpeciesById(id: number): Observable<Especie> {
    return this.http
      .get<EspecieApiResponse>(`${this.especiesUrl}/${id}`)
      .pipe(map((response) => EspecieAdapter.fromApi(response)));
  }

  /**
   * Crea una nueva especie
   */
  createSpecies(especieData: CreateEspecie): Observable<Especie> {
    const request = EspecieAdapter.toCreateRequest(especieData);

    return this.http
      .post<EspecieApiResponse>(this.especiesUrl, request)
      .pipe(map((response) => EspecieAdapter.fromApi(response)));
  }

  /**
   * Actualiza una especie existente
   */
  updateSpecies(especie: UpdateEspecie): Observable<Especie> {
    const request = EspecieAdapter.toUpdateRequest(especie as Especie);

    return this.http
      .put<EspecieApiResponse>(
        `${this.especiesUrl}/${especie.idEspecie}`,
        request,
      )
      .pipe(map((response) => EspecieAdapter.fromApi(response)));
  }

  /**
   * Actualización parcial de una especie (usando PUT como indica el API)
   */
  patchSpecies(
    id: number,
    changes: Partial<Omit<Especie, "idEspecie">>,
  ): Observable<Especie> {
    const request = EspecieAdapter.toPartialUpdateRequest(id, changes);

    return this.http
      .put<EspecieApiResponse>(`${this.especiesUrl}/${id}`, request)
      .pipe(map((response) => EspecieAdapter.fromApi(response)));
  }

  /**
   * Elimina una especie (retorna 204 No Content)
   */
  deleteSpecies(id: number): Observable<void> {
    return this.http.delete<void>(`${this.especiesUrl}/${id}`);
  }

  /**
   * Activa/desactiva una especie (usar PUT según API)
   */
  toggleSpeciesStatus(id: number, isActive: boolean): Observable<Especie> {
    return this.patchSpecies(id, { isActive });
  }
}
