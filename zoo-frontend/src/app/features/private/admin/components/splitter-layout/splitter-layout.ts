import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SplitterModule } from 'primeng/splitter';

@Component({
  selector: 'zoo-splitter-layout',
  imports: [SplitterModule, ScrollPanelModule],
  templateUrl: './splitter-layout.html',
  styleUrls: ['./splitter-layout.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SplitterLayout {}
