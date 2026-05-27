import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { RestorePassword } from "../../services/restore-password";
import { ShowToast } from "@app/shared/services";
import { AuthStore } from "@stores/auth.store";
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { NgTemplateOutlet, NgClass, NgOptimizedImage } from "@angular/common";
import { PasswordModule } from "primeng/password";
import { Loader } from "@app/shared/components/loader";
import { LogoImage } from "@app/shared/components";
import { evaluatePasswordStrength } from "@app/shared/utils/password-strength";

@Component({
  selector: "app-reset-password",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    MessageModule,
    NgTemplateOutlet,
    NgClass,
    PasswordModule,
    RouterLink,
    Loader,
    LogoImage,
  ],
  templateUrl: "./reset-password.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPassword {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly restorePasswordService = inject(RestorePassword);
  private readonly toastService = inject(ShowToast);
  private readonly authStore = inject(AuthStore);

  protected readonly isResetting = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly token = signal<string>("");

  protected readonly resetForm = this.fb.group(
    {
      password: ["", [Validators.required, Validators.minLength(12)]],
      confirmPassword: ["", [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  protected rules = {
    length: false,
    uppercase: false,
    lowercase: false,
    digit: false,
    special: false,
    noRepeats: false,
    noSequence: false,
  };
  protected strengthPercent = 0;
  protected strengthLabel = "Débil";
  protected strengthClass = "weak";

  constructor() {
    this.token.set(this.route.snapshot.queryParams["token"] || "");

    if (!this.token()) {
      this.toastService.showError("Error", "Token no válido");
      this.router.navigate(["/login"]);
    }
  }

  ngOnInit() {
    const pwControl = this.resetForm.get('password');
    if (pwControl) {
      pwControl.valueChanges.subscribe((v: string | null) => this.onPasswordChange(v || ''));
    }
  }

  protected onPasswordChange(p: string) {
    const result = evaluatePasswordStrength(p);
    this.rules = result.rules;
    this.strengthPercent = result.percent;
    this.strengthLabel = result.label;
    this.strengthClass = result.class;
  }

  protected isPasswordStrong(): boolean {
    return Object.values(this.rules).every(rule => rule === true);
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

    if (!this.resetForm.valid) {
      this.toastService.showError("Error", "Por favor, completa todos los campos correctamente");
      return;
    }

    if (!this.isPasswordStrong()) {
      this.toastService.showError("Contraseña Insegura", "La contraseña debe cumplir con todos los requisitos.");
      return;
    }

    if (this.token()) {
      this.isResetting.set(true);

      this.restorePasswordService
        .resetPassword(this.token(), this.resetForm.value.password!)
        .pipe(finalize(() => this.isResetting.set(false)))
        .subscribe({
          next: (response: any) => {
            if (response.access_token) {
              this.authStore.setTokens(response.access_token);
              this.authStore.loadUserProfile().then(() => {
                this.router.navigate(["/inicio"]);
              });
            } else {
              this.toastService.showSuccess("Éxito", response.msg);
              this.router.navigate(["/login"]);
            }
          },
          error: (error) => {
            let errorMessage = "Error al restablecer contraseña";
            if (error.status === 400) {
              errorMessage = error.error?.detail || "Token inválido o expirado";
            } else if (error.status === 404) {
              errorMessage = "Usuario no encontrado";
            }
            this.toastService.showError("Error", errorMessage);
          },
        });
    }
  }
}
