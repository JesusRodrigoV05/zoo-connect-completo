import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
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
import { environment } from "@env";

@Component({
  selector: "app-login",
  imports: [
    ReactiveFormsModule,
    Loader,
    FormField,
    ButtonModule,
    CardModule,
    RouterLink,
    NgOptimizedImage,
    LogoImage,
  ],
  templateUrl: "./login.html",
  styleUrl: "./login.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Login {
  protected readonly authStore = inject(AuthStore);
  private readonly fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", [Validators.required, Validators.minLength(6)]],
  });

  loading = this.authStore.loading;
  error = this.authStore.error;

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      await this.authStore.login(email, password);
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
        return "La contraseña debe tener al menos 6 caracteres";
    }
    return null;
  }
}
