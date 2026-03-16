import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { NgOptimizedImage } from "@angular/common";
import { Theme } from "@app/features/private/settings/services";
import { RouterLink } from "@angular/router";
import { Loader } from "../loader";

@Component({
  selector: "app-logo-image",
  imports: [NgOptimizedImage, RouterLink, Loader],
  templateUrl: "./logo-image.html",
  styleUrl: "./logo-image.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoImage {
  private readonly themeService = inject(Theme);

  readonly size = input<number>(120);
  readonly alt = input<string>("Zoo Connect Logo");
  private route = "/assets/logos/";

  readonly logoSrc = computed(() => {
    return this.themeService.isDarkMode()
      ? `${this.route}logo-oscuro.png`
      : `${this.route}logo-claro.png`;
  });

  readonly logoClasses = computed(() => {
    return `logo-image ${
      this.themeService.isDarkMode() ? "dark-theme" : "light-theme"
    }`;
  });
}
