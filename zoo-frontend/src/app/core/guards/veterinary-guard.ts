import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "@stores/auth.store";

export const veterinaryGuard: CanActivateFn = async () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.usuario() && authStore.accessToken()) {
    await authStore.loadUserProfile();
  }

  if (!authStore.isVeterinario()) {
    return router.parseUrl("/inicio");
  }

  return true;
};
