import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dummy-content',
  imports: [],
  templateUrl: './dummy-content.html',
  styleUrl: './dummy-content.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DummyContent {

}
