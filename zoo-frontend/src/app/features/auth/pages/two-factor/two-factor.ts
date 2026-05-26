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
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TwoFactorAuth } from "@app/features/private/settings/services";
import { ShowToast } from "@app/shared/services";
import { AuthStore } from "@stores/auth.store";
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { NgTemplateOutlet } from "@angular/common";
import { Loader } from "@app/shared/components";
import { CustomCaptcha } from "@app/shared/components/custom-captcha/custom-captcha";
import { RecaptchaService } from "@app/core/services/recaptcha.service";
@Component({
  selector: "app-two-factor",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabelModule,
    MessageModule,
    NgTemplateOutlet,
    RouterLink,
    Loader,
    CustomCaptcha,
  ],
  templateUrl: "./two-factor.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFactor implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly twoFactorService = inject(TwoFactorAuth);
  private readonly toastService = inject(ShowToast);
  private readonly authStore = inject(AuthStore);
  private readonly recaptchaService = inject(RecaptchaService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly isVerifying = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly sessionToken = signal<string>("");
  protected recaptchaToken: string | null = null;
  protected useCustomCaptcha = false;
  protected customCaptchaToken: string | null = null;
  protected readonly verifyForm = this.fb.group({
    code: [
      "",
      [
        Validators.required,
        Validators.pattern(/^(\d{6,8}|[a-fA-F0-9]{4}-[a-fA-F0-9]{4})$/),
      ],
    ],
  });
  constructor() {
    const token = this.route.snapshot.queryParams["session_token"];
    if (!token) {
      this.toastService.showError(
        "Error",
        "Sesión inválida. Por favor, inicia sesión nuevamente.",
      );
      this.router.navigate(["/login"]);
      return;
    }
    this.sessionToken.set(token);
  }

  async ngOnInit() {
    this.useCustomCaptcha = this.recaptchaService.shouldUseCustomFallback();
    if (!this.useCustomCaptcha) {
      await this.initRecaptcha();
    }
  }

  private async initRecaptcha() {
    try {
      await this.recaptchaService.render('recaptcha-2fa', (token: string) => {
        this.ngZone.run(() => {
          this.recaptchaToken = token;
          this.cdr.detectChanges();
        });
      });
    } catch (err) {
      console.error('Error rendering reCAPTCHA:', err);
      this.ngZone.run(() => {
        this.useCustomCaptcha = true;
        this.cdr.markForCheck();
      });
    }
  }

  ngOnDestroy() {
    this.recaptchaService.reset();
  }

  onCustomCaptchaChange(verified: boolean): void {
  }

  onCustomTokenChange(token: string): void {
    this.customCaptchaToken = token;
  }
  protected isInvalid(fieldName: string): boolean {
    const field = this.verifyForm.get(fieldName);
    return !!(field?.invalid && (field?.touched || this.formSubmitted()));
  }
  protected getErrorMessage(fieldName: string): string {
    const field = this.verifyForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) {
        return "El código de verificación es requerido";
      }
      if (field.errors["pattern"]) {
        return "Cantidad de digitos inválida";
      }
    }
    return "";
  }
  protected onSubmit(): void {
    this.formSubmitted.set(true);
    if (this.verifyForm.valid && this.sessionToken()) {
      const token = this.useCustomCaptcha ? this.customCaptchaToken : this.recaptchaToken;
      if (!token) {
        this.toastService.showError("Error", "Por favor, completa la verificación de seguridad.");
        return;
      }

      this.isVerifying.set(true);
      this.twoFactorService
        .verifyLogin2FA(this.sessionToken(), this.verifyForm.value.code!, token)
        .pipe(finalize(() => this.isVerifying.set(false)))
        .subscribe({
          next: (response) => {
            this.authStore.setTokens(response.access_token);
            this.authStore.loadUserProfile().then(() => {
              this.toastService.showSuccess(
                "Bienvenido",
                "Verificación 2FA exitosa",
              );
              this.router.navigate(["/"]);
            });
          },
          error: (error: any) => {
            let errorMessage =
              "Código incorrecto. Verifica tu app de autenticación";
            if (error.status === 400) {
              errorMessage = "Código inválido o expirado";
            } else if (error.status === 401) {
              errorMessage =
                "Sesión expirada. Por favor, inicia sesión nuevamente";
              setTimeout(() => this.router.navigate(["/login"]), 2000);
            }
            this.toastService.showError("Error", errorMessage);
          },
        });
    } else {
      this.toastService.showError(
        "Error",
        "Por favor, ingresa un código válido",
      );
    }
  }

  protected recaptchaError(): boolean {
    return this.formSubmitted() && !this.recaptchaToken && !this.customCaptchaToken;
  }
}
