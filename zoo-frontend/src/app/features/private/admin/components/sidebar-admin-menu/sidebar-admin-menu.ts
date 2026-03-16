import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { BadgeModule } from "primeng/badge";
import { RippleModule } from "primeng/ripple";
import { TooltipModule } from "primeng/tooltip";

export interface NavigationItem {
  readonly text: string;
  readonly icon: string;
  readonly route: string;
  readonly disabled?: boolean;
  readonly comingSoon?: boolean;
  readonly badge?: string | number;
  readonly tooltip?: string;
}

@Component({
  selector: "zoo-sidebar-admin-menu",
  imports: [
    RouterLink,
    RouterLinkActive,
    BadgeModule,
    TooltipModule,
    RippleModule,
  ],
  templateUrl: "./sidebar-admin-menu.html",
  styleUrl: "./sidebar-admin-menu.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarAdminMenu {
  protected readonly navigationItems = signal<NavigationItem[]>([
    {
      text: "Dashboard",
      icon: "pi pi-th-large",
      route: "/admin/dashboard",
    },
    {
      text: "Gestión de Animales",
      icon: "pi pi-id-card",
      route: "/admin/animales",
    },
    {
      text: "Gestión Tareas",
      icon: "pi pi-list-check",
      route: "/admin/tareas",
    },
    {
      text: "Gestión Inventario",
      icon: "pi pi-box",
      route: "/admin/inventario",
    },
    {
      text: "Gestión de Usuarios",
      icon: "pi pi-users",
      route: "/admin/usuarios",
    },
    {
      text: "Gestión de Encuestas",
      icon: "pi pi-chart-line",
      route: "/admin/encuestas",
    },
    /*
    {
      text: "Gestión de Noticias",
      icon: "pi pi-megaphone",
      route: "/admin/noticias",
    },
    */
    {
      text: "Auxiliar Auditoría",
      icon: "pi pi-history",
      route: "/admin/audit",
    },
  ]);
}
