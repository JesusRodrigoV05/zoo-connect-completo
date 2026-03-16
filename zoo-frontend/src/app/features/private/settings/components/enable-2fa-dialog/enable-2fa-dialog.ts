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
import { ClipboardModule } from "@angular/cdk/clipboard";
import { AuthStore } from "@stores/auth.store";

@Component({
  selector: "app-enable-2fa-dialog",
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    MessageModule,
    Loader,
    ClipboardModule,
  ],
  templateUrl: "./enable-2fa-dialog.html",
  styleUrls: ["./enable-2fa-dialog.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Enable2faDialog {
  private readonly fb = inject(FormBuilder);
  private readonly twoFactorService = inject(TwoFactorAuth);
  private readonly toastService = inject(ShowToast);
  private readonly authStore = inject(AuthStore);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected visible = true;
  protected readonly isLoading = signal(true);
  protected readonly isVerifying = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly showBackupCodes = signal(false);
  protected readonly secret = signal("");
  protected readonly qrCodeDataUrl = signal("");
  protected readonly backupCodes = signal<string[]>([]);

  protected readonly verifyForm = this.fb.group({
    code: ["", [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  constructor() {
    this.loadQRCode();
  }

  private loadQRCode(): void {
    this.isLoading.set(true);

    this.twoFactorService
      .enable2FA()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (response) => {
          this.secret.set(response.secret);
          this.generateQRCode(response.otpauth_uri);
        },
        error: (error: any) => {
          this.toastService.showError(
            "Error",
            "No se pudo generar el código QR",
          );
          this.onCancel();
        },
      });
  }

  private generateQRCode(otpauthUri: string): void {
    import("qrcode").then((QRCode) => {
      QRCode.default.toDataURL(otpauthUri, { width: 200 }, (err, url) => {
        if (err) {
          this.toastService.showError(
            "Error",
            "No se pudo generar el código QR",
          );
          return;
        }
        this.qrCodeDataUrl.set(url);
      });
    });
  }

  protected isInvalid(fieldName: string): boolean {
    const field = this.verifyForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected onVerify(): void {
    this.formSubmitted.set(true);

    if (this.verifyForm.valid) {
      this.isVerifying.set(true);

      this.twoFactorService
        .verify2FA(this.verifyForm.value.code!)
        .pipe(finalize(() => this.isVerifying.set(false)))
        .subscribe({
          next: (response) => {
            this.backupCodes.set(response.backup_codes);
            this.showBackupCodes.set(true);
            this.toastService.showSuccess(
              "2FA Habilitado",
              "La autenticación de dos factores ha sido activada",
            );
            this.authStore.set2FAStatus(true);
          },
          error: (error: any) => {
            console.error("Error al verificar 2FA:", error);
            let errorMessage =
              "Código incorrecto. Verifica tu app de autenticación";

            if (error.status === 400) {
              const detail = error.error?.detail || error.error?.message;
              errorMessage =
                detail ||
                "Código inválido o expirado. Asegúrate de ingresar el código actual de tu app";
            } else if (error.status === 422) {
              errorMessage = "Formato de código inválido. Debe ser 6 dígitos";
            }

            this.toastService.showError("Error al verificar 2FA", errorMessage);
            this.authStore.set2FAStatus(false);
          },
        });
    }
  }

  protected onSecretCopied(): void {
    this.toastService.showSuccess(
      "Copiado",
      "Código secreto copiado al portapapeles",
    );
  }

  protected onBackupCodesCopied(): void {
    this.toastService.showSuccess(
      "Copiado",
      "Códigos de respaldo copiados al portapapeles",
    );
  }

  protected downloadBackupCodes(): void {
    const content = `Códigos de Respaldo 2FA - ${this.authStore.nombreMarca()}\n\nGuarda estos códigos en un lugar seguro.\nCada código solo puede usarse una vez.\n\n${this.backupCodes().join("\n")}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "backup-codes.txt";
    link.click();
    window.URL.revokeObjectURL(url);

    this.toastService.showSuccess(
      "Descargado",
      "Códigos guardados exitosamente",
    );
  }

  protected onClose(): void {
    this.visible = false;
    this.confirmed.emit();
  }

  protected onCancel(): void {
    this.visible = false;
    this.cancelled.emit();
  }
}
