import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '@stores/auth.store';
import { Usuario } from '@models/usuario/usuario.model';
import { UserAvatar } from '@app/shared/components/user-avatar';
import { UserInfo } from '../user-info';
import { MenuModule } from 'primeng/menu';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'zoo-profile-button',
  imports: [
    TooltipModule,
    MenuModule,
    RippleModule,
    UserAvatar,
    UserInfo,
    ButtonModule,
  ],
  templateUrl: './profile-button.html',
  styleUrl: './profile-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileButton {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  readonly user = this.authStore.usuario;
  readonly isAdmin = computed(() => this.authStore.isAdmin());
  readonly isVet = computed(() => this.authStore.isVeterinario());
  readonly isCuidador = computed(() => this.authStore.isCuidador());
  readonly isOsi = computed(() => this.authStore.isOsi());
  readonly defaultAvatarUrl = '/assets/images/default-avatar.jpg';
  
  protected readonly items = computed(() => [
    {
      items: [
        {
          label: 'Mi Perfil',
          icon: 'pi pi-user',
          command: () => {
            this.navigateToProfile();
          },
        },
        {
          label: 'Configuración',
          icon: 'pi pi-cog',
          command: () => {
            this.navigateToSettings();
          },
        },
        {
          separator: true,
        },
        {
          label: 'Cerrar Sesión',
          icon: 'pi pi-sign-out',
          command: () => {
            this.logout();
          },
        },
      ],
    },
  ]);

  protected readonly avatarUrl = computed(
    () => this.user()?.fotoUrl || this.defaultAvatarUrl
  );

  protected getRoleName(user: Usuario | null): string {
    return user?.rol?.nombre || 'Usuario';
  }

  protected readonly userName = computed(() => this.user()?.username || '');

  protected navigateToProfile(): void {
    this.router.navigate(['/perfil']);
  }

  protected navigateToSettings(): void {
    this.router.navigate(['/ajustes']);
  }

  protected logout(): void {
    this.authStore.logout();
  }
}
