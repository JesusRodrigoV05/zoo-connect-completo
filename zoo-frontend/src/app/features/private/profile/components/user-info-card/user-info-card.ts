import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";
import { CardModule } from "primeng/card";
import { UserAvatar } from "@app/shared/components";
import type { Usuario } from "@models/usuario/usuario.model";

export interface UserStats {
  quizzes: number;
  surveys: number;
  points: number;
}

@Component({
  selector: "zoo-user-info-card",
  imports: [CardModule, UserAvatar],
  templateUrl: "./user-info-card.html",
  styleUrl: "./user-info-card.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoCardComponent {
  readonly user = input.required<Usuario>();
  readonly stats = input.required<UserStats>();

  protected readonly membershipText = computed(() => {
    const currentUser = this.user();
    return `${currentUser.rol.nombre} desde ${new Date(
      currentUser.creadoEn,
    ).getFullYear()}`;
  });
}
