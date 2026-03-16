import { AnimalAdapter, BackendAnimalResponse } from "@adapters/animales";
import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { Animal } from "@models/animales";
import { map, Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class FavoriteAnimals {
  private http = inject(HttpClient);

  readonly apiUrl = environment.apiUrl;
  readonly animalesUrl = `${this.apiUrl}/favorite_animals/favorites/`;

  getFavoriteAnimals(): Observable<Animal[]> {
    return this.http.get<any>(this.animalesUrl).pipe(
      map((response) => {
        const listaFavoritos = response.items ? response.items : response;

        return listaFavoritos.map((item: any) =>
          AnimalAdapter.fromBackend(item.animal),
        );
      }),
    );
  }

  addFavoriteAnimal(id: number): Observable<Animal> {
    return this.http.post<any>(this.animalesUrl, { animal_id: id }).pipe(
      map((response) => {
        return response.animal
          ? AnimalAdapter.fromBackend(response.animal)
          : AnimalAdapter.fromBackend(response);
      }),
    );
  }

  removeFavoriteAnimal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.animalesUrl}${id}`);
  }
}
