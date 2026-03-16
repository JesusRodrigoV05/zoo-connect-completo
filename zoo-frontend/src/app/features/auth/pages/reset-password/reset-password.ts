import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { MainContainer } from "@app/shared/components/main-container";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { RestorePassword } from "../../services/restore-password";
import { ShowToast } from "@app/shared/services";
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { NgTemplateOutlet } from "@angular/common";
import { PasswordModule } from "primeng/password";
import { Loader } from "@app/shared/components/loader";
import { LogoImage } from "@app/shared/components";

@Component({
  selector: "app-reset-password",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    MessageModule,
    NgTemplateOutlet,
    PasswordModule,
    RouterLink,
    Loader,
    LogoImage,
  ],
  templateUrl: "./reset-password.html",
  styleUrl: "./reset-password.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPassword {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly restorePasswordService = inject(RestorePassword);
  private readonly toastService = inject(ShowToast);

  protected readonly isResetting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly token = signal<string>("");

  protected readonly resetForm = this.fb.group(
    {
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  constructor() {
    this.token.set(this.route.snapshot.queryParams["token"] || "");

    if (!this.token()) {
      this.toastService.showError("Error", "Token no válido");
      this.router.navigate(["/login"]);
    }
  }

  private passwordMatchValidator(form: any) {
    const password = form.get("password")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;

    if (password !== confirmPassword) {
      form.get("confirmPassword")?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  protected isInvalid(fieldName: string): boolean {
    const field = this.resetForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.resetForm.get(fieldName);

    if (field?.errors) {
      if (field.errors["required"]) {
        return `El campo ${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors["minlength"]) {
        const requiredLength = field.errors["minlength"].requiredLength;
        return `La contraseña debe tener al menos ${requiredLength} caracteres`;
      }
      if (field.errors["passwordMismatch"]) {
        return "Las contraseñas no coinciden";
      }
    }

    return "";
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      password: "Contraseña",
      confirmPassword: "Confirmación de contraseña",
    };
    return fieldNames[fieldName] || fieldName;
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.resetForm.valid && this.token()) {
      this.isResetting.set(true);

      this.restorePasswordService
        .resetPassword(this.token(), this.resetForm.value.password!)
        .pipe(finalize(() => this.isResetting.set(false)))
        .subscribe({
          next: (response) => {
            this.toastService.showSuccess("Éxito", response.msg);
            this.router.navigate(["/login"]);
          },
          error: (error) => {
            let errorMessage = "Error al restablecer contraseña";

            if (error.status === 400) {
              errorMessage = "Token inválido o expirado";
            } else if (error.status === 404) {
              errorMessage = "Usuario no encontrado";
            }

            this.toastService.showError("Error", errorMessage);
          },
        });
    } else {
      this.toastService.showError(
        "Error",
        "Por favor, completa todos los campos correctamente",
      );
    }
  }
}
