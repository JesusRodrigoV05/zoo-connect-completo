import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { Observable } from "rxjs";
import {
  ChartDataPoint,
  DashboardKpis,
  TasksTodayChart,
} from "../../models/dashboard/dashboard.model";

@Injectable({
  providedIn: "root",
})
export class GetDashboardData {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/dashboards`;

  getKpis(): Observable<DashboardKpis> {
    return this.http.get<DashboardKpis>(`${this.apiUrl}/kpis`);
  }

  getAnimalsChart(
    groupBy: "clase" | "familia" | "orden" | "filo" = "clase",
  ): Observable<ChartDataPoint[]> {
    const params = new HttpParams().set("group_by", groupBy);
    return this.http.get<ChartDataPoint[]>(
      `${this.apiUrl}/charts/animals-by-species`,
      { params },
    );
  }

  getTasksTodayChart(): Observable<TasksTodayChart> {
    return this.http.get<TasksTodayChart>(
      `${this.apiUrl}/charts/tasks-today-status`,
    );
  }
}
