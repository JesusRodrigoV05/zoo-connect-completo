import { Routes } from "@angular/router";
import { authGuard, loggedGuard, veterinaryGuard } from "./core/guards";
import { cuidadorGuard } from "@guards/cuidador-guard";
import { unsavedChangesGuard } from "@guards/unsaved-changes-guard";

export const routes: Routes = [
  {
    path: "",
    loadComponent: () => import("./core/layout/layout"),
    children: [
      {
        path: "",
        redirectTo: "inicio",
        pathMatch: "full",
      },
      {
        path: "inicio",
        title: "Inicio",
        loadComponent: () => import("./features/public/home/home"),
      },
      {
        path: "perfil",
        title: "Perfil",
        loadComponent: () => import("./features/private/profile/profile"),
        canActivate: [authGuard],
      },
      {
        path: "servicios",
        title: "Servicios",
        loadComponent: () =>
          import("./features/public/servicios/screens/servicios/servicios"),
      },
      {
        path: "ajustes",
        title: "Ajustes",
        loadComponent: () => import("./features/private/settings/settings"),
        canActivate: [authGuard],
        children: [
          {
            path: "perfil",
            title: "Perfil",
            loadComponent: () =>
              import("./features/private/settings/components/perfil-ajustes/perfil-ajustes"),
          },
          {
            path: "seguridad",
            title: "Seguridad",
            loadComponent: () =>
              import("./features/private/settings/components/seguridad-ajustes/seguridad-ajustes"),
          },
          {
            path: "notificaciones",
            title: "Notificaciones",
            loadComponent: () =>
              import("./features/private/settings/components/notificaciones-ajustes/notificaciones-ajustes"),
          },
          {
            path: "",
            redirectTo: "perfil",
            pathMatch: "full",
          },
        ],
      },
      {
        path: "encuestas",
        title: "Encuestas",
        loadComponent: () =>
          import("./features/public/encuestas/screens/encuestas/encuestas"),
        children: [],
      },
      {
        path: "encuestas/:id",
        title: "Encuesta",
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import("./features/public/encuestas/screens/encuesta-detalle/encuesta-detalle"),
      },
      {
        path: "quizzes",
        title: "Quizzes",
        loadComponent: () =>
          import("./features/public/quizzes/screens/quizzes/quizzes"),
      },
      {
        path: "acerca-de",
        title: "Acerca de",
        loadComponent: () => import("./features/public/about/about"),
      },
      {
        path: "animales",
        title: "Animales",
        loadComponent: () =>
          import("./features/public/animales/screens/animales/animales"),
      },
      {
        path: "animales/:id",
        loadComponent: () =>
          import("./features/public/animales/screens/animal-detail/animal-detail"),
      },
      {
        path: "",
        redirectTo: "inicio",
        pathMatch: "full",
      },
    ],
  },
  {
    path: "",
    canActivateChild: [loggedGuard],
    loadChildren: () => import("./features/auth/auth.routes"),
  },
  {
    path: "admin",
    loadComponent: () =>
      import("./features/private/admin/layout/admin-layout/admin-layout"),
    canActivate: [authGuard],
    loadChildren: () => import("./features/private/admin/admin.routes"),
  },
  {
    path: "vet",
    loadComponent: () =>
      import("./features/private/veterinario/layout/vet-layout/vet-layout"),
    canActivate: [veterinaryGuard],
    loadChildren: () =>
      import("./features/private/veterinario/veterinario.routes"),
  },
  {
    path: "cuidador",
    loadComponent: () =>
      import("./features/private/cuidador/layout/vet-layout/vet-layout"),
    canActivate: [cuidadorGuard],
    loadChildren: () => import("./features/private/cuidador/cuidador.routes"),
  },
  {
    path: "404",
    loadComponent: () => import("./features/public/not-found/not-found"),
  },
  {
    path: "**",
    redirectTo: "404",
  },
];
