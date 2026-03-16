import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  selector: "ajustes-nav",
  imports: [RouterLinkActive, RouterLink],
  templateUrl: "./ajustes-nav.html",
  styleUrls: ["./ajustes-nav.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AjustesNav {
  private router = inject(Router);

  navItems = [
    { label: "Perfil", route: "perfil", icon: "pi pi-user" },
    { label: "Seguridad", route: "seguridad", icon: "pi pi-shield" },
    {
      label: "Notificaciones",
      route: "notificaciones",
      icon: "pi pi-bell",
      disabled: true,
    },
  ];

  navigate(route: string) {
    this.router.navigate(["ajustes", route]);
  }
}
