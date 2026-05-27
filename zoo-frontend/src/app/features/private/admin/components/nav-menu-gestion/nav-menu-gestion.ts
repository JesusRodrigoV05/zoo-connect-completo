import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MenuButton } from '../../models';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthStore } from '@stores/auth.store';

@Component({
  selector: 'app-nav-menu-gestion',
  imports: [ButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-menu-gestion.html',
  styleUrl: './nav-menu-gestion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavMenuGestion {
  private readonly authStore = inject(AuthStore);
  buttons = input.required<MenuButton[]>();

  protected readonly visibleButtons = computed(() =>
    this.buttons().filter((button) =>
      !button.permisos?.length ||
      button.permisos.every((permiso) => this.authStore.hasPermission(permiso)),
    ),
  );
}
