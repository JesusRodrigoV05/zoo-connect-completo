import { ChangeDetectionStrategy, Component, inject, signal, ViewChild, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormsModule,
  Validators,
  FormControl,
} from "@angular/forms";
import { RouterLink, Router } from "@angular/router";
import { AuthStore } from "@stores/auth.store";
import { Loader } from "@app/shared/components/loader";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { NgOptimizedImage, NgClass } from "@angular/common";
import { LogoImage } from "@app/shared/components";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { MessageModule } from "primeng/message";
import { Auth } from "../../services";
import { ToggleButtonModule } from "primeng/togglebutton";
import { ToastModule } from "primeng/toast";
import { ShowToast } from "@app/shared/services";
import { ZooCaptcha } from "@app/shared/components/zoo-captcha/zoo-captcha";
import { evaluatePasswordStrength } from "@app/shared/utils/password-strength";

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
    NgClass,
    LogoImage,
    FloatLabelModule,
    InputTextModule,
    PasswordModule,
    MessageModule,
    ToggleButtonModule,
    ToastModule,
    ZooCaptcha,
  ],
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

  @ViewChild('zooCaptcha') zooCaptcha?: ZooCaptcha;

  protected readonly isLoading = this.authStore.loading;
  protected readonly error = this.authStore.error;
  protected readonly captchaToken = signal<string | null>(null);

  protected readonly signupForm: FormGroup = this.fb.group(
    {
      email: ["", [Validators.email]],
      nombre: ["", [Validators.required, Validators.minLength(2)]],
      apellido: ["", [Validators.required, Validators.minLength(2)]],
      phoneNumber: ["", [Validators.required, Validators.pattern("^\\+[1-9]\\d{7,14}$")]],
      password: ["", [Validators.minLength(12)]],
      confirmPassword: ["", [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
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
  protected generatedPassword: string | null = null;
  protected generatePassword = false;
  protected showTips = false;

  protected isPasswordStrong(): boolean {
    if (this.generatePassword) return true;
    return Object.values(this.rules).every(rule => rule === true);
  }

  protected onPasswordChange(p: string) {
    const result = evaluatePasswordStrength(p);
    this.rules = result.rules;
    this.strengthPercent = result.percent;
    this.strengthLabel = result.label;
    this.strengthClass = result.class;
  }

  ngOnInit() {
    const pwControl = this.signupForm.get('password');
    if (pwControl) {
      pwControl.valueChanges.subscribe((v: string) => this.onPasswordChange(v || ''));
    }
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

    const token = this.captchaToken();
    if (!token) {
      this.toastService.showWarning("Verificación requerida", "Por favor, verifica que no eres un robot.");
      return;
    }

    const { email, nombre, apellido, phoneNumber } = this.signupForm.value;
    const password = this.signupForm.value.password;
    const username = `${nombre}.visitante.${apellido}`;

    try {
      const res = await this.authStore.register(email, username, phoneNumber, password, this.generatePassword, token);
      if (res && res.generated_password) {
        this.generatedPassword = res.generated_password as string;
      } else {
        await this.router.navigate(['/verify-email'], { queryParams: { phone: phoneNumber } });
      }
    } catch (e) {
    } finally {
      this.captchaToken.set(null);
      this.zooCaptcha?.reset();
    }
  }

  protected onSubmit(): void {
    this.submitForm();
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
  get nombre() {
    return this.signupForm.get("nombre") as FormControl;
  }
  get apellido() {
    return this.signupForm.get("apellido") as FormControl;
  }
  get phoneNumber() {
    return this.signupForm.get("phoneNumber") as FormControl;
  }
  get password() {
    return this.signupForm.get("password") as FormControl;
  }
  get confirmPassword() {
    return this.signupForm.get("confirmPassword") as FormControl;
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
      pw?.setValidators([Validators.minLength(12)]);
      cpw?.setValidators([Validators.required]);
      cpw?.updateValueAndValidity();
      pw?.updateValueAndValidity();
    }
  }

  protected passwordTips = [
    {
      title: "Usa una canción favorita",
      example: "Qué triste es mi ausencia",
      result: "QmEma#24",
      description: "Toma la primera letra de cada palabra + el año"
    },
    {
      title: "Usa una fecha especial",
      example: "18 de junio - Cumpleaños",
      result: "18dJ#1806",
      description: "Combina números con la inicial del mes"
    },
    {
      title: "Usa un dicho popular",
      example: "Al que madruga Dios le ayuda",
      result: "aQmDlA#18",
      description: "Iniciales en minúsculas + carácter especial + año"
    },
    {
      title: "Usa una frase personal",
      example: "Mi gato feliz salta alto",
      result: "MgFsAl#23",
      description: "Iniciales de tus palabras favoritas"
    }
  ];

  protected getPasswordHint(): string {
    const tips = this.passwordTips;
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    return `Ejemplo: "${randomTip.example}" → "${randomTip.result}"`;
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

  protected getNombreError(): string | null {
    const control = this.nombre;
    if (control?.errors && control?.touched) {
      if (control.errors["required"]) return "El nombre es requerido";
      if (control.errors["minlength"])
        return "El nombre debe tener al menos 2 caracteres";
    }
    return null;
  }

  protected getApellidoError(): string | null {
    const control = this.apellido;
    if (control?.errors && control?.touched) {
      if (control.errors["required"]) return "El apellido es requerido";
      if (control.errors["minlength"])
        return "El apellido debe tener al menos 2 caracteres";
    }
    return null;
  }

  protected getPhoneError(): string | null {
    const control = this.phoneNumber;
    if (control?.errors && control?.touched) {
      if (control.errors["required"]) return "El telefono es requerido";
      if (control.errors["pattern"]) return "Usa formato internacional, ej. +59170000000";
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
