import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { RestorePassword } from "../../services/restore-password";
import { ShowToast } from "@app/shared/services";
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { NgTemplateOutlet } from "@angular/common";
import { Loader } from "@app/shared/components/loader";
import { LogoImage } from "@app/shared/components";

@Component({
  selector: "app-forgot-password",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    MessageModule,
    NgTemplateOutlet,
    RouterLink,
    Loader,
    LogoImage,
  ],
  templateUrl: "./forgot-password.html",
  styleUrl: "./forgot-password.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgotPassword {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly restorePasswordService = inject(RestorePassword);
  private readonly toastService = inject(ShowToast);

  protected readonly isSending = signal(false);
  protected readonly formSubmitted = signal(false);

  protected readonly forgotForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
  });

  protected isInvalid(fieldName: string): boolean {
    const field = this.forgotForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);

    if (field?.errors) {
      if (field.errors["required"]) {
        return "El correo electrónico es requerido";
      }
      if (field.errors["email"]) {
        return "Ingresa un correo electrónico válido";
      }
    }

    return "";
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.forgotForm.valid) {
      this.isSending.set(true);

      this.restorePasswordService
        .forgotPassword(this.forgotForm.value.email!)
        .pipe(finalize(() => this.isSending.set(false)))
        .subscribe({
          next: (response) => {
            this.toastService.showSuccess("Correo Enviado", response.msg);
            this.router.navigate(["/login"]);
          },
          error: (error) => {
            let errorMessage = "Error al enviar correo de recuperación";

            if (error.status === 404) {
              errorMessage = "No existe una cuenta con este correo electrónico";
            } else if (error.status === 400) {
              errorMessage = "Correo electrónico inválido";
            }

            this.toastService.showError("Error", errorMessage);
          },
        });
    } else {
      this.toastService.showError(
        "Error",
        "Por favor, ingresa un correo electrónico válido",
      );
    }
  }
}
