import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  OnDestroy,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "@env";
import { firstValueFrom } from "rxjs";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthStore } from "@stores/auth.store";
import { Loader } from "@app/shared/components/loader";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { NgOptimizedImage } from "@angular/common";
import { LogoImage } from "@app/shared/components";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { ShowToast } from "@app/shared/services";

@Component({
  selector: "app-verify-email",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Loader,
    ButtonModule,
    CardModule,
    NgOptimizedImage,
    LogoImage,
    InputTextModule,
    MessageModule,
  ],
  templateUrl: "./verify-email.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VerifyEmail implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ShowToast);
  private readonly http = inject(HttpClient);

  protected readonly email = signal<string>(this.route.snapshot.queryParams['phone'] || '');
  protected readonly isLoading = this.authStore.loading;
  protected readonly isResending = signal<boolean>(false);
  protected readonly resendCooldown = signal<number>(0);
  private cooldownInterval: any;

  protected readonly verifyForm: FormGroup = this.fb.group({
    code: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  protected formSubmitted = signal(false);

  async resendCode(): Promise<void> {
    if (!this.email() || this.resendCooldown() > 0) {
      return;
    }

    try {
      this.isResending.set(true);
      await firstValueFrom(
        this.http.post<{message: string}>(`${environment.apiUrl}/auth/resend-verification`, {
          email: this.email(),
        })
      );
      this.toastService.showSuccess("Éxito", "Código reenviado exitosamente.");
      this.startCooldown();
    } catch (e) {
      this.toastService.showError("Error", "No se pudo reenviar el código.");
    } finally {
      this.isResending.set(false);
    }
  }

  private startCooldown() {
    this.resendCooldown.set(180);
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);

    this.cooldownInterval = setInterval(() => {
      this.resendCooldown.update(v => v - 1);
      if (this.resendCooldown() <= 0) {
        clearInterval(this.cooldownInterval);
      }
    }, 1000);
  }

  protected getCooldownMessage(): string {
    const minutes = Math.floor(this.resendCooldown() / 60);
    const seconds = this.resendCooldown() % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  async onSubmit(): Promise<void> {
    this.formSubmitted.set(true);
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    if (!this.email()) {
      this.toastService.showError("Error", "No se encontro el telefono para verificar.");
      return;
    }

    const { code } = this.verifyForm.value;

    try {
      await this.authStore.verifyEmail(this.email(), code);
    } catch (e) {
    }
  }

  getCodeError(): string | null {
    const control = this.verifyForm.get('code');
    if (control?.errors && control?.touched) {
      if (control.errors["required"]) return "El código es requerido";
      if (control.errors["minlength"] || control.errors["maxlength"])
        return "El código debe tener 6 dígitos";
    }
    return null;
  }

  ngOnDestroy() {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
  }
}
