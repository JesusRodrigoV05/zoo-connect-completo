import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthStore } from "@app/core/stores/auth.store";
import { Loader } from "@app/shared/components";
import {
  LogoutDialogComponent,
  UserInfoCardComponent,
  ProfileActionsCardComponent,
  type UserStats,
} from "./components";
import { MainContainer } from "@app/shared/components/main-container";
import { toSignal } from "@angular/core/rxjs-interop";
import { EncuestaService } from "@app/features/public/encuestas/services/encuestas";

@Component({
  selector: "zoo-profile",
  imports: [
    UserInfoCardComponent,
    ProfileActionsCardComponent,
    LogoutDialogComponent,
    Loader,
    MainContainer,
  ],
  templateUrl: "./profile.html",
  styleUrl: "./profile.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Profile {
  private readonly authStore = inject(AuthStore);
  encuestaService = inject(EncuestaService);
  private readonly router = inject(Router);

  protected readonly currentUser = this.authStore.usuario;
  protected readonly showLogoutDialog = signal(false);

  surveyCount = toSignal(this.encuestaService.getUserParticipationCount(), {
    initialValue: 0,
  });

  protected readonly userStats = computed(
    (): UserStats => ({
      quizzes: 12,
      surveys: this.surveyCount(),
      points: 245,
    }),
  );

  protected editProfile(): void {
    this.router.navigate(["/ajustes/perfil"]);
  }

  protected shareProfile(): void {
    console.log("Compartir perfil");
  }

  protected viewStats(): void {
    this.router.navigate(["/estadisticas"]);
  }

  protected viewParticipations(): void {
    this.router.navigate(["/participaciones"]);
  }

  protected confirmLogout(): void {
    this.showLogoutDialog.set(true);
  }

  protected onLogoutCancel(): void {
    this.showLogoutDialog.set(false);
  }

  protected onLogoutConfirm(): void {
    this.showLogoutDialog.set(false);
    this.authStore.logout();
  }
}
