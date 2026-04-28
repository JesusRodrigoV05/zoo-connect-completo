import { ChangeDetectionStrategy, Component, inject, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
  FormControl,
} from "@angular/forms";
import { RouterLink } from "@angular/router";
import { AuthStore } from "@app/core/stores/auth.store";
import { Loader } from "@app/shared/components/loader";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { NgOptimizedImage, CommonModule } from "@angular/common";
import { LogoImage } from "@app/shared/components";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { MessageModule } from "primeng/message";
import { Auth } from "../../services";
import { UpdateProfileRequest } from "@models/usuario";
import { Router } from "@angular/router";

import { ToggleButtonModule } from "primeng/togglebutton";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";
import { ShowToast } from "@app/shared/services";

@Component({
  selector: "app-signup",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
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
    CommonModule,
    ToggleButtonModule,
    ToastModule,
  ],
  providers: [MessageService],
  templateUrl: "./signup.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Signup implements OnInit {
  protected readonly authStore = inject(AuthStore);
  authService = inject(Auth);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastService = inject(ShowToast);

  protected readonly isLoading = this.authStore.loading;
  protected readonly error = this.authStore.error;

  protected readonly signupForm: FormGroup = this.fb.group(
    {
      email: ["", [Validators.required, Validators.email]],
      username: ["", [Validators.required, Validators.minLength(3)]],
      password: ["", [Validators.minLength(12)]],
      confirmPassword: ["", [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
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
  protected generatedPassword: string | null = null;
  protected generatePassword = false;

  protected isPasswordStrong(): boolean {
    if (this.generatePassword) return true;
    return Object.values(this.rules).every(rule => rule === true);
  }

  protected onSubmit(): void {
    this.submitForm();
  }

  protected async submitForm(): Promise<void> {
    if (!this.generatePassword) {
      if (!this.signupForm.valid) {
        this.markFormGroupTouched();
        this.toastService.showWarning("Formulario Incompleto", "Por favor, revisa los campos marcados en rojo.");
        return;
      }
      if (!this.isPasswordStrong()) {
        this.toastService.showError("Contraseña Insegura", "La contraseña debe cumplir con todos los requisitos mostrados.");
        return;
      }
    }

    const { email, username } = this.signupForm.value;
    const password = this.signupForm.value.password;

    try {
      const res = await this.authStore.register(email, username, password, false);
      if (res && res.generated_password) {
        this.generatedPassword = res.generated_password as string;
      } else {
        await this.router.navigate(['/login']);
      }
    } catch (e) {
      // errors are handled in store
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

  ngOnInit(): void {
    const pwControl = this.signupForm.get('password');
    if (pwControl) {
      pwControl.valueChanges.subscribe((v: string) => this.onPasswordChange(v || ''));
    }
  }

  protected onPasswordChange(p: string) {
    const v = p || '';
    this.rules.length = v.length >= 8;
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

  protected toggleGeneratePassword() {
    this.generatePassword = !this.generatePassword;
    const pw = this.signupForm.get('password');
    const cpw = this.signupForm.get('confirmPassword');
    if (this.generatePassword) {
      pw?.clearValidators();
      cpw?.clearValidators();
      cpw?.updateValueAndValidity();
      pw?.updateValueAndValidity();
    } else {
      pw?.setValidators([Validators.minLength(8)]);
      cpw?.setValidators([Validators.required]);
      cpw?.updateValueAndValidity();
      pw?.updateValueAndValidity();
    }
  }

  protected generateSuggestion() {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const digits = "0123456789";
    const symbols = "!@#$%^&*()-_";
    const all = uppercase + lowercase + digits + symbols;

    let pass = "";
    pass += uppercase[Math.floor(Math.random() * uppercase.length)];
    pass += lowercase[Math.floor(Math.random() * lowercase.length)];
    pass += digits[Math.floor(Math.random() * digits.length)];
    pass += symbols[Math.floor(Math.random() * symbols.length)];

    for (let i = 0; i < 8; i++) {
      pass += all[Math.floor(Math.random() * all.length)];
    }

    pass = pass.split('').sort(() => Math.random() - 0.5).join('');

    if (this.isValidSuggestion(pass)) {
      this.signupForm.patchValue({
        password: pass,
        confirmPassword: pass
      });
      this.signupForm.get('password')?.markAsDirty();
      this.signupForm.get('confirmPassword')?.markAsDirty();
      this.onPasswordChange(pass);
    } else {
      this.generateSuggestion();
    }
  }

  private isValidSuggestion(v: string): boolean {
    return v.length >= 8 &&
           /[A-Z]/.test(v) &&
           /[a-z]/.test(v) &&
           /[0-9]/.test(v) &&
           /[!@#$%^&*()\-=_+\[\]{}|;:,.<>?]/.test(v) &&
           !/(.)\1\1/.test(v) &&
           !this.hasSequentialChars(v, 3);
  }

  protected copyGenerated() {
    if (!this.generatedPassword) return;
    navigator.clipboard?.writeText(this.generatedPassword);
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
        return "La contraseña debe tener al menos 12 caracteres";
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

