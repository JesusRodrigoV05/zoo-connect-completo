import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { AuthStore } from "@app/core/stores/auth.store";
import { ProfileButton } from "./components/profile-button";
import { LogoImage } from "../logo-image";
import { ButtonModule } from "primeng/button";
import { OverlayBadgeModule } from "primeng/overlaybadge";
import { NotificationButton } from "./components/notification-button";
import { DrawerModule } from "primeng/drawer";
import { TooltipModule } from "primeng/tooltip";
import { NgClass } from "@angular/common";
import { environment } from "@env";

export interface NavButton {
  readonly label: string;
  readonly route: string;
  readonly icon?: string;
  readonly disabled?: boolean;
  readonly comingSoon?: boolean;
  readonly exactMatch?: boolean;
}

@Component({
  selector: "zoo-header",
  imports: [
    RouterLink,
    ProfileButton,
    LogoImage,
    ButtonModule,
    OverlayBadgeModule,
    NotificationButton,
    DrawerModule,
    TooltipModule,
    NgClass,
  ],
  templateUrl: "./header.html",
  styleUrl: "./header.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Header {
  private authStore = inject(AuthStore);
  private router = inject(Router);
  readonly autenticado = computed(() => this.authStore.isAuthenticated());
  readonly isAdmin = computed(() => this.authStore.isAdmin());
  protected name = environment.marca;

  protected menuVisible = signal(false);

  protected showMenu(show: boolean) {
    this.menuVisible.set(show);
  }

  protected isRouteActive(route: string, exactMatch: boolean = false): boolean {
    return this.router.isActive(route, {
      paths: exactMatch ? "exact" : "subset",
      queryParams: "subset",
      fragment: "ignored",
      matrixParams: "ignored",
    });
  }

  protected readonly navigationButtons = signal<NavButton[]>([
    {
      label: "Inicio",
      route: "/",
      icon: "home",
      exactMatch: true,
    },
    {
      label: "Animales",
      route: "/animales",
      icon: "heart",
    },
    {
      label: "Quiz",
      route: "/quizzes",
      icon: "question-circle",
    },
    {
      label: "Encuestas",
      route: "/encuestas",
      icon: "chart-bar",
    },
    {
      label: "Sobre nosotros",
      route: "/acerca-de",
      icon: "info-circle",
    },
  ]);

  protected logout(): void {
    this.authStore.logout();
  }
}
