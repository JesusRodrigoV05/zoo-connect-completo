import { AnimalAdapter, BackendAnimalResponse } from "@adapters/animales";
import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { Animal } from "@models/animales";
import { PaginatedResponse } from "@models/common";
import { catchError, map, Observable, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GetAnimales {
  private http = inject(HttpClient);

  readonly apiUrl = environment.apiUrl;
  readonly animalUrl = `${this.apiUrl}/animals`;
  readonly animalesUrl = `${this.animalUrl}/animals`;
  readonly mediaUrl = `${this.animalUrl}/media/animal`;

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

  getAnimalById(animalId: number): Observable<Animal> {
    return this.http
      .get<BackendAnimalResponse>(`${this.animalesUrl}/${animalId}`)
      .pipe(map((animal) => AnimalAdapter.fromBackend(animal)));
  }
}
