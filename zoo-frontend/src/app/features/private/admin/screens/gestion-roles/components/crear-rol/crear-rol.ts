import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FormsModule } from "@angular/forms";
import { HttpErrorResponse } from "@angular/common/http";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { ShowToast } from "@app/shared/services";
import { AdminRolesService } from "../../../../services/admin-roles";

@Component({
  selector: "app-crear-rol",
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, FormsModule],
  templateUrl: "./crear-rol.html",
  styleUrl: "./crear-rol.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearRol {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected readonly service = inject(AdminRolesService);
  private readonly toast = inject(ShowToast);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly roleName = signal("");
  protected readonly roleId = signal<number | null>(null);
  protected readonly isEditMode = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.roleId.set(+id);
      this.isEditMode.set(true);
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
        next: (role) => {
          this.roleName.set(role.name);
        },
        error: () => {
          this.toast.showError("Error", "No se pudo cargar el rol");
          this.router.navigate(["/admin/roles"]);
        },
      });
  }

  protected save(): void {
    if (!this.roleName().trim()) {
      this.toast.showError("Error", "El nombre del rol es requerido");
      return;
    }

    this.saving.set(true);

    if (this.isEditMode() && this.roleId()) {
      this.service
        .updateRole(this.roleId()!, this.roleName())
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.saving.set(false)),
        )
        .subscribe({
          next: () => {
            this.toast.showSuccess("Éxito", "Rol actualizado correctamente");
            this.router.navigate(["/admin/roles"]);
          },
          error: (err: HttpErrorResponse) => {
            this.toast.showError("Error", err.message || "No se pudo actualizar el rol");
          },
        });
    } else {
      this.service
        .createRole(this.roleName())
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.saving.set(false)),
        )
        .subscribe({
          next: () => {
            this.toast.showSuccess("Éxito", "Rol creado correctamente");
            this.router.navigate(["/admin/roles"]);
          },
          error: (err: HttpErrorResponse) => {
            this.toast.showError("Error", err.message || "No se pudo crear el rol");
          },
        });
    }
  }

  protected cancel(): void {
    this.router.navigate(["/admin/roles"]);
  }
}