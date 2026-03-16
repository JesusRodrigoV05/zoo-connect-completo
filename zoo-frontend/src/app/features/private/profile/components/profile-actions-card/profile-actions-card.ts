import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';

interface ActionStates {
  edit: boolean;
  share: boolean;
  stats: boolean;
}

interface ActionTooltips {
  edit: string;
  share: string;
  stats: string;
}

@Component({
  selector: 'zoo-profile-actions-card',
  imports: [ButtonModule, CardModule, DividerModule, TooltipModule],
  templateUrl: './profile-actions-card.html',
  styleUrl: './profile-actions-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileActionsCardComponent {
  readonly disabledActions = input<ActionStates>();
  readonly tooltips = input<ActionTooltips>();
  readonly editProfile = output<void>();
  readonly shareProfile = output<void>();
  readonly viewStats = output<void>();
  readonly viewParticipations = output<void>();
  readonly logout = output<void>();

  protected onEditProfile(): void {
    this.editProfile.emit();
  }

  protected onShareProfile(): void {
    this.shareProfile.emit();
  }

  protected onViewStats(): void {
    this.viewStats.emit();
  }

  protected onViewParticipations(): void {
    this.viewParticipations.emit();
  }

  protected onLogout(): void {
    this.logout.emit();
  }
}
