import { Component, inject, signal, ViewChild, ChangeDetectionStrategy } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from "@angular/forms";
import { AuthStore } from "@stores/auth.store";
import { Loader } from "@app/shared/components/loader";
import { FormField } from "@app/shared/components/form-field";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { RouterLink } from "@angular/router";
import { NgOptimizedImage } from "@angular/common";
import { LogoImage } from "@app/shared/components";
import { ZooCaptcha } from "@app/shared/components/zoo-captcha/zoo-captcha";

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
    ZooCaptcha,
  ],
  templateUrl: "./login.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  @ViewChild('zooCaptcha') zooCaptcha?: ZooCaptcha;

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required]],
    password: ["", [Validators.required, Validators.minLength(12)]],
  });

  loading = this.authStore.loading;
  error = this.authStore.error;
  protected readonly captchaToken = signal<string | null>(null);

  async onSubmit() {
    if (this.loginForm.valid) {
      const token = this.captchaToken();
      if (!token) {
        this.authStore.clearError();
        this.loginForm.markAllAsTouched();
        return;
      }

      const { email, password } = this.loginForm.value;
      await this.authStore.login(email, password, token);

      this.captchaToken.set(null);
      this.zooCaptcha?.reset();
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
}
