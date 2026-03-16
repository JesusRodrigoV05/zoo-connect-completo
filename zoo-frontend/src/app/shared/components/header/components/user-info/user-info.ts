import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Usuario } from '@models/usuario/usuario.model';
import { UserAvatar } from '@app/shared/components/user-avatar';

@Component({
  selector: 'zoo-user-info',
  imports: [UserAvatar],
  templateUrl: './user-info.html',
  styleUrl: './user-info.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfo {
  readonly user = input<Usuario | null>(null);

  protected readonly userRoleName = () => this.user()?.rol?.nombre || 'Usuario';
}
