import { inject, Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { MediaAnimal } from "@models/animales";
import { HabitatMediaResponse } from "@adapters/habitat";

export interface AnimalMediaMetadata {
  animalId: number;
  titulo: string;
  descripcion: string;
}

export interface HabitatMediaMetadata {
  habitatId: number;
  titulo: string;
  descripcion: string;
}

@Injectable({
  providedIn: "root",
})
export class AdminAnimalesMultimedia {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/animals`;

  getAllMediaForAnimal(
    animalId: number,
    page: number = 1,
    size: number = 50
  ): Observable<PaginatedResponse<MediaAnimal>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());
    return this.http.get<PaginatedResponse<MediaAnimal>>(
      `${this.apiUrl}/animals/${animalId}/media`,
      { params }
    );
  }

  uploadAnimalMedia(
    metadata: AnimalMediaMetadata,
    file: File
  ): Observable<MediaAnimal> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("titulo_media_animal", metadata.titulo || file.name);
    formData.append("descripcion_media_animal", metadata.descripcion || "");
    formData.append("tipo_medio", "true"); // true para imagen, false para video, segun backend es bool

    return this.http.post<MediaAnimal>(
      `${this.apiUrl}/animals/${metadata.animalId}/media`,
      formData
    );
  }

  deleteAnimalMedia(mediaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/media/animal/${mediaId}`);
  }
}

@Injectable({
  providedIn: "root",
})
export class AdminHabitatsMedia {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/animals`;

  getAllMediaForHabitat(
    habitatId: number,
    page: number = 1,
    size: number = 50
  ): Observable<PaginatedResponse<HabitatMediaResponse>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());
    return this.http.get<PaginatedResponse<HabitatMediaResponse>>(
      `${this.apiUrl}/habitats/${habitatId}/media`,
      { params }
    );
  }

  uploadHabitatMedia(
    metadata: HabitatMediaMetadata,
    file: File
  ): Observable<HabitatMediaResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("titulo_media_habitat", metadata.titulo || file.name);
    formData.append("descripcion_media_habitat", metadata.descripcion || "");
    formData.append("tipo_medio", "true");

    return this.http.post<HabitatMediaResponse>(
      `${this.apiUrl}/habitats/${metadata.habitatId}/media`,
      formData
    );
  }

  deleteHabitatMedia(mediaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/media/habitat/${mediaId}`);
  }
}
