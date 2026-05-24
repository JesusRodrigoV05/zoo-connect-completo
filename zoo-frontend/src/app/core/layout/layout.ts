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

  puedo = computed<boolean>(() => !this.authStore.isVisitante());

  private readonly hasPermission = (permission: string): boolean =>
    this.authStore.hasPermission(permission);

  private firstAllowedRoute(children: NavigationItem[], fallback: string): string {
    return children[0]?.route ?? fallback;
  }

  menuItems = computed<NavigationItem[]>(() => {
    const items: NavigationItem[] = [];

    if (this.hasPermission('view_admin_dashboard')) {
      items.push({
        text: 'Dashboard',
        icon: 'pi pi-th-large',
        route: this.authStore.isOsi() ? '/osi/dashboard' : '/admin/dashboard',
      });
    }

    if (this.hasPermission('manage_permissions')) {
      items.push({
        text: this.authStore.isOsi() ? 'Matriz de Roles' : 'Roles',
        icon: 'pi pi-shield',
        route: this.authStore.isOsi() ? '/osi/roles-accesos' : '/admin/roles',
      });
    }

    const animalsChildren: NavigationItem[] = [
      this.hasPermission('animals_list_species') && {
        text: 'Lista de Especies',
        icon: 'pi pi-list',
        route: '/admin/animales/especies/lista',
      },
      this.hasPermission('animals_create_species') && {
        text: 'Añadir Especie',
        icon: 'pi pi-plus',
        route: '/admin/animales/especies/crear',
      },
      this.hasPermission('animals_list_habitats') && {
        text: 'Lista de Hábitats',
        icon: 'pi pi-list',
        route: '/admin/animales/habitat/lista',
      },
      this.hasPermission('animals_create_habitats') && {
        text: 'Añadir Hábitat',
        icon: 'pi pi-plus',
        route: '/admin/animales/habitat/crear',
      },
      this.hasPermission('animals_list_animals') && {
        text: 'Lista de Animales',
        icon: 'pi pi-list',
        route: '/admin/animales/lista',
      },
      this.hasPermission('animals_create_animals') && {
        text: 'Añadir Animal',
        icon: 'pi pi-plus',
        route: '/admin/animales/crear',
      },
    ].filter(Boolean) as NavigationItem[];

    if (animalsChildren.length) {
      items.push({
        text: 'Gestión de Animales',
        icon: 'pi pi-id-card',
        route: this.firstAllowedRoute(animalsChildren, '/admin/animales'),
        children: animalsChildren,
      });
    }

    const tasksChildren: NavigationItem[] = [
      this.hasPermission('tasks_operations_board') && {
        text: 'Tablero de Operaciones',
        icon: 'pi pi-th-large',
        route: '/admin/tareas/operaciones',
      },
      this.hasPermission('tasks_routines_planner') && {
        text: 'Planificador de Rutinas',
        icon: 'pi pi-calendar',
        route: '/admin/tareas/planificador',
      },
      this.hasPermission('tasks_types_config') && {
        text: 'Configuración Tipos',
        icon: 'pi pi-cog',
        route: '/admin/tareas/configuracion',
      },
    ].filter(Boolean) as NavigationItem[];

    if (tasksChildren.length) {
      items.push({
        text: 'Gestión de Tareas',
        icon: 'pi pi-list-check',
        route: this.firstAllowedRoute(tasksChildren, '/admin/tareas'),
        children: tasksChildren,
      });
    }

    const inventoryChildren: NavigationItem[] = [
      this.hasPermission('inventory_create_product') && {
        text: 'Crear producto',
        icon: 'pi pi-plus',
        route: '/admin/inventario/crear',
      },
      this.hasPermission('inventory_list_products') && {
        text: 'Lista de Productos',
        icon: 'pi pi-list',
        route: '/admin/inventario/lista',
      },
      this.hasPermission('inventory_create_supplier') && {
        text: 'Crear proveedor',
        icon: 'pi pi-plus',
        route: '/admin/inventario/proveedor/crear',
      },
      this.hasPermission('inventory_list_suppliers') && {
        text: 'Lista de Proveedores',
        icon: 'pi pi-list',
        route: '/admin/inventario/proveedor/lista',
      },
      this.hasPermission('inventory_list_types') && {
        text: 'Lista de tipos',
        icon: 'pi pi-tags',
        route: '/admin/inventario/tipo/lista',
      },
      this.hasPermission('inventory_list_units') && {
        text: 'Lista de unidades',
        icon: 'pi pi-table',
        route: '/admin/inventario/unidades/lista',
      },
      this.hasPermission('inventory_movements_history') && {
        text: 'Historial de movimientos',
        icon: 'pi pi-history',
        route: '/admin/inventario/transacciones/lista',
      },
    ].filter(Boolean) as NavigationItem[];

    if (inventoryChildren.length) {
      items.push({
        text: 'Gestión Inventario',
        icon: 'pi pi-box',
        route: this.firstAllowedRoute(inventoryChildren, '/admin/inventario'),
        children: inventoryChildren,
      });
    }

    const usersChildren: NavigationItem[] = [
      this.hasPermission('users_create') && {
        text: 'Crear Usuario',
        icon: 'pi pi-user-plus',
        route: '/admin/usuarios/crear',
      },
      this.hasPermission('users_list') && {
        text: 'Lista de Usuarios',
        icon: 'pi pi-users',
        route: '/admin/usuarios/lista',
      },
    ].filter(Boolean) as NavigationItem[];

    if (usersChildren.length) {
      items.push({
        text: 'Gestión de Usuarios',
        icon: 'pi pi-users',
        route: this.firstAllowedRoute(usersChildren, '/admin/usuarios'),
        children: usersChildren,
      });
    }

    const surveysChildren: NavigationItem[] = [
      this.hasPermission('surveys_list') && {
        text: 'Lista',
        icon: 'pi pi-list',
        route: '/admin/encuestas/lista',
      },
      this.hasPermission('surveys_create') && {
        text: 'Crear Encuesta',
        icon: 'pi pi-plus',
        route: '/admin/encuestas/crear',
      },
    ].filter(Boolean) as NavigationItem[];

    if (surveysChildren.length) {
      items.push({
        text: 'Gestión de Encuestas',
        icon: 'pi pi-chart-line',
        route: this.firstAllowedRoute(surveysChildren, '/admin/encuestas'),
        children: surveysChildren,
      });
    }

    const auditChildren: NavigationItem[] = [
      this.hasPermission('audit_application_logs') && {
        text: 'Log de Aplicación',
        icon: 'pi pi-database',
        route: '/admin/audit/aplicacion',
      },
      this.hasPermission('audit_security_logs') && {
        text: 'Log de Seguridad OSI',
        icon: 'pi pi-shield',
        route: '/admin/audit/seguridad',
      },
    ].filter(Boolean) as NavigationItem[];

    if (auditChildren.length) {
      items.push({
        text: 'Auditoría',
        icon: 'pi pi-history',
        route: this.firstAllowedRoute(auditChildren, '/admin/audit/seguridad'),
        children: auditChildren,
      });
    }

    if (this.hasPermission('caregiver_my_tasks')) {
      items.push({
        text: 'Mis tareas',
        icon: 'pi pi-check-square',
        route: '/cuidador/mis-tareas',
      });
    }

    if (this.hasPermission('medical_my_tasks')) {
      items.push({
        text: 'Mis Tareas',
        icon: 'pi pi-check-square',
        route: '/vet/mis-tareas',
      });
    }

    if (this.hasPermission('medical_diets')) {
      items.push({
        text: 'Gestión de Dietas',
        icon: 'pi pi-apple',
        route: '/vet/dietas/lista',
        tooltip: 'Planificación nutricional',
      });
    }

    if (this.hasPermission('medical_clinical_records')) {
      items.push({
        text: 'Historiales Clínicos',
        icon: 'pi pi-clipboard',
        route: '/vet/historiales/lista',
        tooltip: 'Registro médico y seguimiento',
      });
    }

    return items;
  });

  toggleDrawer(): void {
    this.drawerVisible.update((visible) => !visible);
  }
}
