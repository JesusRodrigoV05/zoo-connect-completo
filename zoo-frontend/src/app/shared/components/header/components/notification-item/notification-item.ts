import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Notificacion } from '@models/notificaciones';
import { ButtonModule } from 'primeng/button';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'zoo-notification-item',
  imports: [ButtonModule, OverlayBadgeModule, TooltipModule],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItem {
  notificacion = input<Notificacion | null>(null);
  markRead = output<number | string>();
}
