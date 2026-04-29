import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TableModule } from "primeng/table";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { FormsModule } from "@angular/forms";
import { PaginatorModule } from "primeng/paginator";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ShowToast } from "@app/shared/services";
import { AdminRolesService, RoleItem } from "../../services/admin-roles";

@Component({
  selector: "app-gestion-roles",
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TagModule,
    TooltipModule,
    FormsModule,
    PaginatorModule,
  ],
  templateUrl: "./gestion-roles.html",
  styleUrl: "./gestion-roles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionRoles {
  private readonly router = inject(Router);
  private readonly service = inject(AdminRolesService);
  private readonly toast = inject(ShowToast);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly roles = signal<RoleItem[]>([]);
  protected readonly search = signal("");
  protected readonly totalRecords = signal(0);
  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly deleting = signal<number | null>(null);

  constructor() {
    this.loadRoles();
  }

  protected loadRoles(): void {
    this.loading.set(true);
    this.service
      .getRoles(this.page(), this.pageSize(), { search: this.search() || undefined })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.roles.set(response.items);
          this.totalRecords.set(response.total);
        },
        error: (err) => {
          this.toast.showError("Error", err.message || "No se pudieron cargar los roles");
        },
      });
  }

  protected onSearch(): void {
    this.page.set(1);
    this.loadRoles();
  }

  protected onPageChange(newPage: number): void {
    this.page.set(newPage);
    this.loadRoles();
  }

  protected goToEdit(roleId: number): void {
    this.router.navigate(["/admin/roles/editar", roleId]);
  }

  protected goToPermissions(roleId: number): void {
    this.router.navigate(["/admin/roles/permisos", roleId]);
  }

  protected createRole(): void {
    this.router.navigate(["/admin/roles/crear"]);
  }

  protected deleteRole(role: RoleItem): void {
    if (role.user_count > 0) {
      this.toast.showError(
        "No se puede eliminar",
        `El rol "${role.name}" tiene ${role.user_count} usuario(s) asignado(s)`,
      );
      return;
    }

    if (!confirm(`¿Está seguro de eliminar el rol "${role.name}"?`)) {
      return;
    }

    this.deleting.set(role.id);
    this.service
      .deleteRole(role.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.deleting.set(null)),
      )
      .subscribe({
        next: () => {
          this.toast.showSuccess("Eliminado", "Rol eliminado correctamente");
          this.loadRoles();
        },
        error: (err) => {
          this.toast.showError("Error", err.message || "No se pudo eliminar el rol");
        },
      });
  }
}