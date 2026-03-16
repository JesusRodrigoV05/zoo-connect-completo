import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { TwoFactorAuth } from "@app/features/private/settings/services";
import { ShowToast } from "@app/shared/services";
import { AuthStore } from "@app/core/stores/auth.store";
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabelModule } from "primeng/floatlabel";
import { MessageModule } from "primeng/message";
import { NgTemplateOutlet } from "@angular/common";
import { Loader } from "@app/shared/components";
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
  ],
  templateUrl: "./two-factor.html",
  styleUrl: "./two-factor.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TwoFactor {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly twoFactorService = inject(TwoFactorAuth);
  private readonly toastService = inject(ShowToast);
  private readonly authStore = inject(AuthStore);
  protected readonly isVerifying = signal(false);
  protected readonly formSubmitted = signal(false);
  protected readonly sessionToken = signal<string>("");
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
      this.isVerifying.set(true);
      console.log("Desde el formulario tratando de enviar ");
      this.twoFactorService
        .verifyLogin2FA(this.sessionToken(), this.verifyForm.value.code!)
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
}
