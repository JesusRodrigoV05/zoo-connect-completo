import { BackendAnimalResponse, AnimalAdapter } from "@adapters/animales";
import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Animal, CreateAnimal } from "@models/animales";
import { environment } from "@env";
import { catchError, map, Observable, throwError } from "rxjs";
import { PaginatedResponse } from "@models/common";

@Injectable({
  providedIn: "root",
})
export class AdminAnimales {
  private readonly http = inject(HttpClient);

  readonly apiUrl = environment.apiUrl;
  readonly animalesUrl = `${this.apiUrl}/animals/animals`;

  /**
   * Crear un nuevo animal
   * @param animalData - Datos del animal a crear
   * @returns Observable con el animal creado
   */
  createAnimal(animalData: CreateAnimal): Observable<Animal> {
    const request = AnimalAdapter.toCreateRequest(animalData);
    return this.http
      .post<BackendAnimalResponse>(this.animalesUrl, request)
      .pipe(map((animal) => AnimalAdapter.fromBackend(animal)));
  }

  /**
   * Obtener lista de animales con paginación
   * @param skip - Número de registros a omitir
   * @param limit - Número máximo de registros
   * @returns Observable con array de animales
   */
  getAllAnimals(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Animal>> {
    const validPage = Number.isFinite(page) && page > 0 ? page : 1;
    const validSize = Number.isFinite(size) && size > 0 ? size : 10;

    const params = new HttpParams()
      .set("page", validPage.toString())
      .set("size", validSize.toString());

    return this.http
      .get<PaginatedResponse<BackendAnimalResponse>>(this.animalesUrl, {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((animal) =>
            AnimalAdapter.fromBackend(animal),
          ),
        })),
        catchError((error) => {
          return throwError(() => new Error("Error al obtener los animales"));
        }),
      );
  }

  /**
   * Obtener animal por ID
   * @param animalId - ID del animal
   * @returns Observable con el animal encontrado
   */
  getAnimalById(animalId: number): Observable<Animal> {
    return this.http
      .get<BackendAnimalResponse>(`${this.animalesUrl}/${animalId}`)
      .pipe(map((animal) => AnimalAdapter.fromBackend(animal)));
  }

  /**
   * Actualizar datos de un animal
   * @param animalId - ID del animal a actualizar
   * @param animalData - Datos parciales del animal
   * @returns Observable con el animal actualizado
   */
  updateAnimal(
    animalId: number,
    animalData: Partial<CreateAnimal>,
  ): Observable<Animal> {
    const request = AnimalAdapter.toUpdateRequest(animalData);
    return this.http
      .put<BackendAnimalResponse>(`${this.animalesUrl}/${animalId}`, request)
      .pipe(map((animal) => AnimalAdapter.fromBackend(animal)));
  }

  /**
   * Eliminar un animal
   * @param animalId - ID del animal a eliminar
   * @returns Observable de la operación
   */
  deleteAnimal(animalId: number): Observable<void> {
    return this.http.delete<void>(`${this.animalesUrl}/${animalId}`).pipe(
      catchError((error) => {
        return throwError(() => new Error("Error al eliminar el animal"));
      }),
    );
  }
}
