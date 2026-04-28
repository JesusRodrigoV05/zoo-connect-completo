import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Header } from '@shared/components/header';
import { Footer } from '@shared/components/footer';
import { RouterOutlet } from '@angular/router';
import { AuthStore } from '@stores/auth.store';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import {
  NavigationItem,
  SidebarMenu,
} from '@app/shared/components/sidebar-menu/sidebar-menu';

@Component({
  selector: 'zoo-layout',
  imports: [
    Header,
    Footer,
    RouterOutlet,
    ButtonModule,
    DrawerModule,
    SidebarMenu,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Layout {
  protected authStore = inject(AuthStore);
  protected drawerVisible = signal(false);
  rutaBaseVet = '/vet';
  rutaBaseCui = '/cuidador';

  puedo = computed<boolean>(() => !this.authStore.isVisitante());

  menuItems = computed<NavigationItem[]>(() => {
    if (this.authStore.isAdmin()) {
      return [
        {
          text: 'Dashboard',
          icon: 'pi pi-th-large',
          route: '/admin/dashboard',
        },
        {
          text: 'Gestión de Animales',
          icon: 'pi pi-id-card',
          route: '/admin/animales',
        },
        {
          text: 'Gestión Tareas',
          icon: 'pi pi-list-check',
          route: '/admin/tareas',
        },
        {
          text: 'Gestión Inventario',
          icon: 'pi pi-box',
          route: '/admin/inventario',
        },
        {
          text: 'Gestión de Usuarios',
          icon: 'pi pi-users',
          route: '/admin/usuarios',
        },
        {
          text: 'Gestión de Encuestas',
          icon: 'pi pi-chart-line',
          route: '/admin/encuestas',
        },
        {
          text: 'Auxiliar Auditoría',
          icon: 'pi pi-history',
          route: '/admin/audit',
        },
      ];
    }

    if (this.authStore.isVeterinario()) {
      return [
        // {
        //   text: 'Dashboard Médico',
        //   icon: 'pi pi-heart-pulse',
        //   route: `${this.rutaBaseVet}/dashboard`,
        // },
        {
          text: 'Mis Tareas',
          icon: 'pi pi-check-square',
          route: `${this.rutaBaseVet}/mis-tareas`,
          tooltip: 'Consultas y procedimientos asignados',
        },
        {
          text: 'Gestión de Dietas',
          icon: 'pi pi-apple',
          route: `${this.rutaBaseVet}/dietas/`,
          tooltip: 'Planificación nutricional',
        },
        {
          text: 'Historiales Clínicos',
          icon: 'pi pi-clipboard',
          route: `${this.rutaBaseVet}/historiales/`,
          tooltip: 'Registro médico y seguimiento',
        },
      ];
    }

    if (this.authStore.isCuidador()) {
      return [
        {
          text: 'Mis Tareas',
          icon: 'pi pi-check-square',
          route: `${this.rutaBaseCui}/mis-tareas`,
          tooltip: 'Consultas y procedimientos asignados',
        },
      ];
    }

    if (this.authStore.isOsi()) {
      return [
        {
          text: 'Dashboard',
          icon: 'pi pi-th-large',
          route: '/osi/dashboard',
        },
        {
          text: 'Roles y Accesos',
          icon: 'pi pi-shield',
          route: '/osi/roles-accesos',
        },
      ];
    }

    return [];
  });

  toggleDrawer(): void {
    this.drawerVisible.update((visible) => !visible);
  }
}
