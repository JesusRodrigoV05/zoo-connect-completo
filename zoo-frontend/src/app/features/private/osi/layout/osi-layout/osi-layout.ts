import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Header } from "@app/shared/components";
import { ButtonModule } from "primeng/button";
import { DrawerModule } from "primeng/drawer";
import { SidebarOsiMenu } from "../../components/sidebar-osi-menu/sidebar-osi-menu";

@Component({
  selector: "app-osi-layout",
  imports: [Header, RouterOutlet, ButtonModule, DrawerModule, SidebarOsiMenu],
  templateUrl: "./osi-layout.html",
  styleUrl: "./osi-layout.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OsiLayout {
  protected drawerVisible = signal(false);

  toggleDrawer(): void {
    this.drawerVisible.update((visible) => !visible);
  }
}
