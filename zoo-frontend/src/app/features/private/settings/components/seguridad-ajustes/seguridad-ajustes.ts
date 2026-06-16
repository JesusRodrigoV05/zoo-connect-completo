import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  signal,
} from "@angular/core";
import { NgClass } from "@angular/common";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CardModule } from "primeng/card";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { MessageModule } from "primeng/message";
import { Enable2faDialog } from "../enable-2fa-dialog/enable-2fa-dialog";
import { Disable2faDialog } from "../disable-2fa-dialog";
import { AuthStore } from "@stores/auth.store";
import { OnboardingService } from "@app/shared/services/onboarding.service";
import { PasswordHistoryComponent } from "../password-history/password-history";
import { Auth } from "@features/auth/services/auth";
import { ShowToast } from "@app/shared/services";
import { EncryptionService } from "@app/core/services/encryption.service";
import { evaluatePasswordStrength, isPasswordStrong, PasswordRules } from "@app/shared/utils/password-strength";

@Component({
  selector: "seguridad-ajustes",
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    CardModule,
    ToggleSwitchModule,
    ButtonModule,
    TooltipModule,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    Enable2faDialog,
    Disable2faDialog,
    PasswordHistoryComponent,
  ],
  templateUrl: "./seguridad-ajustes.html",
  styleUrls: ["./seguridad-ajustes.scss", "../settings-content.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SeguridadAjustes implements OnInit {
  private authStore = inject(AuthStore);
  private readonly onboarding = inject(OnboardingService);
  private readonly authService = inject(Auth);
  private readonly toast = inject(ShowToast);
  private readonly encryption = inject(EncryptionService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(PasswordHistoryComponent)
  private passwordHistory?: PasswordHistoryComponent;

  protected readonly showEnable2FA = signal(false);
  protected readonly showDisable2FA = signal(false);
  protected readonly requestingCode = signal(false);
  protected readonly codeRequested = signal(false);
  protected readonly submittingPassword = signal(false);
  protected readonly maskedPhoneFromServer = signal<string | null>(null);
  protected readonly updatingPhone = signal(false);
  protected newPhoneNumber = "";
  protected readonly codeCooldown = signal(0);

  protected twoFaModel = signal(this.authStore.twoFAenabled());
  private cooldownTimer?: ReturnType<typeof setInterval>;

  protected readonly changePasswordForm: FormGroup = this.fb.group(
    {
      currentPassword: ["", [Validators.required]],
      newPassword: ["", [Validators.required, Validators.minLength(12)]],
      confirmPassword: ["", [Validators.required]],
      verificationCode: ["", [Validators.required, Validators.minLength(6)]],
    },
    { validators: this.passwordMatchValidator },
  );

  protected rules: PasswordRules = {
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false,
    noRepeats: false,
    noSequence: false,
  };
  protected strengthPercent = 0;
  protected strengthLabel = "Debil";
  protected strengthClass = "weak";

  protected readonly passwordTips = [
    {
      title: "Usa una cancion favorita",
      example: "Que triste es mi ausencia",
      result: "QmEma#24",
      description: "Toma la primera letra de cada palabra + el ano",
    },
    {
      title: "Usa una fecha especial",
      example: "18 de junio - Cumpleanos",
      result: "18dJ#1806",
      description: "Combina numeros con la inicial del mes",
    },
    {
      title: "Usa un dicho popular",
      example: "Al que madruga Dios le ayuda",
      result: "aQmDlA#18",
      description: "Iniciales en minusculas + caracter especial + ano",
    },
    {
      title: "Usa una frase personal",
      example: "Mi gato feliz salta alto",
      result: "MgFsAl#23",
      description: "Iniciales de tus palabras favoritas",
    },
  ];

  ngOnInit(): void {
    this.newPassword.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: string) => this.onPasswordChange(value || ""));
  }

  protected on2FAToggle(enabled: boolean): void {
    if (enabled && !this.authStore.twoFAenabled()) {
      this.showEnable2FA.set(true);
    } else if (!enabled && this.authStore.twoFAenabled()) {
      this.showDisable2FA.set(true);
    } else {
      this.twoFaModel.set(this.authStore.twoFAenabled());
    }
  }

  /**
   * Inicia el tour guiado de la página de Seguridad.
   */
  protected startGuidedTour(): void {
    this.onboarding.startTour("settings-seguridad");
  }

  protected on2FAEnabled(): void {
    this.authStore.set2FAStatus(true);
    this.showEnable2FA.set(false);
  }

  protected on2FADisabled(): void {
    this.authStore.set2FAStatus(false);
    this.showDisable2FA.set(false);
  }

  protected onEnable2FACancelled(): void {
    this.twoFaModel.set(false);
    this.showEnable2FA.set(false);
  }

  protected onDisable2FACancelled(): void {
    this.twoFaModel.set(true);
    this.showDisable2FA.set(false);
  }

  protected async updatePhoneNumber(): Promise<void> {
    if (!this.newPhoneNumber) {
      this.toast.showError("Error", "Ingresa un número de teléfono válido.");
      return;
    }

    this.updatingPhone.set(true);
    this.authService.updatePhone(this.newPhoneNumber).subscribe({
      next: (response) => {
        this.updatingPhone.set(false);
        this.toast.showSuccess("Código enviado", response.message);
        // Aquí se podría abrir un diálogo de verificación si fuera necesario
      },
      error: (error) => {
        this.updatingPhone.set(false);
        this.toast.showError("Error", this.getErrorDetail(error));
      },
    });
  }
  protected get maskedPhone(): string {
    const serverPhone = this.maskedPhoneFromServer();
    if (serverPhone) return serverPhone;

    const phone = this.authStore.usuario()?.phoneNumber;
    if (!phone) return "tu numero registrado";

    const visible = phone.slice(-3);
    return `${"*".repeat(Math.max(phone.length - 3, 0))}${visible}`;
  }

  protected get canRequestCode(): boolean {
    return this.codeCooldown() === 0 && !this.requestingCode();
  }

  protected get canChangePassword(): boolean {
    return (
      this.changePasswordForm.valid &&
      this.codeRequested() &&
      isPasswordStrong(this.rules) &&
      !this.submittingPassword()
    );
  }

  protected async requestPasswordCode(): Promise<void> {
    if (!this.canRequestCode) return;

    this.requestingCode.set(true);
    this.authService.requestChangePasswordCode().subscribe({
      next: (response) => {
        this.maskedPhoneFromServer.set(response.masked_phone);
        this.codeRequested.set(true);
        this.requestingCode.set(false);
        this.startCooldown();
        this.toast.showSuccess("Codigo enviado", "Revisa el SMS enviado a tu celular registrado.");
      },
      error: (error) => {
        this.requestingCode.set(false);
        this.toast.showError("No se pudo enviar el codigo", this.getErrorDetail(error));
      },
    });
  }

  protected async changePassword(): Promise<void> {
    if (!this.canChangePassword) {
      this.markFormGroupTouched();
      return;
    }

    this.submittingPassword.set(true);
    try {
      const currentPassword = await this.encryption.encrypt(this.currentPassword.value);
      const newPassword = await this.encryption.encrypt(this.newPassword.value);

      this.authService
        .changePasswordWithCode({
          current_password: currentPassword,
          new_password: newPassword,
          code: this.verificationCode.value,
        })
        .subscribe({
          next: () => {
            this.toast.showSuccess("Contrasena actualizada", "Tu nueva contrasena ya esta activa.");
            this.resetChangePasswordForm();
            this.passwordHistory?.refresh();
            this.submittingPassword.set(false);
          },
          error: (error) => {
            this.toast.showError("No se pudo cambiar la contrasena", this.getErrorDetail(error));
            this.submittingPassword.set(false);
          },
        });
    } catch (error: any) {
      this.toast.showError("Conexion segura no disponible", error?.message || "Intenta nuevamente.");
      this.submittingPassword.set(false);
    }
  }

  protected resetChangePasswordForm(): void {
    this.changePasswordForm.reset();
    this.codeRequested.set(false);
    this.maskedPhoneFromServer.set(null);
    this.onPasswordChange("");
  }

  protected getCurrentPasswordError(): string | null {
    if (this.currentPassword.touched && this.currentPassword.errors?.["required"]) {
      return "Ingresa tu contrasena actual";
    }
    return null;
  }

  protected getNewPasswordError(): string | null {
    if (this.newPassword.touched && this.newPassword.errors?.["required"]) {
      return "Ingresa una nueva contrasena";
    }
    if (this.newPassword.touched && this.newPassword.errors?.["minlength"]) {
      return "La contrasena debe tener al menos 12 caracteres";
    }
    return null;
  }

  protected getConfirmPasswordError(): string | null {
    if (this.confirmPassword.touched && this.confirmPassword.errors?.["required"]) {
      return "Repite la nueva contrasena";
    }
    if (this.changePasswordForm.errors?.["passwordMismatch"] && this.confirmPassword.touched) {
      return "Las contrasenas no coinciden";
    }
    return null;
  }

  protected getVerificationCodeError(): string | null {
    if (this.verificationCode.touched && this.verificationCode.errors?.["required"]) {
      return "Ingresa el codigo recibido";
    }
    if (this.verificationCode.touched && this.verificationCode.errors?.["minlength"]) {
      return "El codigo debe tener al menos 6 digitos";
    }
    return null;
  }

  protected get currentPassword(): FormControl {
    return this.changePasswordForm.get("currentPassword") as FormControl;
  }

  protected get newPassword(): FormControl {
    return this.changePasswordForm.get("newPassword") as FormControl;
  }

  protected get confirmPassword(): FormControl {
    return this.changePasswordForm.get("confirmPassword") as FormControl;
  }

  protected get verificationCode(): FormControl {
    return this.changePasswordForm.get("verificationCode") as FormControl;
  }

  private onPasswordChange(password: string): void {
    const result = evaluatePasswordStrength(password);
    this.rules = result.rules;
    this.strengthPercent = result.percent;
    this.strengthLabel = result.label;
    this.strengthClass = result.class;
  }

  private passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get("newPassword")?.value;
    const confirmPassword = form.get("confirmPassword")?.value;
    return newPassword && confirmPassword && newPassword !== confirmPassword
      ? { passwordMismatch: true }
      : null;
  }

  private markFormGroupTouched(): void {
    Object.values(this.changePasswordForm.controls).forEach((control) => control.markAsTouched());
  }

  private startCooldown(): void {
    this.codeCooldown.set(60);
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldownTimer = setInterval(() => {
      const next = this.codeCooldown() - 1;
      this.codeCooldown.set(Math.max(next, 0));
      if (next <= 0 && this.cooldownTimer) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = undefined;
      }
    }, 1000);
  }

  private getErrorDetail(error: any): string {
    const detail = error?.error?.detail;
    if (Array.isArray(detail)) return detail[0]?.msg || "Revisa los datos e intenta nuevamente.";
    if (typeof detail === "string") return detail;
    return error?.message || "Revisa los datos e intenta nuevamente.";
  }
}
