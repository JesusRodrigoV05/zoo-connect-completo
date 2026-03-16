import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'zoo-main-container',
  templateUrl: './main-container.html',
  styleUrl: './main-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainContainer {}
