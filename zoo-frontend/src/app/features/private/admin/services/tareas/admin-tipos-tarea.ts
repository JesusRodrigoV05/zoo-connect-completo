import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { map, Observable } from "rxjs";
import {
  CreateTipoTarea,
  TipoTarea,
  UpdateTipoTarea,
} from "../../models/tareas/tarea.model";
import { TipoTareaAdapter } from "../../adapters/tareas.adapter";

@Injectable({
  providedIn: "root",
})
export class AdminTiposTarea {
  private http = inject(HttpClient);
  readonly apiUrl = environment.apiUrl;
  private tipoTareaUrl = `${this.apiUrl}/tareas/tipos`;

  getTipos(includeInactive = false): Observable<TipoTarea[]> {
    let params = new HttpParams().set("include_inactive", includeInactive);

    return this.http
      .get<any[]>(this.tipoTareaUrl, { params })
      .pipe(
        map((items) => items.map((item) => TipoTareaAdapter.fromBackend(item))),
      );
  }

  createTipo(data: CreateTipoTarea): Observable<TipoTarea> {
    const payload = TipoTareaAdapter.toCreate(data);
    return this.http
      .post<any>(this.tipoTareaUrl, payload)
      .pipe(map((item) => TipoTareaAdapter.fromBackend(item)));
  }

  updateTipo(id: number, data: UpdateTipoTarea): Observable<TipoTarea> {
    const payload = TipoTareaAdapter.toUpdate(data);
    return this.http
      .put<any>(`${this.tipoTareaUrl}/${id}`, payload)
      .pipe(map((item) => TipoTareaAdapter.fromBackend(item)));
  }

  deleteTipo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.tipoTareaUrl}/${id}`);
  }
}
