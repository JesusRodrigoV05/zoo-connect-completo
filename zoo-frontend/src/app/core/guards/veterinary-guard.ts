import { inject } from "@angular/core";
import { CanActivateChildFn, Router } from "@angular/router";
import { AuthStore } from "@stores/auth.store";

export const veterinaryGuard: CanActivateChildFn = (childRoute, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAdmin() && !authStore.hasPermission("manage_veterinary_module")) {
    return router.parseUrl("/404");
  }

  return true;
};
