import { Routes } from "@angular/router";

export default [
  {
    path: "login",
    title: "Iniciar sesión",
    loadComponent: () => import("./pages/login/login"),
  },
  {
    path: "signup",
    title: "Registrarse",
    loadComponent: () => import("./pages/signup/signup"),
  },
  {
    path: "forgot-password",
    title: "Recuperar contraseña",
    loadComponent: () => import("./pages/forgot-password/forgot-password"),
  },
  {
    path: "reset-password",
    title: "Restablecer contraseña",
    loadComponent: () => import("./pages/reset-password/reset-password"),
  },
  {
    path: "verify-2fa",
    title: "Verificacion en 2 pasos",
    loadComponent: () => import("./pages/two-factor/two-factor"),
  },
] as Routes;
