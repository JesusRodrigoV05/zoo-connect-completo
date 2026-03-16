import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { map } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GenerarReportes {
  private http = inject(HttpClient);
  private readonly API_URL = `${environment.apiUrl}/reportes`;

  downloadDiario(fecha: Date) {
    const params = new HttpParams().set("fecha", this.formatDate(fecha));

    return this.http
      .get(`${this.API_URL}/diario`, {
        params,
        responseType: "blob",
      })
      .pipe(
        map((blob) =>
          this.triggerDownload(
            blob,
            `diario_operativo_${this.formatDate(fecha)}.pdf`,
          ),
        ),
      );
  }

  downloadFichaClinica(historialId: number) {
    return this.http
      .get(`${this.API_URL}/fichas-clinicas/${historialId}`, {
        responseType: "blob",
      })
      .pipe(
        map((blob) =>
          this.triggerDownload(blob, `ficha_clinica_${historialId}.pdf`),
        ),
      );
  }

  downloadKardex(startDate: Date, endDate: Date) {
    const params = new HttpParams()
      .set("start_date", this.formatDate(startDate))
      .set("end_date", this.formatDate(endDate));

    return this.http
      .get(`${this.API_URL}/kardex`, {
        params,
        responseType: "blob",
      })
      .pipe(map((blob) => this.triggerDownload(blob, `kardex_inventario.pdf`)));
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  private triggerDownload(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }
}
