import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { inject } from "@angular/core/primitives/di";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { Noticia } from "@models/noticias/noticia.model";
import { delay, Observable, of } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminNoticias {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/noticias`;

  getAllNoticias(
    page: number,
    size: number,
  ): Observable<PaginatedResponse<Noticia>> {
    // ---------------------------------------------------------
    // 1. CÓDIGO REAL (COMENTADO TEMPORALMENTE)
    // ---------------------------------------------------------
    /*
        const params = new HttpParams()
          .set("page", page.toString())
          .set("size", size.toString());

        return this.http.get<PaginatedResponse<Noticia>>(this.apiUrl, { params });
        */

    // ---------------------------------------------------------
    // 2. CÓDIGO MOCK (SIMULACIÓN)
    // ---------------------------------------------------------

    // Generamos 'size' cantidad de noticias falsas para la página actual
    const mockItems: Noticia[] = Array.from({ length: size }).map((_, i) => {
      const index = (page - 1) * size + i + 1;
      return {
        id: index.toString(),
        titulo: `Noticia de prueba #${index}`,
        contenido: `Este es el contenido simulado para la noticia número ${index}.
                        Aquí podemos ver cómo se comporta el texto si es un poco más largo
                        para probar el diseño de grid y lista en la interfaz.`,
        // Alternamos imágenes para que se vea variado (algunas sin imagen)
        imagen:
          i % 3 === 0 ? "" : `https://picsum.photos/seed/${index}/500/300`,
        fechaPublicacion: new Date(), // Fecha actual
      };
    });

    // Simulamos la respuesta paginada
    const response: PaginatedResponse<Noticia> = {
      items: mockItems,
      total: 50, // Simulamos que hay 50 noticias en total en la BD
      page: page,
      size: size,
      pages: Math.ceil(50 / size),
    };

    // Retornamos con un delay de 800ms para probar el loading
    return of(response).pipe(delay(800));
  }

  deleteNoticia(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getNoticiaById(id: string): Observable<Noticia> {
    return this.http.get<Noticia>(`${this.apiUrl}/${id}`);
  }
}
