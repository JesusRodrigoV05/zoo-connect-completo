import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { MenuButton } from "@models/common/menu-button.mode";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-nav-menu-vet",
  imports: [ButtonModule, RouterLink, RouterLinkActive],
  templateUrl: "./nav-menu-vet.html",
  styleUrl: "./nav-menu-vet.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavMenuVet {
  buttons = input.required<MenuButton[]>();
}
