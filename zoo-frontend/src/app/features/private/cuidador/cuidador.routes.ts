import { Routes } from "@angular/router";

export default [
  {
    path: "mis-tareas",
    title: "Mis Tareas",
    data: { requiredPermissions: ["caregiver_my_tasks"] },
    loadComponent: () => import("./mis-tareas/mis-tareas"),
  },
  {
    path: "",
    redirectTo: "mis-tareas",
    pathMatch: "full",
  },
] as Routes;
