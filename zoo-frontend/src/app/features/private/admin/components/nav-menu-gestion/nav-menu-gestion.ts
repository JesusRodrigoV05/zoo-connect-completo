import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MenuButton } from '../../models';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-nav-menu-gestion',
  imports: [ButtonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav-menu-gestion.html',
  styleUrl: './nav-menu-gestion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavMenuGestion {
  buttons = input.required<MenuButton[]>();
}
