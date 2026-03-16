import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'zoo-logout-dialog',
  imports: [DialogModule, ButtonModule],
  templateUrl: './logout-dialog.html',
  styleUrls: ['./logout-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogoutDialogComponent {
  readonly visible = input<boolean>(false);
  readonly onCancel = output<void>();
  readonly onConfirm = output<void>();

  protected cancel(): void {
    this.onCancel.emit();
  }

  protected confirm(): void {
    this.onConfirm.emit();
  }
}
