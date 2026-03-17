import { AnimalMediaAdapter, AnimalMediaApiResponse } from "@adapters/animales";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { inject } from "@angular/core";
import { environment } from "@env";
import { MediaAnimal } from "@models/animales";
import { PaginatedResponse } from "@models/common";
import { catchError, map, Observable, throwError } from "rxjs";

export interface AnimalMediaMetadata {
  animalId: number;
  titulo: string;
  descripcion?: string;
}

@Injectable({
  providedIn: "root",
})
export class AdminAnimalesMultimedia {
  private http = inject(HttpClient);

  readonly apiUrl = environment.apiUrl;
  readonly animalUrl = `${this.apiUrl}/animals`;
  readonly animalesUrl = `${this.animalUrl}/animals`;
  readonly mediaUrl = `${this.animalUrl}/media/animal`;

  uploadAnimalMedia(
    datos: AnimalMediaMetadata,
    file: File,
  ): Observable<MediaAnimal> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    if (!datos.titulo) {
      const titulo = file.name.split(".").slice(0, -1).join(".") || file.name;
      formData.append("titulo_media_animal", titulo);
    } else {
      formData.append("titulo_media_animal", datos.titulo);
    }

    const isImage = file.type.startsWith("image/");
    formData.append("tipo_medio", String(isImage));

    if (!datos.descripcion) {
      formData.append("descripcion_media_animal", "");
    } else {
      formData.append("descripcion_media_animal", datos.descripcion);
    }

    const url = `${this.animalesUrl}/${datos.animalId}/media`;

    return this.http.post<AnimalMediaApiResponse>(url, formData).pipe(
      map(AnimalMediaAdapter.fromApi),
      catchError((error) =>
        throwError(() => new Error("Error al subir el archivo")),
      ),
    );
  }

  getAllMediaForAnimal(
    animalId: number,
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<MediaAnimal>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    const url = `${this.animalesUrl}/${animalId}/media`;

    return this.http
      .get<PaginatedResponse<AnimalMediaApiResponse>>(url, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(AnimalMediaAdapter.fromApi),
        })),
        catchError((error) =>
          throwError(
            () => new Error("Error al obtener los archivos del animal"),
          ),
        ),
      );
  }

  deleteAnimalMedia(mediaId: number): Observable<void> {
    const url = `${this.mediaUrl}/${mediaId}`;
    return this.http
      .delete<void>(url)
      .pipe(
        catchError((error) =>
          throwError(() => new Error("Error al eliminar el archivo")),
        ),
      );
  }

  getAllAnimalMedia(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<MediaAnimal>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http
      .get<
        PaginatedResponse<AnimalMediaApiResponse>
      >(`${this.animalesUrl}/media/animals`, { params })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map(AnimalMediaAdapter.fromApi),
        })),
        catchError((error) =>
          throwError(
            () => new Error("Error al obtener todos los archivos de animales"),
          ),
        ),
      );
  }
}
