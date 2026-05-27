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
import { Router, RouterLink } from "@angular/router";
import { RestorePassword } from "../../services/restore-password";
import { ShowToast } from "@app/shared/services";
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { NgTemplateOutlet } from "@angular/common";
import { Loader } from "@app/shared/components/loader";
import { LogoImage } from "@app/shared/components";
import { CustomCaptcha } from "@app/shared/components/custom-captcha/custom-captcha";
import { RecaptchaService } from "@app/core/services/recaptcha.service";

@Component({
  selector: "app-forgot-password",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    MessageModule,
    NgTemplateOutlet,
    RouterLink,
    Loader,
    LogoImage,
    CustomCaptcha,
  ],
  templateUrl: "./forgot-password.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgotPassword implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly restorePasswordService = inject(RestorePassword);
  private readonly toastService = inject(ShowToast);
  private readonly recaptchaService = inject(RecaptchaService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  protected readonly isSending = signal(false);
  protected readonly formSubmitted = signal(false);

  protected readonly forgotForm = this.fb.group({
    identifier: ["", [Validators.required]],
  });

  protected recaptchaToken: string | null = null;
  protected useCustomCaptcha = false;
  protected customCaptchaToken: string | null = null;

  async ngOnInit() {
    this.useCustomCaptcha = this.recaptchaService.shouldUseCustomFallback();
    if (!this.useCustomCaptcha) {
      await this.initRecaptcha();
    }
  }

  private async initRecaptcha() {
    try {
      await this.recaptchaService.render('recaptcha-forgot', (token: string) => {
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
    const field = this.forgotForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.forgotForm.get(fieldName);

    if (field?.errors) {
      if (field.errors["required"]) {
        return "El usuario o telefono es requerido";
      }
    }

    return "";
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.forgotForm.valid) {
      const token = this.useCustomCaptcha ? this.customCaptchaToken : this.recaptchaToken;
      if (!token) {
        this.toastService.showError("Error", "Por favor, completa la verificación de seguridad.");
        return;
      }

      this.isSending.set(true);

      this.restorePasswordService
        .forgotPassword(this.forgotForm.value.identifier!, token)
        .pipe(finalize(() => this.isSending.set(false)))
        .subscribe({
          next: (response) => {
            this.toastService.showSuccess("Codigo enviado", response.msg);
            this.router.navigate(["/reset-password"]);
          },
          error: (error) => {
            let errorMessage = "Error al enviar codigo de recuperacion";

            if (error.status === 404) {
              errorMessage = "No existe una cuenta con ese usuario o telefono";
            } else if (error.status === 400) {
              errorMessage = "Usuario o telefono invalido";
            }

            this.toastService.showError("Error", errorMessage);
          },
        });
    } else {
      this.toastService.showError(
        "Error",
        "Por favor, ingresa tu usuario o telefono",
      );
    }
  }

  protected recaptchaError(): boolean {
    return this.formSubmitted() && !this.recaptchaToken && !this.customCaptchaToken;
  }
}
