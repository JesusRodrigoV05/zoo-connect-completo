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
  private readonly auditUrl = `${this.apiUrl}/admin_users/audit-logs`;

  getAuditLogs(
    page: number,
    size: number
  ): Observable<PaginatedResponse<Auditoria>> {
    const params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    return this.http.get<PaginatedResponse<Auditoria>>(this.auditUrl, {
      params,
    });
  }
}
