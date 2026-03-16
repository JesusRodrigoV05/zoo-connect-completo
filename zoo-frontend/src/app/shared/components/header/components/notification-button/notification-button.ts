import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { Notificaciones } from "@app/shared/services/notificaciones";
import { ButtonModule } from "primeng/button";
import { MenuModule } from "primeng/menu";
import { OverlayBadgeModule } from "primeng/overlaybadge";
import { PopoverModule } from "primeng/popover";
import { NotificationItem } from "../notification-item";
import { Notificacion } from "@models/notificaciones";
import { Tooltip } from "primeng/tooltip";
import { RouterLink } from "@angular/router";
import { ZooIcon } from "@app/shared/components/ui/zoo-icon";

@Component({
  selector: "zoo-notification-button",
  imports: [
    ButtonModule,
    OverlayBadgeModule,
    MenuModule,
    PopoverModule,
    NotificationItem,
    Tooltip,
    RouterLink,
    ZooIcon,
  ],
  templateUrl: "./notification-button.html",
  styleUrl: "./notification-button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationButton {
  private notificacionesService = inject(Notificaciones);

  protected readonly notificaciones = signal<Notificacion[]>(
    this.notificacionesService.getMockNotificaciones(),
  );

  protected readonly noLeidasCuenta = computed(() => {
    return this.notificaciones()
      ? this.notificaciones().filter((n) => !n.leido).length
      : 0;
  });

  iconAnimation = computed(() =>
    this.noLeidasCuenta() > 0 ? "tada" : "tada-hover",
  );

  showNotifications(event: Event): void {}

  markAllRead(): void {
    const current = this.notificaciones();
    if (!current?.length) return;
    this.notificaciones.set(current.map((n) => ({ ...n, leido: true })));
  }

  markOneRead(idNotificacion: number | string): void {
    const current = this.notificaciones();
    if (!current?.length) return;
    this.notificaciones.set(
      current.map((n) =>
        n.idNotificacion === idNotificacion ? { ...n, leido: true } : n,
      ),
    );
  }
}
