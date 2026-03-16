import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FetchWeather } from "../../services/fetch-weather";
import {
  AsyncPipe,
  DecimalPipe,
  DatePipe,
  NgOptimizedImage,
} from "@angular/common";
import { ZooHours } from "../../services/zoo-hours";
import { ZooWeather } from "../../models/weather.model";
import { Observable, of } from "rxjs";

@Component({
  selector: "app-weather-section",
  imports: [AsyncPipe, DecimalPipe, DatePipe, NgOptimizedImage],
  templateUrl: "./weather-section.html",
  styleUrl: "./weather-section.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WeatherSection {
  weatherService = inject(FetchWeather);
  private zooHours = inject(ZooHours);
  protected $weather = signal<Observable<ZooWeather | null>>(of(null));

  protected today = new Date();
  protected zooStatus = this.zooHours.getStatus();

  constructor() {
    afterNextRender(() => {
      this.$weather.set(this.weatherService.getWeather("La Paz"));
    });
  }
}
