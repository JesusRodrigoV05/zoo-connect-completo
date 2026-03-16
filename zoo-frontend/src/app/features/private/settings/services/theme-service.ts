import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from "@angular/core";

export type Tema = "light" | "dark";

@Injectable({
  providedIn: "root",
})
export class Theme {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  private currentTheme = signal<Tema>("light");
  THEME_KEY = "app_theme";
  isDarkMode = computed(() => this.currentTheme() === "dark");

  constructor() {
    this.setTheme(this.getThemeFromLocalStorage());
  }

  toggleTheme() {
    if (this.currentTheme() === "light") {
      this.setTheme("dark");
    } else {
      this.setTheme("light");
    }
  }

  setTheme(theme: Tema) {
    this.currentTheme.set(theme);
    if (theme === "dark") {
      this.document.documentElement.classList.add("dark-mode");
    } else {
      this.document.documentElement.classList.remove("dark-mode");
    }
    this.setThemeInLocalStorage(theme);
  }

  setThemeInLocalStorage(theme: Tema) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.THEME_KEY, theme);
    }
  }

  getThemeFromLocalStorage(): Tema {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem(this.THEME_KEY) as Tema;
      if (stored) {
        return stored;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }
}
