import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthStore } from "../stores/auth.store";

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authStore = inject(AuthStore);
  const requiredRoles = route.data["requiredRoles"] as string[];
  const requiredPermissions = route.data["requiredPermissions"] as string[];

  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(["/login"], {
      queryParams: { returnUrl: state.url },
    });
  }

  if (requiredRoles && requiredRoles.length > 0) {
    const userRole = authStore.userRole();
    const userRoleName = userRole?.nombre;

    if (!userRoleName || !requiredRoles.includes(userRoleName)) {
      return router.parseUrl("/404");
    }
  }

  if (requiredPermissions && requiredPermissions.length > 0) {
    const missingPermission = requiredPermissions.some(
      (permission) => !authStore.hasPermission(permission),
    );

    if (missingPermission) {
      return router.parseUrl("/404");
    }
  }

  return true;
};

export const loggedGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authStore = inject(AuthStore);

  if (authStore.isAuthenticated()) {
    return router.parseUrl("/inicio");
  }

  return true;
};
