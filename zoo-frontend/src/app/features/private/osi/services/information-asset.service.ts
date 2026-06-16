import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "@env";

export interface InformationAsset {
  id: number;
  name: string;
  description?: string;
  category: string;
  confidentiality: number;
  integrity: number;
  availability: number;
  owner_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InformationAssetPayload {
  name: string;
  description?: string;
  category: string;
  confidentiality: number;
  integrity: number;
  availability: number;
  owner_id?: string;
}

@Injectable({
  providedIn: "root",
})
export class InformationAssetService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/zooconnect/information-assets`;

  list(): Observable<InformationAsset[]> {
    return this.http.get<InformationAsset[]>(this.url);
  }

  create(payload: InformationAssetPayload): Observable<InformationAsset> {
    return this.http.post<InformationAsset>(this.url, payload);
  }

  update(id: number, payload: Partial<InformationAssetPayload>): Observable<InformationAsset> {
    return this.http.put<InformationAsset>(`${this.url}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
