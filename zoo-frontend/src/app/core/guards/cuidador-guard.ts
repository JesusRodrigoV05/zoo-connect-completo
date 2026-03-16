import { inject } from "@angular/core";
import { CanActivateChildFn, RedirectCommand, Router } from "@angular/router";
import { AuthStore } from "@stores/auth.store";

export const cuidadorGuard: CanActivateChildFn = (childRoute, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isCuidador()) {
    console.log(authStore.isCuidador());
    return router.parseUrl("/inicio");
  }

  return true;
};
