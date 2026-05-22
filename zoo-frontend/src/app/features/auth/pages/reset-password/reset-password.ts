import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnInit,
  OnDestroy,
  NgZone,
  ChangeDetectorRef,
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
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { NgTemplateOutlet, CommonModule, NgOptimizedImage } from "@angular/common";
import { PasswordModule } from "primeng/password";
import { Loader } from "@app/shared/components/loader";
import { LogoImage } from "@app/shared/components";
import { RecaptchaService } from "@app/core/services/recaptcha.service";
import { CustomCaptcha } from "@app/shared/components/custom-captcha/custom-captcha";

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
    PasswordModule,
    RouterLink,
    Loader,
    LogoImage,
    CommonModule,
    CustomCaptcha,
  ],
  templateUrl: "./reset-password.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPassword implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly restorePasswordService = inject(RestorePassword);
  private readonly toastService = inject(ShowToast);
  private readonly recaptchaService = inject(RecaptchaService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

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

  // Password rules + strength
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
  protected recaptchaToken: string | null = null;
  protected useCustomCaptcha = false;
  protected customCaptchaToken: string | null = null;

  constructor() {
    this.token.set(this.route.snapshot.queryParams["token"] || "");

    if (!this.token()) {
      this.toastService.showError("Error", "Token no válido");
      this.router.navigate(["/login"]);
    }
  }

  async ngOnInit() {
    const pwControl = this.resetForm.get('password');
    if (pwControl) {
      pwControl.valueChanges.subscribe((v: string | null) => this.onPasswordChange(v || ''));
    }

    // Determinar si usar widget de reCAPTCHA o fallback propio
    this.useCustomCaptcha = this.recaptchaService.shouldUseCustomFallback();

    if (!this.useCustomCaptcha) {
      this.initRecaptchaWithRetry();
    }
  }

  /**
   * Intenta renderizar reCAPTCHA esperando a que el elemento esté en el DOM.
   */
  private async initRecaptchaWithRetry(attempts = 0) {
    const elementId = 'recaptcha-reset';
    const element = document.getElementById(elementId);

    if (element) {
      try {
        await this.recaptchaService.render(elementId, (token: string) => {
          this.ngZone.run(() => {
            this.recaptchaToken = token;
            this.cdr.detectChanges();
          });
        });
      } catch (err) {
        console.error('Error renderizando reCAPTCHA:', err);
        this.ngZone.run(() => {
          this.useCustomCaptcha = true;
          this.cdr.markForCheck();
        });
      }
    } else if (attempts < 20) {
      setTimeout(() => this.initRecaptchaWithRetry(attempts + 1), 200);
    } else {
      this.ngZone.run(() => {
        this.useCustomCaptcha = true;
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy() {
    this.recaptchaService.reset();
  }

  protected onPasswordChange(p: string) {
    const v = p || '';
    this.rules.length = v.length >= 12;
    this.rules.uppercase = /[A-Z]/.test(v);
    this.rules.lowercase = /[a-z]/.test(v);
    this.rules.digit = /[0-9]/.test(v);
    this.rules.special = /[!@#$%^&*()\-=_+\[\]{}|;:,.<>?]/.test(v);
    this.rules.noRepeats = !/(.)\1\1/.test(v);
    this.rules.noSequence = !this.hasSequentialChars(v, 3);

    const score = Object.values(this.rules).filter(Boolean).length;
    this.strengthPercent = Math.round((score / Object.keys(this.rules).length) * 100);

    if (!this.rules.noRepeats || !this.rules.noSequence) {
      this.strengthLabel = 'Insegura';
      this.strengthClass = 'weak';
      this.strengthPercent = Math.min(this.strengthPercent, 20);
    } else if (score <= 3) {
      this.strengthLabel = 'Débil';
      this.strengthClass = 'weak';
    } else if (score <= 5) {
      this.strengthLabel = 'Media';
      this.strengthClass = 'medium';
    } else {
      this.strengthLabel = 'Fuerte';
      this.strengthClass = 'strong';
    }
    this.cdr.markForCheck();
  }

  protected hasSequentialChars(s: string, seqLen = 4): boolean {
    const t = s.toLowerCase();
    for (let i = 0; i <= t.length - seqLen; i++) {
      const chunk = t.slice(i, i + seqLen);
      if (/^[a-z]+$/.test(chunk) || /^[0-9]+$/.test(chunk)) {
        const codes = Array.from(chunk).map(c => c.charCodeAt(0));
        const inc = codes.every((c, idx) => idx === 0 || c - codes[idx - 1] === 1);
        const dec = codes.every((c, idx) => idx === 0 || codes[idx - 1] - c === 1);
        if (inc || dec) return true;
      }
    }
    return false;
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

    const captchaToken = this.useCustomCaptcha ? this.customCaptchaToken : this.recaptchaToken;
    if (!captchaToken) {
      this.toastService.showWarning("Verificación requerida", "Por favor, verifica que no eres un robot.");
      return;
    }

    if (this.token()) {
      this.isResetting.set(true);

      this.restorePasswordService
        .resetPassword(this.token(), this.resetForm.value.password!, captchaToken)
        .pipe(finalize(() => this.isResetting.set(false)))
        .subscribe({
          next: (response) => {
            this.toastService.showSuccess("Éxito", response.msg);
            this.router.navigate(["/login"]);
          },
          error: (error) => {
            let errorMessage = "Error al restablecer contraseña";

            if (error.status === 400) {
              errorMessage = error.error?.detail || "Token inválido o expirado";
            } else if (error.status === 404) {
              errorMessage = "Usuario no encontrado";
            } else if (error.status === 403) {
              errorMessage = "Verificación de seguridad fallida";
            }

            this.toastService.showError("Error", errorMessage);
            
            // Reset CAPTCHA on error
            if (!this.useCustomCaptcha) {
              this.recaptchaService.reset();
              this.recaptchaToken = null;
            }
          },
        });
    }
  }

  onCustomCaptchaChange(verified: boolean): void {}
  onCustomTokenChange(token: string): void {
    this.customCaptchaToken = token;
  }

  protected recaptchaError(): boolean {
    return this.formSubmitted() && !this.recaptchaToken && !this.customCaptchaToken;
  }
}
