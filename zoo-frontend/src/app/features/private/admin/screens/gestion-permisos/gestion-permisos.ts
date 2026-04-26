import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TagModule } from "primeng/tag";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MainContainer } from "@app/shared/components/main-container";
import { AdminPermissionsService, PermissionCatalogItem, PermissionMatrixUser, UpdatePermissionPayload } from "../../services/permissions";
import { ShowToast } from "@app/shared/services";
import { afterNextRender } from "@angular/core";
import { OnboardingService } from "@app/shared/services/onboarding.service";

@Component({
  selector: "app-gestion-permisos",
  standalone: true,
  imports: [CommonModule, ButtonModule, InputTextModule, TagModule, MainContainer],
  templateUrl: "./gestion-permisos.html",
  styleUrl: "./gestion-permisos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GestionPermisos {
  private readonly service = inject(AdminPermissionsService);
  private readonly toast = inject(ShowToast);
  private readonly destroyRef = inject(DestroyRef);
  private readonly onboarding = inject(OnboardingService);
  private tourPrompted = false;

  protected readonly loading = signal(true);
  protected readonly savingUserId = signal<number | null>(null);
  protected readonly search = signal("");
  protected readonly matrix = signal<PermissionMatrixUser[]>([]);
  protected readonly permissions = signal<PermissionCatalogItem[]>([]);
  protected readonly dirtyUsers = signal<Record<number, boolean>>({});

  protected readonly filteredUsers = computed(() => {
    const query = this.search().trim().toLowerCase();
    const users = this.matrix();

    if (!query) {
      return users;
    }

    return users.filter((user) =>
      [user.username, user.email, user.role_name]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  });

  constructor() {
    effect(() => {
      this.loadMatrix();
    });
  }

  protected loadMatrix(): void {
    this.loading.set(true);

    this.service
      .getPermissionMatrix({ search: this.search() || null })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.permissions.set(response.permissions);
          this.matrix.set(response.items);
          this.dirtyUsers.set({});
          if (!this.tourPrompted) {
            this.tourPrompted = true;
            afterNextRender(() => {
              this.onboarding.startTourIfFirstVisit("admin-permisos-osi");
            });
          }
        },
        error: () => {
          this.toast.showError(
            "Error",
            "No se pudo cargar la matriz de permisos",
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

  protected isPermissionAllowed(user: PermissionMatrixUser, permissionId: number): boolean {
    return user.permissions.some(
      (permission) => permission.id === permissionId && permission.allowed,
    );
  }

  protected togglePermission(
    userId: number,
    permissionId: number,
    checked: boolean,
  ): void {
    this.matrix.update((users) =>
      users.map((user) => {
        if (user.id !== userId) {
          return user;
        }

        const nextPermissions = user.permissions.filter(
          (permission) => permission.id !== permissionId,
        );

        const permissionDefinition = this.permissions().find(
          (permission) => permission.id === permissionId,
        );

        if (permissionDefinition) {
          nextPermissions.push({
            ...permissionDefinition,
            allowed: checked,
            source: "user",
          });
        }

        this.dirtyUsers.update((state) => ({ ...state, [userId]: true }));

        return { ...user, permissions: nextPermissions };
      }),
    );
  }

  protected saveUserPermissions(user: PermissionMatrixUser): void {
    this.savingUserId.set(user.id);

    const payload: UpdatePermissionPayload[] = this.permissions().map((permission) => ({
      permission_id: permission.id,
      allowed: this.isPermissionAllowed(user, permission.id),
    }));

    this.service
      .updateUserPermissions(user.id, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.savingUserId.set(null)),
      )
      .subscribe({
        next: (updatedUser) => {
          this.matrix.update((users) =>
            users.map((item) => (item.id === updatedUser.id ? updatedUser : item)),
          );
          this.dirtyUsers.update((state) => {
            const next = { ...state };
            delete next[user.id];
            return next;
          });
          this.toast.showSuccess(
            "Permisos actualizados",
            `Se guardaron los permisos de ${updatedUser.username}`,
          );
        },
        error: () => {
          this.toast.showError(
            "Error",
            "No se pudieron guardar los permisos del usuario",
          );
        },
      });
  }

  protected getPermissionBadgeSeverity(permission: PermissionMatrixUser["permissions"][number]): "success" | "danger" | "info" {
    if (permission.allowed) return "success";
    if (permission.source === "user") return "danger";
    return "info";
  }
}