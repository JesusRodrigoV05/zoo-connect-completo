import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Header } from "@app/shared/components";
import { ButtonModule } from "primeng/button";
import { DrawerModule } from "primeng/drawer";
import { SidebarVetMenu } from "../../components/sidebar-vet-menu";

@Component({
  selector: "app-vet-layout",
  imports: [Header, RouterOutlet, SidebarVetMenu, ButtonModule, DrawerModule],
  templateUrl: "./vet-layout.html",
  styleUrl: "./vet-layout.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VetLayout {
  protected drawerVisible = signal(false);

  toggleDrawer(): void {
    this.drawerVisible.update((visible) => !visible);
  }
}
