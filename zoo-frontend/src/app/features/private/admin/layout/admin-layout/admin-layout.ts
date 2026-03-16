import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { Footer, Header } from "@app/shared/components";
import { RouterOutlet } from "@angular/router";
import { SidebarAdminMenu } from "../../components/sidebar-admin-menu";
import { ButtonModule } from "primeng/button";
import { DrawerModule } from "primeng/drawer";

@Component({
  selector: "app-admin-layout",
  imports: [Header, RouterOutlet, SidebarAdminMenu, ButtonModule, DrawerModule],
  templateUrl: "./admin-layout.html",
  styleUrl: "./admin-layout.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AdminLayout {
  protected drawerVisible = signal(false);
  toggleDrawer(): void {
    this.drawerVisible.update((visible) => !visible);
  }
}
