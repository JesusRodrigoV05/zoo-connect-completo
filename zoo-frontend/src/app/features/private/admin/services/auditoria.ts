import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { Auditoria } from "@models/auditoria";
import { PaginatedResponse } from "@models/common";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuditoriaService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly auditUrl = `${this.apiUrl}/audit`;

  getAuditLogs(
    page: number,
    size: number,
    type: "application" | "security" = "security",
    filters?: {
      dateFrom?: string;
      dateTo?: string;
      search?: string;
      userId?: string;
    }
  ): Observable<PaginatedResponse<Auditoria>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (filters) {
      if (filters.dateFrom) params = params.set("date_from", filters.dateFrom);
      if (filters.dateTo) params = params.set("date_to", filters.dateTo);
      if (filters.search) params = params.set("search", filters.search);
      if (filters.userId) params = params.set("user_id", filters.userId.toString());
    }

    return this.http.get<PaginatedResponse<Auditoria>>(`${this.auditUrl}/${type}`, {
      params,
    });
  }
}
