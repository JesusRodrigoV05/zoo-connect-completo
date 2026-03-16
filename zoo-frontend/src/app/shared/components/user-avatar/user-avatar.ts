import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { AuthStore } from '@app/core/stores/auth.store';

@Component({
  selector: 'zoo-user-avatar',
  imports: [NgOptimizedImage],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatar {
  private readonly user = inject(AuthStore).usuario;

  readonly size = input<number>(40);
  readonly cssClass = input<string>('');
  readonly priority = input<boolean>(false);

  protected readonly defaultAvatarUrl = '/assets/images/default-avatar.jpg';

  protected readonly avatarUrl = () =>
    this.user()?.fotoUrl || this.defaultAvatarUrl;
  protected readonly altText = () => `Avatar de ${this.user()?.username}`;
}
