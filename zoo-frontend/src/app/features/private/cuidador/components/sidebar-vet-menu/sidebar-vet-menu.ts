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
  selector: "zoo-sidebar-vet-menu",
  imports: [
    RouterLink,
    RouterLinkActive,
    BadgeModule,
    TooltipModule,
    RippleModule,
  ],
  templateUrl: "./sidebar-vet-menu.html",
  styleUrl: "./sidebar-vet-menu.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarVetMenu {
  rutaBaseVet = "/cuidador";

  protected readonly navigationItems = signal<NavigationItem[]>([
    {
      text: "Mis Tareas",
      icon: "pi pi-check-square",
      route: `${this.rutaBaseVet}/mis-tareas`,
      tooltip: "Consultas y procedimientos asignados",
    },
  ]);
}
