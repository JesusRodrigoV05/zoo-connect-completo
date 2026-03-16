import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { Usuario } from "@app/core/models/usuario";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { AdminUsuarios } from "@app/features/private/admin/services/admin-usuarios";
import { ShowToast } from "@app/shared/services";
import { firstValueFrom } from "rxjs";

@Component({
  selector: "zoo-usuario-item",
  imports: [ButtonModule, CardModule, TagModule, TooltipModule],
  templateUrl: "./usuario-item.html",
  styleUrl: "./usuario-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsuarioItem {
  readonly usuario = input.required<Usuario>();
  readonly loggedInUserId = input<number | undefined>();
  readonly isAuthLoading = input<boolean>(true);

  private readonly router = inject(Router);
  private readonly usuariosService = inject(AdminUsuarios);
  private readonly showToast = inject(ShowToast);

  protected readonly isSelf = computed(() => {
    const currentUserId = this.loggedInUserId();
    const usuarioId = Number(this.usuario().id);

    if (currentUserId === undefined || currentUserId === 0) {
      return false;
    }

    return usuarioId === currentUserId;
  });

  protected editUser(): void {
    const userId = Number(this.usuario().id);
    this.router.navigate(["/admin/usuarios/editar", userId]);
  }

  protected async toggleUserStatus(): Promise<void> {
    if (this.isSelf()) {
      this.showToast.showWarning(
        "Acción no permitida",
        "No puedes desactivar tu propio usuario",
      );
      return;
    }
    try {
      const usuario = this.usuario();
      const userId = Number(usuario.id);
      const updatedUser = { ...usuario, activo: !usuario.activo };

      await firstValueFrom(
        this.usuariosService.updateUser(userId, updatedUser),
      );

      const action = usuario.activo ? "desactivado" : "reactivado";
      this.showToast.showSuccess(
        "Estado actualizado",
        `El usuario ha sido ${action} correctamente`,
      );
    } catch (error) {
      this.showToast.showError(
        "Error",
        "No se pudo actualizar el estado del usuario",
      );
    }
  }

  protected getSeverityForRole(
    roleId: number,
  ): "success" | "info" | "warn" | "danger" {
    switch (roleId) {
      case 1:
        return "danger";
      case 2:
        return "warn";
      case 3:
        return "success";
      case 4:
        return "info";
      default:
        return "info";
    }
  }
}
