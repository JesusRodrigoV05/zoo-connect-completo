import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from "@angular/forms";
import { AuthStore } from "@app/core/stores/auth.store";
import { Loader } from "@app/shared/components/loader";
import { FormField } from "@app/shared/components/form-field";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { RouterLink } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";
import { LogoImage } from "@app/shared/components";
import { CustomCaptcha } from "@app/shared/components/custom-captcha/custom-captcha";
import { environment } from "@env";
import { RecaptchaService } from "@app/core/services/recaptcha.service";

@Component({
  selector: "app-login",
  standalone: true,
   imports: [
    ReactiveFormsModule,
    RouterLink,
    Loader,
    FormField,
    ButtonModule,
    CardModule,
    NgOptimizedImage,
    LogoImage,
    CustomCaptcha,
  ],
  templateUrl: "./login.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login implements OnInit, OnDestroy {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);
  private readonly recaptchaService = inject(RecaptchaService);

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(5)]],
  });

  loading = this.authStore.loading;
  error = this.authStore.error;
  recaptchaToken: string | null = null;
  useCustomCaptcha = false;
  customCaptchaToken: string | null = null;

  async ngOnInit() {
    this.useCustomCaptcha = this.recaptchaService.shouldUseCustomFallback();

    if (!this.useCustomCaptcha) {
      try {
        await this.recaptchaService.render('recaptcha-login', (token: string) => {
          this.recaptchaToken = token;
        });
      } catch (err) {
        console.error('Error rendering reCAPTCHA:', err);
        this.useCustomCaptcha = true;
      }
    }
  }

  ngOnDestroy() {
    this.recaptchaService.reset();
  }

  onCustomCaptchaChange(verified: boolean): void {
    // Handled by child component
  }

  onCustomTokenChange(token: string): void {
    this.customCaptchaToken = token;
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const token = this.useCustomCaptcha ? this.customCaptchaToken : this.recaptchaToken;

      if (!token) {
        this.authStore.clearError();
        this.loginForm.markAllAsTouched();
        return;
      }

      const { email, password } = this.loginForm.value;
      await this.authStore.login(email, password, token);

      if (!this.useCustomCaptcha) {
        this.recaptchaService.reset();
        this.recaptchaToken = null;
        await this.ngOnInit();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  clearError() {
    this.authStore.clearError();
  }

  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach((field) => {
      const control = this.loginForm.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  get email() {
    return this.loginForm.get("email") as FormControl;
  }
  get password() {
    return this.loginForm.get("password") as FormControl;
  }

  getEmailError(): string | null {
    const emailControl = this.email;
    if (emailControl?.errors && emailControl?.touched) {
      if (emailControl.errors["required"]) return "El email es requerido";
      if (emailControl.errors["email"]) return "Ingresa un email válido";
    }
    return null;
  }

  getPasswordError(): string | null {
    const passwordControl = this.password;
    if (passwordControl?.errors && passwordControl?.touched) {
      if (passwordControl.errors["required"])
        return "La contraseña es requerida";
      if (passwordControl.errors["minlength"])
        return "La contraseña debe tener al menos 12 caracteres";
    }
    return null;
  }

  recaptchaError(): boolean {
    return this.loginForm.touched && !this.recaptchaToken && !this.customCaptchaToken;
  }
}
