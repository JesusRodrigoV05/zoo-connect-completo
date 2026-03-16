import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { GeneratedQuiz } from "@models/quiz";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GenerateQuiz {
  private http = inject(HttpClient);
  private apiUrl = "/api/generate-quiz";

  generate(
    amount?: number,
    difficulty?: string,
    category?: string,
  ): Observable<GeneratedQuiz> {
    let params = new HttpParams();

    if (amount) {
      params = params.set("amount", amount.toString());
    }
    if (difficulty) {
      params = params.set("difficulty", difficulty);
    }
    if (category && category.trim() !== "") {
      params = params.set("category", category);
    }

    return this.http.get<GeneratedQuiz>(this.apiUrl, { params });
  }
}
