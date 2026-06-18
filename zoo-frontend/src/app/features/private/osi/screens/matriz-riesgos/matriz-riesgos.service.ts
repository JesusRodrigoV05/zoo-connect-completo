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
  controls?: RiskControlPayload[];
  /** @deprecated Use controls[].description instead. Kept to avoid stale dev-server payload failures. */
  control?: string;
  /** @deprecated Use controls[].control_type instead. */
  control_type?: string;
  /** @deprecated Use controls[].automation_level instead. */
  automation_level?: string;
  /** @deprecated Use controls[].frequency instead. */
  frequency?: string;
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
    return this.http.post<RiskMatrixEntryDto>(this.url, this.normalizePayload(entry));
  }

  update(id: number, entry: RiskMatrixEntryPayload): Observable<RiskMatrixEntryDto> {
    return this.http.put<RiskMatrixEntryDto>(`${this.url}/${id}`, this.normalizePayload(entry));
  }

  replaceAll(entries: RiskMatrixEntryPayload[]): Observable<RiskMatrixEntryDto[]> {
    return this.http.put<RiskMatrixEntryDto[]>(this.url, entries.map((entry) => this.normalizePayload(entry))).pipe(
      map((items) => items.sort((a, b) => a.id - b.id)),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  private normalizePayload(entry: RiskMatrixEntryPayload): RiskMatrixEntryPayload {
    const legacyControl = entry.control?.trim();
    const controls = entry.controls?.length
      ? entry.controls
      : legacyControl
        ? [
            {
              description: legacyControl,
              control_type: entry.control_type || "P",
              automation_level: entry.automation_level || "A",
              frequency: entry.frequency || "PT",
            },
          ]
        : [];

    const {
      control,
      control_type,
      automation_level,
      frequency,
      ...payload
    } = entry;

    return {
      ...payload,
      controls,
    };
  }
}
