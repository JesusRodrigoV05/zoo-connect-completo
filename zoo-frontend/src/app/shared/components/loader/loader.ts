import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'zoo-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  readonly size = input<number>(30);
  readonly color = input<string | null>(null);
}
