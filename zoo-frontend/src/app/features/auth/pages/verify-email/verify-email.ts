import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthStore } from "@app/core/stores/auth.store";
import { Loader } from "@app/shared/components/loader";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { NgOptimizedImage, CommonModule } from "@angular/common";
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
    CommonModule,
  ],
  templateUrl: "./verify-email.html",
  styleUrl: "../../auth.styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VerifyEmail {
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toastService = inject(ShowToast);

  protected readonly email = signal<string>(this.route.snapshot.queryParams['email'] || '');
  protected readonly isLoading = this.authStore.loading;

  protected readonly verifyForm: FormGroup = this.fb.group({
    code: ["", [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  async onSubmit(): Promise<void> {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    if (!this.email()) {
      this.toastService.showError("Error", "No se encontró el correo electrónico para verificar.");
      return;
    }

    const { code } = this.verifyForm.value;

    try {
      await this.authStore.verifyEmail(this.email(), code);
    } catch (e) {
      // Error handled by store/toast
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
}
