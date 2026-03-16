import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import {
  HabitatAdapter,
  HabitatBackendResponse,
} from "@app/core/adapters/habitat";
import { Habitat } from "@app/core/models/habitat";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";

@Injectable({
  providedIn: "root",
})
export class AdminHabitat {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private habitatUrl = `${this.apiUrl}/animals/habitats`;

  /**
   * Crea un nuevo hábitat
   * @param habitatData - Datos del hábitat del frontend
   * @returns Observable con el hábitat creado
   */
  createHabitat(
    habitatData: Omit<Habitat, "id" | "isActive">,
  ): Observable<Habitat> {
    try {
      const backendRequest = HabitatAdapter.toCreateRequest(habitatData);

      return this.http
        .post<HabitatBackendResponse>(this.habitatUrl, backendRequest)
        .pipe(
          map((response) => HabitatAdapter.toFrontend(response)),
          catchError((error) => {
            let errorMessage = "Error al crear el hábitat";
            if (error.status === 422) {
              errorMessage = "Los datos enviados no son válidos";
            } else if (error.status === 400) {
              errorMessage = "Ya existe un hábitat con este nombre";
            }

            return throwError(() => new Error(errorMessage));
          }),
        );
    } catch (validationError: any) {
      return throwError(() => new Error(validationError.message));
    }
  }

  /**
   * Obtiene todos los hábitats con paginación
   * @param skip - Número de registros a omitir
   * @param limit - Número máximo de registros
   * @returns Observable con la lista de hábitats
   */
  getAllHabitats(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Habitat>> {
    const validPage = Number.isFinite(page) && page > 0 ? page : 1;
    const validSize = Number.isFinite(size) && size > 0 ? size : 10;

    const params = new HttpParams()
      .set("page", validPage.toString())
      .set("size", validSize.toString());

    return this.http
      .get<PaginatedResponse<HabitatBackendResponse>>(this.habitatUrl, {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((habitat) =>
            HabitatAdapter.toFrontend(habitat),
          ),
        })),
        catchError((error) => {
          return throwError(() => new Error("Error al obtener los hábitats"));
        }),
      );
  }

  /**
   * Obtiene un hábitat por su ID
   * @param id - ID del hábitat
   * @returns Observable con el hábitat encontrado
   */
  getHabitatById(id: number): Observable<Habitat> {
    return this.http
      .get<HabitatBackendResponse>(`${this.habitatUrl}/${id}`)
      .pipe(
        map((response) => HabitatAdapter.toFrontend(response)),
        catchError((error) => {
          return throwError(() => new Error("Error al obtener el hábitat"));
        }),
      );
  }

  /**
   * Actualiza un hábitat existente
   * @param id - ID del hábitat a actualizar
   * @param habitatData - Datos parciales del hábitat a actualizar
   * @returns Observable con el hábitat actualizado
   */
  updateHabitat(
    id: number,
    habitatData: Partial<Omit<Habitat, "id">>,
  ): Observable<Habitat> {
    const backendRequest = HabitatAdapter.toUpdateRequest(habitatData);

    return this.http
      .put<HabitatBackendResponse>(`${this.habitatUrl}/${id}`, backendRequest)
      .pipe(
        map((response) => HabitatAdapter.toFrontend(response)),
        catchError((error) => {
          return throwError(() => new Error("Error al actualizar el hábitat"));
        }),
      );
  }

  /**
   * Elimina un hábitat
   * @param id - ID del hábitat a eliminar
   * @returns Observable que completa cuando se elimina
   */
  deleteHabitat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.habitatUrl}/${id}`).pipe(
      catchError((error) => {
        return throwError(() => new Error("Error al eliminar el hábitat"));
      }),
    );
  }

  /**
   * Valida si los datos del hábitat son correctos antes de enviar
   * @param habitatData - Datos del hábitat a validar
   * @returns true si los datos son válidos
   */
  validateHabitatData(habitatData: Partial<Habitat>): boolean {
    if (habitatData.nombre && habitatData.nombre.trim().length < 2) {
      throw new Error("El nombre del hábitat debe tener al menos 2 caracteres");
    }

    if (habitatData.tipo && habitatData.tipo.trim().length < 2) {
      throw new Error("El tipo de hábitat debe tener al menos 2 caracteres");
    }

    if (habitatData.descripcion && habitatData.descripcion.trim().length < 10) {
      throw new Error("La descripción debe tener al menos 10 caracteres");
    }

    if (
      habitatData.condicionesClimaticas &&
      habitatData.condicionesClimaticas.trim().length < 5
    ) {
      throw new Error(
        "Las condiciones climáticas deben tener al menos 5 caracteres",
      );
    }

    return true;
  }

  /**
   * Busca hábitats por nombre (filtro en frontend)
   * @param nombre - Nombre o parte del nombre a buscar
   * @returns Observable con los hábitats que coinciden
   */
  searchHabitatsByName(nombre: string): Observable<Habitat[]> {
    return this.getAllHabitats(1, 100).pipe(
      map((response) =>
        response.items.filter((habitat) =>
          habitat.nombre.toLowerCase().includes(nombre.toLowerCase()),
        ),
      ),
    );
  }
}
