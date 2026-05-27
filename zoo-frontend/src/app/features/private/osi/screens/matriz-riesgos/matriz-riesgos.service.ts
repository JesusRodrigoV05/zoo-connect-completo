import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable, map } from "rxjs";
import { environment } from "@env";

export interface RiskMatrixEntryDto {
  id: number;
  asset: string;
  threat: string;
  consequence: string;
  probability: number;
  impact: number;
  treatment: string;
  control: string;
  control_type: string;
  automation_level: string;
  frequency: string;
  residual_probability: number;
  residual_impact: number;
}

export interface RiskMatrixEntryPayload {
  asset: string;
  threat: string;
  consequence: string;
  probability: number;
  impact: number;
  treatment: string;
  control: string;
  control_type: string;
  automation_level: string;
  frequency: string;
  residual_probability: number;
  residual_impact: number;
}

@Injectable({ providedIn: "root" })
export class RiskMatrixService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/risk-matrix`;

  list(): Observable<RiskMatrixEntryDto[]> {
    return this.http.get<RiskMatrixEntryDto[]>(this.url);
  }

  replaceAll(entries: RiskMatrixEntryPayload[]): Observable<RiskMatrixEntryDto[]> {
    return this.http.put<RiskMatrixEntryDto[]>(this.url, entries).pipe(
      map((items) => items.sort((a, b) => a.id - b.id)),
    );
  }
}
