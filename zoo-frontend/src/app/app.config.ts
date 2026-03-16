import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from "@angular/core";
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from "@angular/router";

import { routes } from "./app.routes";
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from "@angular/platform-browser";
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from "@angular/common/http";
import { authInterceptor } from "./core/interceptors";
import { providePrimeNG } from "primeng/config";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { ConfirmationService, MessageService } from "primeng/api";
import ZooPreset from "../theme/zoo-preset";
import { AuthStore } from "@stores/auth.store";
import { ShowToast } from "./shared/services";
import { CustomTitleStrategy } from "./core/services/custom-title-strategy";
import { provideCloudinaryLoader } from "@angular/common";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({ scrollPositionRestoration: "top" }),
    ),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    providePrimeNG({
      theme: {
        preset: ZooPreset,
        options: {
          darkModeSelector: ".dark-mode",
          cssLayer: false,
        },
      },
    }),
    provideAnimationsAsync(),
    MessageService,
    ConfirmationService,
    provideAppInitializer(async () => {
      const authStore = inject(AuthStore);
      const toastService = inject(ShowToast);

      return authStore.initializeAuth().then(() => {});
    }),
    { provide: TitleStrategy, useClass: CustomTitleStrategy },
  ],
};
