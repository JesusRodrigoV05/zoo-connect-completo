import { Routes } from "@angular/router";

const osiRoutes: Routes = [
  {
    path: "dashboard",
    title: "Panel OSI",
    data: { requiredPermissions: ["view_admin_dashboard"] },
    loadComponent: () =>
      import("../admin/screens/dashboard/dashboard"),
  },
  {
    path: "roles-accesos",
    title: "Roles y Accesos",
    data: { requiredPermissions: ["manage_permissions"] },
    loadComponent: () =>
      import("../admin/screens/gestion-permisos/gestion-permisos"),
  },
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
  },
];

export default osiRoutes;
