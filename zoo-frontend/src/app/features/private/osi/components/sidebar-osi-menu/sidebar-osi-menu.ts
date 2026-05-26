import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { RippleModule } from "primeng/ripple";

interface OsiNavigationItem {
  readonly text: string;
  readonly icon: string;
  readonly route: string;
}

@Component({
  selector: "zoo-sidebar-osi-menu",
  imports: [RouterLink, RouterLinkActive, RippleModule],
  templateUrl: "./sidebar-osi-menu.html",
  styleUrl: "./sidebar-osi-menu.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarOsiMenu {
  protected readonly navigationItems = signal<OsiNavigationItem[]>([
    {
      text: "Dashboard",
      icon: "pi pi-th-large",
      route: "/osi/dashboard",
    },
    {
      text: "Roles y Accesos",
      icon: "pi pi-shield",
      route: "/osi/roles-accesos",
    },
  ]);
}
