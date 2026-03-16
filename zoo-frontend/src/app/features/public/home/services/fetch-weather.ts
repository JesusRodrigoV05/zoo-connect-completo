import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import { Weather, ZooWeather } from "../models/weather.model";
import { weatherAdapter } from "../adapters";

@Injectable({
  providedIn: "root",
})
export class FetchWeather {
  private http = inject(HttpClient);

  getWeather(city: string): Observable<ZooWeather> {
    return this.http
      .get<Weather>(`/api/weather?city=${city}`)
      .pipe(map((response) => weatherAdapter(response)));
  }
}
