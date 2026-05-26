import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection, isDevMode,
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
  withHttpTransferCacheOptions,
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
import { CustomTitleStrategy } from "./core/services/custom-title-strategy";
import { provideServiceWorker } from '@angular/service-worker';

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
    provideClientHydration(withEventReplay(), withIncrementalHydration(), withHttpTransferCacheOptions({ includePostRequests: false })),
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

      return authStore.initializeAuth().then(() => {});
    }),
    { provide: TitleStrategy, useClass: CustomTitleStrategy }, provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
  ],
};
