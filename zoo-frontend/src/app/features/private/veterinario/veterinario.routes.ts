import { Routes } from "@angular/router";

export default [
  {
    path: "dashboard",
    title: "Dashboard Veterinario",
    loadComponent: () => import("./dashboard/dashboard"),
  },
  {
    path: "dietas",
    loadComponent: () => import("./gestion-dietas/gestion-dietas"),
    children: [
      {
        path: "",
        redirectTo: "lista",
        pathMatch: "full",
      },
      {
        path: "crear",
        loadComponent: () =>
          import("./gestion-dietas/components/crear-dieta/crear-dieta"),
      },
      {
        path: "editar/:id",
        loadComponent: () =>
          import("./gestion-dietas/components/crear-dieta/crear-dieta"),
      },
      {
        path: "lista",
        title: "Lista de Dietas",
        loadComponent: () =>
          import("./gestion-dietas/components/lista-dietas/lista-dietas"),
      },
    ],
  },
  {
    path: "mis-tareas",
    title: "Mis Tareas",
    loadComponent: () => import("./mis-tareas/mis-tareas"),
  },
  {
    path: "historiales",
    loadComponent: () => import("./gestion-historiales/gestion-historiales"),
    children: [
      {
        path: "",
        redirectTo: "lista",
        pathMatch: "full",
      },
      {
        path: "lista",
        title: "Historiales Clínicos",
        loadComponent: () =>
          import("./gestion-historiales/components/historial/lista-historiales/lista-historiales"),
      },
      {
        path: "crear",
        title: "Nuevo Historial",
        loadComponent: () =>
          import("./gestion-historiales/components/historial/crear-historial/crear-historial"),
      },
      {
        path: "configuracion",
        children: [
          {
            path: "tipos-atencion",
            title: "Configurar Tipos de Atención",
            loadComponent: () =>
              import("./gestion-historiales/components/configuracion/tipos-atencion/tipos-atencion"),
          },
          {
            path: "tipos-examen",
            title: "Configurar Tipos de Examen",
            loadComponent: () =>
              import("./gestion-historiales/components/configuracion/tipos-examen/tipos-examen"),
          },
        ],
      },
    ],
  },
  {
    path: "historiales/:id",
    title: "Detalle Historial",
    loadComponent: () =>
      import("./gestion-historiales/components/historial/detalle-historial/detalle-historial"),
  },
  {
    path: "",
    redirectTo: "mis-tareas",
    pathMatch: "full",
  },
] as Routes;
