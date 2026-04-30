import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CardModule } from "primeng/card";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { Enable2faDialog } from "../enable-2fa-dialog/enable-2fa-dialog";
import { Disable2faDialog } from "../disable-2fa-dialog";
import { AuthStore } from "@stores/auth.store";
import { OnboardingService } from "@app/shared/services/onboarding.service";
import { PasswordHistoryComponent } from "../password-history/password-history";

@Component({
  selector: "seguridad-ajustes",
  imports: [
    FormsModule,
    CardModule,
    ToggleSwitchModule,
    ButtonModule,
    TooltipModule,
    Enable2faDialog,
    Disable2faDialog,
    PasswordHistoryComponent,
  ],
  templateUrl: "./seguridad-ajustes.html",
  styleUrls: ["./seguridad-ajustes.scss", "../settings-content.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SeguridadAjustes {
  private authStore = inject(AuthStore);
  private readonly onboarding = inject(OnboardingService);

  protected readonly showEnable2FA = signal(false);
  protected readonly showDisable2FA = signal(false);

  protected twoFaModel = signal(this.authStore.twoFAenabled());

  protected on2FAToggle(enabled: boolean): void {
    if (enabled && !this.authStore.twoFAenabled()) {
      this.showEnable2FA.set(true);
    } else if (!enabled && this.authStore.twoFAenabled()) {
      this.showDisable2FA.set(true);
    } else {
      this.twoFaModel.set(this.authStore.twoFAenabled());
    }
  }

  /**
   * Inicia el tour guiado de la página de Seguridad.
   */
  protected startGuidedTour(): void {
    this.onboarding.startTour("settings-seguridad");
  }

  protected on2FAEnabled(): void {
    this.authStore.set2FAStatus(true);
    this.showEnable2FA.set(false);
  }

  protected on2FADisabled(): void {
    this.authStore.set2FAStatus(false);
    this.showDisable2FA.set(false);
  }

  protected onEnable2FACancelled(): void {
    this.twoFaModel.set(false);
    this.showEnable2FA.set(false);
  }

  protected onDisable2FACancelled(): void {
    this.twoFaModel.set(true);
    this.showDisable2FA.set(false);
  }
}
