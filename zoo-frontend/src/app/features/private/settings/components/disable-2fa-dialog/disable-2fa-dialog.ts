import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { TwoFactorAuth } from "../../services";
import { ShowToast } from "@app/shared/services";
import { finalize } from "rxjs/operators";
import { Loader } from "@app/shared/components/loader";
import { PasswordModule } from "primeng/password";
import { AuthStore } from "@stores/auth.store";

@Component({
  selector: "app-disable-2fa-dialog",
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    MessageModule,
    Loader,
    PasswordModule,
  ],
  templateUrl: "./disable-2fa-dialog.html",
  styleUrls: ["./disable-2fa-dialog.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Disable2faDialog {
  private readonly fb = inject(FormBuilder);
  private readonly twoFactorService = inject(TwoFactorAuth);
  private readonly toastService = inject(ShowToast);
  private readonly authStore = inject(AuthStore);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected visible = true;
  protected readonly isDisabling = signal(false);
  protected readonly formSubmitted = signal(false);

  protected readonly disableForm = this.fb.group({
    password: ["", [Validators.required]],
  });

  protected isInvalid(fieldName: string): boolean {
    const field = this.disableForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected onConfirm(): void {
    this.formSubmitted.set(true);

    if (this.disableForm.valid) {
      this.isDisabling.set(true);

      this.twoFactorService
        .disable2FA(this.disableForm.value.password!)
        .pipe(finalize(() => this.isDisabling.set(false)))
        .subscribe({
          next: () => {
            this.toastService.showSuccess(
              "2FA Deshabilitado",
              "La autenticación de dos factores ha sido deshabilitada",
            );
            this.authStore.set2FAStatus(false);
            this.visible = false;
            this.confirmed.emit();
          },
          error: (error) => {
            let errorMessage = "Error al deshabilitar 2FA";

            if (error.status === 401) {
              errorMessage = "Contraseña incorrecta";
            }

            this.toastService.showError("Error", errorMessage);
            this.authStore.set2FAStatus(true);
          },
        });
    }
  }

  protected onCancel(): void {
    this.visible = false;
    this.cancelled.emit();
  }
}
