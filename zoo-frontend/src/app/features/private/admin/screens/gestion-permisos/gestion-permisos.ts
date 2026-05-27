import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { forkJoin, finalize, of, switchMap } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MainContainer } from "@app/shared/components/main-container";
import { PermissionCatalogItem } from "../../services/permissions";
import { AdminRolesService, RoleDetail, RolePermissionToggle } from "../../services/admin-roles";
import { ShowToast } from "@app/shared/services";
import { afterNextRender } from "@angular/core";
import { OnboardingService } from "@app/shared/services/onboarding.service";
import { AuthStore } from "@stores/auth.store";

interface AccessSubColumn {
  key: string;
  label: string;
  permissionCodes: string[];
}

interface AccessGroup {
  key: string;
  label: string;
  headerPermissionCodes: string[];
  children: AccessSubColumn[];
}

interface StandaloneAccessColumn {
  key: string;
  label: string;
  permissionCodes: string[];
}

const ACCESS_GROUPS: AccessGroup[] = [
  {
    key: "animals",
    label: "Gestión de Animales",
    headerPermissionCodes: ["access_animals_management", "manage_animals", "manage_animal_catalog"],
    children: [
      { key: "species-list", label: "Lista de Especies", permissionCodes: ["animals_list_species"] },
      { key: "species-create", label: "Añadir Especie", permissionCodes: ["animals_create_species"] },
      { key: "habitats-list", label: "Lista de Hábitats", permissionCodes: ["animals_list_habitats"] },
      { key: "habitats-create", label: "Añadir Hábitat", permissionCodes: ["animals_create_habitats"] },
      { key: "animals-list", label: "Lista de Animales", permissionCodes: ["animals_list_animals"] },
      { key: "animals-create", label: "Añadir Animal", permissionCodes: ["animals_create_animals"] },
    ],
  },
  {
    key: "tasks",
    label: "Gestión de Tareas",
    headerPermissionCodes: ["access_tasks_management", "manage_tasks"],
    children: [
      { key: "operations", label: "Tablero de Operaciones", permissionCodes: ["tasks_operations_board"] },
      { key: "planner", label: "Planificador de Rutinas", permissionCodes: ["tasks_routines_planner"] },
      { key: "types", label: "Configuración Tipos", permissionCodes: ["tasks_types_config"] },
    ],
  },
  {
    key: "inventory",
    label: "Gestión Inventario",
    headerPermissionCodes: ["access_inventory_management", "view_inventory", "manage_inventory"],
    children: [
      { key: "product-create", label: "Crear producto", permissionCodes: ["inventory_create_product"] },
      { key: "products-list", label: "Lista de Productos", permissionCodes: ["inventory_list_products"] },
      { key: "supplier-create", label: "Crear proveedor", permissionCodes: ["inventory_create_supplier"] },
      { key: "suppliers-list", label: "Lista de Proveedores", permissionCodes: ["inventory_list_suppliers"] },
      { key: "types-list", label: "Lista de tipos", permissionCodes: ["inventory_list_types"] },
      { key: "units-list", label: "Lista de unidades", permissionCodes: ["inventory_list_units"] },
      { key: "movements", label: "Historial de movimientos", permissionCodes: ["inventory_movements_history"] },
    ],
  },
  {
    key: "users",
    label: "Gestión de Usuarios",
    headerPermissionCodes: ["access_users_management", "manage_users"],
    children: [
      { key: "user-create", label: "Crear Usuario", permissionCodes: ["users_create"] },
      { key: "users-list", label: "Lista de Usuarios", permissionCodes: ["users_list"] },
    ],
  },
  {
    key: "surveys",
    label: "Gestión de Encuestas",
    headerPermissionCodes: ["access_surveys_management", "manage_surveys"],
    children: [
      { key: "surveys-list", label: "Lista", permissionCodes: ["surveys_list"] },
      { key: "surveys-create", label: "Crear Encuesta", permissionCodes: ["surveys_create"] },
    ],
  },
  {
    key: "audit",
    label: "Auxiliar Auditoría",
    headerPermissionCodes: ["access_audit_assistant", "view_audit_logs"],
    children: [
      { key: "app-logs", label: "Log de Aplicación", permissionCodes: ["audit_application_logs"] },
      { key: "security-logs", label: "Log de Seguridad OSI", permissionCodes: ["audit_security_logs"] },
    ],
  },
];

const STANDALONE_COLUMNS: StandaloneAccessColumn[] = [
  { key: "dashboard", label: "Dashboard", permissionCodes: ["view_admin_dashboard"] },
  { key: "caregiver-tasks", label: "Mis tareas (Cuidador)", permissionCodes: ["caregiver_my_tasks", "manage_tasks"] },
  { key: "medical-tasks", label: "Mis Tareas (Médico)", permissionCodes: ["medical_my_tasks", "manage_veterinary_module"] },
  { key: "medical-diets", label: "Gestión de Dietas", permissionCodes: ["medical_diets", "manage_veterinary_module"] },
  { key: "medical-records", label: "Historiales Clínicos", permissionCodes: ["medical_clinical_records", "manage_veterinary_module"] },
  { key: "risk-matrix", label: "Matriz de Riesgos", permissionCodes: ["risk_matrix_access"] },
];

@Component({
  selector: "app-gestion-permisos",
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, TagModule, MainContainer],
  templateUrl: "./gestion-permisos.html",
  styleUrl: "./gestion-permisos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionPermisos {
  private readonly service = inject(AdminRolesService);
  private readonly toast = inject(ShowToast);
  private readonly destroyRef = inject(DestroyRef);
  private readonly onboarding = inject(OnboardingService);
  private readonly authStore = inject(AuthStore);
  private tourPrompted = false;

  protected readonly accessGroups = ACCESS_GROUPS;
  protected readonly standaloneColumns = STANDALONE_COLUMNS;
  protected readonly loading = signal(true);
  protected readonly savingRoleId = signal<number | null>(null);
  protected readonly search = signal("");
  protected readonly roles = signal<RoleDetail[]>([]);
  protected readonly permissions = signal<PermissionCatalogItem[]>([]);
  protected readonly dirtyRoles = signal<Record<number, boolean>>({});

  protected readonly leafColumnCount = computed(
    () =>
      this.accessGroups.reduce((count, group) => count + group.children.length, 0) +
      this.standaloneColumns.length,
  );

  protected readonly filteredRoles = computed(() => {
    const query = this.search().trim().toLowerCase();
    const roles = this.roles();

    if (!query) {
      return roles;
    }

    return roles.filter((role) => role.name.toLowerCase().includes(query));
  });

  constructor() {
    this.loadMatrix();
  }

  protected loadMatrix(): void {
    this.loading.set(true);

    forkJoin({
      catalog: this.service.getPermissionCatalog(),
      rolesPage: this.service.getRoles(1, 100, { search: this.search() || undefined }),
    })
      .pipe(
        switchMap(({ catalog, rolesPage }) => {
          this.permissions.set(catalog);
          const roleRequests = rolesPage.items.map((role) => this.service.getRolePermissions(role.id));
          return roleRequests.length ? forkJoin(roleRequests) : of([] as RoleDetail[]);
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (roles) => {
          this.roles.set(roles);
          this.dirtyRoles.set({});

        },
        error: () => {
          this.toast.showError(
            "Error",
            "No se pudo cargar la matriz de permisos por rol",
          );
        },
      });
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour("admin-permisos-osi");
  }

  protected onSearchChange(value: string): void {
    this.search.set(value);
  }

  protected isGroupEnabled(role: RoleDetail, group: AccessGroup): boolean {
    return group.headerPermissionCodes.every((permissionCode) =>
      this.roleHasPermission(role, permissionCode),
    );
  }

  protected isSubColumnAllowed(role: RoleDetail, subColumn: AccessSubColumn): boolean {
    return subColumn.permissionCodes.every((permissionCode) =>
      this.roleHasPermission(role, permissionCode),
    );
  }

  protected isStandaloneAllowed(role: RoleDetail, column: StandaloneAccessColumn): boolean {
    return column.permissionCodes.every((permissionCode) =>
      this.roleHasPermission(role, permissionCode),
    );
  }

  protected toggleGroup(roleId: number, group: AccessGroup, checked: boolean): void {
    const childCodes = group.children.flatMap((child) => child.permissionCodes);
    this.updateRolePermissionCodes(
      roleId,
      [...group.headerPermissionCodes, ...(checked ? [] : childCodes)],
      checked,
    );
  }

  protected toggleSubColumn(
    roleId: number,
    subColumn: AccessSubColumn,
    checked: boolean,
  ): void {
    this.updateRolePermissionCodes(roleId, subColumn.permissionCodes, checked);
  }

  protected toggleStandalone(
    roleId: number,
    column: StandaloneAccessColumn,
    checked: boolean,
  ): void {
    this.updateRolePermissionCodes(roleId, column.permissionCodes, checked);
  }

  protected saveRolePermissions(role: RoleDetail): void {
    this.savingRoleId.set(role.id);

    const payload: RolePermissionToggle[] = this.permissions().map((permission) => {
      const existingPermission = role.permissions.find(
        (rolePermission) => rolePermission.id === permission.id,
      );

      return {
        permission_id: permission.id,
        allowed: existingPermission?.allowed ?? false,
      };
    });

    this.service
      .updateRolePermissions(role.id, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.savingRoleId.set(null)),
      )
      .subscribe({
        next: (updatedRole) => {
          this.roles.update((roles) =>
            roles.map((item) => (item.id === updatedRole.id ? updatedRole : item)),
          );
          this.dirtyRoles.update((state) => {
            const next = { ...state };
            delete next[role.id];
            return next;
          });
          if (this.authStore.userRole()?.id === updatedRole.id) {
            void this.authStore.loadUserProfile();
          }
          this.toast.showSuccess(
            "Permisos actualizados",
            `Se guardaron los permisos del rol ${updatedRole.name}`,
          );
        },
        error: () => {
          this.toast.showError(
            "Error",
            "No se pudieron guardar los permisos del rol",
          );
        },
      });
  }

  private roleHasPermission(role: RoleDetail, permissionCode: string): boolean {
    return role.permissions.some(
      (permission) => permission.code === permissionCode && permission.allowed,
    );
  }

  private updateRolePermissionCodes(
    roleId: number,
    permissionCodes: string[],
    allowed: boolean,
  ): void {
    this.roles.update((roles) =>
      roles.map((role) => {
        if (role.id !== roleId) {
          return role;
        }

        let nextPermissions = [...role.permissions];

        for (const permissionCode of permissionCodes) {
          const existingPermission = nextPermissions.find(
            (permission) => permission.code === permissionCode,
          );

          if (existingPermission) {
            nextPermissions = nextPermissions.map((permission) =>
              permission.code === permissionCode
                ? { ...permission, allowed }
                : permission,
            );
            continue;
          }

          const permissionDefinition = this.permissions().find(
            (permission) => permission.code === permissionCode,
          );

          if (permissionDefinition) {
            nextPermissions.push({
              ...permissionDefinition,
              allowed,
            });
          }
        }

        this.dirtyRoles.update((state) => ({ ...state, [roleId]: true }));

        return { ...role, permissions: nextPermissions };
      }),
    );
  }
}
