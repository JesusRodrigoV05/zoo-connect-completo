import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthStore } from "@app/core/stores/auth.store";
import { Loader } from "@app/shared/components/loader";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { NgOptimizedImage } from "@angular/common";
import { LogoImage } from "@app/shared/components";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { MessageModule } from "primeng/message";
import { Auth } from "../../services";
import { UpdateProfileRequest } from "@models/usuario";

@Component({
  selector: "app-signup",
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Loader,
    ButtonModule,
    CardModule,
    NgOptimizedImage,
    LogoImage,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
  ],
  templateUrl: "./signup.html",
  styleUrl: "./signup.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Signup {
  protected readonly authStore = inject(AuthStore);
  authService = inject(Auth);
  private readonly fb = inject(FormBuilder);

  protected readonly isLoading = this.authStore.loading;
  protected readonly error = this.authStore.error;

  protected readonly signupForm: FormGroup = this.fb.group(
    {
      email: ["", [Validators.required, Validators.email]],
      username: ["", [Validators.required, Validators.minLength(3)]],
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  protected onSubmit(): void {
    if (this.signupForm.valid) {
      const { email, username, password } = this.signupForm.value;
      this.authStore.register(email, username, password);
    } else {
      this.markFormGroupTouched();
    }
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.signupForm.controls).forEach((key) => {
      const control = this.signupForm.get(key);
      control?.markAsTouched();
    });
  }

  get email() {
    return this.signupForm.get("email") as FormControl;
  }
  get username() {
    return this.signupForm.get("username") as FormControl;
  }
  get password() {
    return this.signupForm.get("password") as FormControl;
  }
  get confirmPassword() {
    return this.signupForm.get("confirmPassword") as FormControl;
  }

  protected getEmailError(): string | null {
    const control = this.email;
    if (control?.errors && control?.touched) {
      if (control.errors["required"]) return "El email es requerido";
      if (control.errors["email"]) return "Ingresa un email válido";
    }
    return null;
  }

  protected getUsernameError(): string | null {
    const control = this.username;
    if (control?.errors && control?.touched) {
      if (control.errors["required"]) return "El usuario es requerido";
      if (control.errors["minlength"])
        return "El usuario debe tener al menos 3 caracteres";
    }
    return null;
  }

  protected getPasswordError(): string | null {
    const control = this.password;
    if (control?.errors && control?.touched) {
      if (control.errors["required"]) return "La contraseña es requerida";
      if (control.errors["minlength"])
        return "La contraseña debe tener al menos 6 caracteres";
    }
    return null;
  }

  protected getConfirmPasswordError(): string | null {
    const control = this.confirmPassword;
    if (control?.errors && control?.touched) {
      if (control.errors["required"])
        return "Confirmar contraseña es requerido";
    }
    if (this.signupForm.errors?.["passwordMismatch"] && control?.touched) {
      return "Las contraseñas no coinciden";
    }
    return null;
  }
}
