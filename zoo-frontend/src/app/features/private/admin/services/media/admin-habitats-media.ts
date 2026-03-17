import { HabitatMediaResponse } from "@adapters/habitat";
import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { Observable } from "rxjs";

export interface HabitatMediaMetadata {
  habitatId: number;
  titulo: string;
  descripcion?: string;
}

@Injectable({
  providedIn: "root",
})
export class AdminHabitatsMedia {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private habitatsUrl = `${this.apiUrl}/animals/habitats`;
  private mediaUrl = `${this.apiUrl}/animals/media/habitat`;

  /**
   * Sube un archivo de media para un hábitat específico
   * @param habitatId El ID del hábitat
   * @param file El archivo a subir
   * @returns Observable con la respuesta del medio creado
   */
  uploadHabitatMedia(
    datos: HabitatMediaMetadata,
    file: File,
  ): Observable<HabitatMediaResponse> {
    const formData = new FormData();
    formData.append("file", file, file.name);

    if (!datos.titulo) {
      const titulo = file.name.split(".").slice(0, -1).join(".") || file.name;
      formData.append("titulo_media_habitat", titulo);
    } else {
      formData.append("titulo_media_habitat", datos.titulo);
    }

    const isImage = file.type.startsWith("image/");
    formData.append("tipo_medio", String(isImage));

    if (!datos.descripcion) {
      formData.append("descripcion_media_habitat", "");
    } else {
      formData.append("descripcion_media_habitat", datos.descripcion);
    }

    const url = `${this.habitatsUrl}/${datos.habitatId}/media`;
    return this.http.post<HabitatMediaResponse>(url, formData);
  }

  /**
   * Obtiene todos los medios para un hábitat (paginado)
   */
  getAllMediaForHabitat(
    habitatId: number,
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<HabitatMediaResponse>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    const url = `${this.habitatsUrl}/${habitatId}/media`;
    return this.http.get<PaginatedResponse<HabitatMediaResponse>>(url, {
      params,
    });
  }

  /**
   * Elimina un archivo de media por su ID
   */
  deleteHabitatMedia(mediaId: number): Observable<void> {
    const url = `${this.mediaUrl}/${mediaId}`;
    return this.http.delete<void>(url);
  }
}
