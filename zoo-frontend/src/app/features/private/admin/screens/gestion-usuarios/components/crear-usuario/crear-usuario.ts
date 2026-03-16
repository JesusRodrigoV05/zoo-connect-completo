import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { Validators, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MessageModule } from "primeng/message";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { NgTemplateOutlet } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { SelectModule } from "primeng/select";
import { ShowToast } from "@app/shared/services";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminUsuarios } from "@app/features/private/admin/services/admin-usuarios";
import { finalize } from "rxjs/operators";
import { Usuario, RolId } from "@app/core/models/usuario";
import { AuthStore } from "@stores/auth.store";
import { TooltipModule } from "primeng/tooltip";

interface RoleOption {
  label: string;
  value: RolId;
}

@Component({
  selector: "app-crear-usuario",
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MessageModule,
    InputTextModule,
    FloatLabel,
    ButtonModule,
    CardModule,
    SelectModule,
    TooltipModule,
  ],
  templateUrl: "./crear-usuario.html",
  styleUrl: "./crear-usuario.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearUsuario implements OnInit {
  private readonly zooToast = inject(ShowToast);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly adminUsuarios = inject(AdminUsuarios);
  private readonly authStore = inject(AuthStore);
  private currentUserId = this.authStore.userId();

  protected readonly formSubmitted = signal(false);
  protected readonly isLoading = signal(false);
  isEditMode = false;
  pageTitle = "";
  buttonText = "";

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (id) {
      this.isEditMode = true;
      this.pageTitle = "Actualizar Usuario";
      this.buttonText = "Guardar Cambios";

      this.adminUsuarios.getUserById(parseInt(id)).subscribe((user) => {
        console.log(user);
        this.usuarioForm.patchValue({
          email: user.email,
          username: user.username,
          rol: user.rol.id,
        });
      });
      this.usuarioForm.get("email")?.disable();
      if (this.currentUserId == parseInt(id)) {
        this.usuarioForm.get("rol")?.disable();
      }
    } else {
      this.isEditMode = false;
      this.pageTitle = "Crear Nuevo Usuario";
      this.buttonText = "Crear";
    }
  }

  protected readonly roleOptions: RoleOption[] = [
    { label: "Administrador", value: RolId.ADMIN },
    { label: "Veterinario", value: RolId.VETERINARIO },
    { label: "Cuidador", value: RolId.CUIDADOR },
    { label: "Visitante", value: RolId.VISITANTE },
  ];

  protected readonly usuarioForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    username: ["", [Validators.required, Validators.minLength(2)]],
    rol: [RolId.VISITANTE, [Validators.required]],
  });

  protected isInvalid(fieldName: string): boolean {
    const field = this.usuarioForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.usuarioForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors["email"]) {
        return "El formato del email no es válido";
      }
      if (field.errors["minlength"]) {
        const requiredLength = field.errors["minlength"].requiredLength;
        return `${this.getFieldDisplayName(
          fieldName,
        )} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return "";
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      email: "El email",
      username: "El nombre de usuario",
      rol: "El rol",
    };
    return fieldNames[fieldName] || fieldName;
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.usuarioForm.valid) {
      this.isLoading.set(true);

      if (!this.isEditMode) {
        const generatedPassword = this.usuarioForm.value.username! + "ABC123!";
        const usuarioData = {
          email: this.usuarioForm.value.email!,
          username: this.usuarioForm.value.username!,
          password: generatedPassword,
          fotoUrl: "",
          rol: {
            id: this.usuarioForm.value.rol!,
            nombre: this.getRoleName(this.usuarioForm.value.rol!),
          },
        };

        this.adminUsuarios
          .createUser(usuarioData)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              this.zooToast.showSuccess("Éxito", "Usuario creado exitosamente");
              this.router.navigate(["/admin/usuarios/lista"]);
            },
            error: (error) => this.zooToast.showError("Error", error.message),
          });
      } else {
        const idParam = this.route.snapshot.paramMap.get("id");
        const userId = idParam ? parseInt(idParam) : 0;

        if (!userId) {
          this.isLoading.set(false);
          return;
        }

        const updateData = {
          username: this.usuarioForm.value.username!,
          rol: {
            id: this.usuarioForm.value.rol!,
            nombre: this.getRoleName(this.usuarioForm.value.rol!),
          },
        };

        this.adminUsuarios
          .updateUser(userId, updateData)
          .pipe(finalize(() => this.isLoading.set(false)))
          .subscribe({
            next: () => {
              this.zooToast.showSuccess(
                "Actualizado",
                "Usuario modificado correctamente",
              );
              this.router.navigate(["/admin/usuarios/lista"]);
            },
            error: (error) => this.zooToast.showError("Error", error.message),
          });
      }
    } else {
      this.zooToast.showError(
        "Error",
        "Por favor, completa todos los campos requeridos",
      );
    }
  }

  protected onCancel(): void {
    this.router.navigate(["/admin/usuarios/lista"]);
  }

  private getRoleName(roleId: RolId): string {
    const role = this.roleOptions.find((r) => r.value === roleId);
    return role?.label || "";
  }
}
