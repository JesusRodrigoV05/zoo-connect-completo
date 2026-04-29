import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ShowToast } from "@app/shared/services";
import { AdminRolesService, RoleDetail, RolePermissionState, RolePermissionToggle } from "../../../../services/admin-roles";
import { PermissionCatalogItem } from "../../../../services/permissions";

@Component({
  selector: "app-editar-permisos",
  standalone: true,
  imports: [CommonModule, ButtonModule, CheckboxModule, FormsModule],
  templateUrl: "./editar-permisos.html",
  styleUrl: "./editar-permisos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditarPermisos {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly service = inject(AdminRolesService);
  private readonly toast = inject(ShowToast);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly role = signal<RoleDetail | null>(null);
  protected readonly catalog = signal<PermissionCatalogItem[]>([]);
  protected readonly permissions = signal<RolePermissionState[]>([]);

  constructor() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.loadRole(+id);
    }
  }

  protected loadRole(id: number): void {
    this.loading.set(true);
    this.service
      .getRoleById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (role: RoleDetail) => {
          this.role.set(role);
          this.permissions.set(role.permissions);
        },
        error: () => {
          this.toast.showError("Error", "No se pudo cargar el rol");
          this.router.navigate(["/admin/roles"]);
        },
      });

    this.service
      .getPermissionCatalog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (catalog: PermissionCatalogItem[]) => {
          this.catalog.set(catalog);
        },
      });
  }

  protected isPermissionAllowed(permissionId: number): boolean {
    const perms = this.permissions();
    return perms.some((p) => p.id === permissionId && p.allowed);
  }

  protected togglePermission(permissionId: number, checked: boolean): void {
    this.permissions.update((perms) => {
      const existing = perms.find((p) => p.id === permissionId);
      const catalogPermission = this.catalog().find((p) => p.id === permissionId);

      if (existing) {
        return perms.map((p) =>
          p.id === permissionId ? { ...p, allowed: checked } : p
        );
      }

      if (catalogPermission) {
        return [
          ...perms,
          {
            id: catalogPermission.id,
            code: catalogPermission.code,
            name: catalogPermission.name,
            description: catalogPermission.description,
            module: catalogPermission.module,
            is_active: catalogPermission.is_active,
            allowed: checked,
          },
        ];
      }

      return perms;
    });
  }

  protected save(): void {
    const role = this.role();
    if (!role) return;

    this.saving.set(true);
    const payload: RolePermissionToggle[] = this.permissions().map((p) => ({
      permission_id: p.id,
      allowed: p.allowed,
    }));

    this.service
      .updateRolePermissions(role.id, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          this.toast.showSuccess("Éxito", "Permisos actualizados correctamente");
          this.router.navigate(["/admin/roles"]);
        },
        error: (err: HttpErrorResponse) => {
          this.toast.showError("Error", err.message || "No se pudieron guardar los permisos");
        },
      });
  }

  protected cancel(): void {
    this.router.navigate(["/admin/roles"]);
  }

  protected getPermissionsByModule(): { module: string; permissions: PermissionCatalogItem[] }[] {
    const catalog = this.catalog();
    const modules = [...new Set(catalog.map((p) => p.module))];
    return modules.map((module) => ({
      module,
      permissions: catalog.filter((p) => p.module === module),
    }));
  }
}