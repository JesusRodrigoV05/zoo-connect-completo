import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { LogoImage } from '../logo-image';

@Component({
  selector: 'zoo-footer',
  imports: [RouterLink, ButtonModule, LogoImage],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {}
