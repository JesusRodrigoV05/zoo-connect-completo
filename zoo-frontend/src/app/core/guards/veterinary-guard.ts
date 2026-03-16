import { inject } from "@angular/core";
import { CanActivateChildFn, RedirectCommand, Router } from "@angular/router";
import { AuthStore } from "@stores/auth.store";

export const veterinaryGuard: CanActivateChildFn = (childRoute, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isVeterinario()) {
    console.log(authStore.isVeterinario());
    return router.parseUrl("/inicio");
  }

  return true;
};
