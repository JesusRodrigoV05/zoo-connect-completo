import { inject } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateChildFn, Router, RouterStateSnapshot } from "@angular/router";
import { AuthStore } from "@stores/auth.store";

function collectRequiredPermissions(route: ActivatedRouteSnapshot): string[] {
  const requiredPermissions = new Set<string>();

  for (const snapshot of route.pathFromRoot ?? []) {
    const permissions = snapshot.data?.["requiredPermissions"] as string[] | undefined;
    if (permissions) {
      permissions.forEach((permission) => requiredPermissions.add(permission));
    }
  }

  return Array.from(requiredPermissions);
}

export const permissionGuard: CanActivateChildFn = (
  childRoute: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(["/login"], {
      queryParams: { returnUrl: state.url },
    });
  }

  const requiredPermissions = collectRequiredPermissions(childRoute);
  if (requiredPermissions.length === 0) {
    return true;
  }

  const missingPermission = requiredPermissions.some(
    (permission) => !authStore.hasPermission(permission),
  );

  if (missingPermission) {
    return router.parseUrl("/404");
  }

  return true;
};