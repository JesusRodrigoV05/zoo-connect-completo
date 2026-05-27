import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from "@angular/core";
import { Theme } from "../../services";
import { CardModule } from "primeng/card";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { FormsModule } from "@angular/forms";
import { UserAvatar } from "@app/shared/components";
import { NgOptimizedImage } from "@angular/common";
import { AuthStore } from "@stores/auth.store";
import { OnboardingService } from "@app/shared/services/onboarding.service";
import { Auth } from "@app/features/auth/services";
import { UpdateProfileRequest } from "@models/usuario";

@Component({
  selector: "perfil-ajustes",
  imports: [
    CardModule,
    ToggleSwitchModule,
    ButtonModule,
    TooltipModule,
    FormsModule,
    UserAvatar,
    NgOptimizedImage,
  ],
  templateUrl: "./perfil-ajustes.html",
  styleUrls: ["./perfil-ajustes.scss", "../settings-content.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PerfilAjustes {
  private themeService = inject(Theme);
  private authStore = inject(AuthStore);
  private readonly onboarding = inject(OnboardingService);

  protected currentUser = this.authStore.usuario;
  protected availableAvatars: string[] = Array.from(
    { length: 19 },
    (_, i) => `/assets/images/profile-icons/${i + 1}.png`,
  );

  protected isDarkMode = computed(() => this.themeService.isDarkMode());

  protected darkModeModel = this.themeService.isDarkMode();

  onThemeChange(isDark: boolean): void {
    this.darkModeModel = isDark;
    this.themeService.setTheme(isDark ? "dark" : "light");
  }

  onAvatarSelect(newAvatarUrl: string): void {
    if (this.currentUser()?.fotoUrl === newAvatarUrl) {
      return;
    }
    this.authStore.updateProfilePicture(newAvatarUrl);
  }

  /**
   * Inicia el tour guiado de la página de Ajustes de Perfil.
   */
  protected startGuidedTour(): void {
    this.onboarding.startTour("settings-perfil");
  }
}
