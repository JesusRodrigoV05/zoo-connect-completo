import { Routes } from "@angular/router";

export default [
  {
    path: "mis-tareas",
    title: "Mis Tareas",
    loadComponent: () => import("./mis-tareas/mis-tareas"),
  },
  {
    path: "",
    redirectTo: "mis-tareas",
    pathMatch: "full",
  },
] as Routes;
