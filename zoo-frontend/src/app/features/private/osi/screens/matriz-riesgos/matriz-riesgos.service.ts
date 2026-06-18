import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "@env";

export interface RiskMatrixEntryDto {
  id: number;
  information_asset_id?: number;
  asset: string;
  threat: string;
  vulnerability: string;
  risk_event: string;
  consequence: string;
  probability: number;
  impact: number;
  treatment: string;
  residual_probability: number;
  residual_impact: number;
  controls: RiskControlDto[];
}

export interface RiskMatrixEntryPayload {
  information_asset_id?: number;
  asset: string;
  threat: string;
  vulnerability: string;
  risk_event: string;
  consequence: string;
  probability: number;
  impact: number;
  treatment: string;
  residual_probability: number;
  residual_impact: number;
  controls: RiskControlPayload[];
}

export interface RiskControlDto {
  id: number;
  risk_matrix_entry_id: number;
  description: string;
  control_type: string;
  automation_level: string;
  frequency: string;
}

export interface RiskControlPayload {
  id?: number;
  description: string;
  control_type: string;
  automation_level: string;
  frequency: string;
}

@Injectable({ providedIn: "root" })
export class RiskMatrixService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/risk-matrix`;

  list(): Observable<RiskMatrixEntryDto[]> {
    return this.http.get<RiskMatrixEntryDto[]>(this.url);
  }

  create(entry: RiskMatrixEntryPayload): Observable<RiskMatrixEntryDto> {
    return this.http.post<RiskMatrixEntryDto>(this.url, entry);
  }

  update(id: number, entry: RiskMatrixEntryPayload): Observable<RiskMatrixEntryDto> {
    return this.http.put<RiskMatrixEntryDto>(`${this.url}/${id}`, entry);
  }

  replaceAll(entries: RiskMatrixEntryPayload[]): Observable<RiskMatrixEntryDto[]> {
    return this.http.put<RiskMatrixEntryDto[]>(this.url, entries).pipe(
      map((items) => items.sort((a, b) => a.id - b.id)),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
