import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'zoo-form-field',
  imports: [ReactiveFormsModule, FloatLabelModule, InputTextModule, PasswordModule, MessageModule],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormField {
  readonly label = input.required<string>();
  readonly placeholder = input<string>('');
  readonly type = input<'text' | 'email' | 'password'>('text');
  readonly control = input.required<FormControl>();
  readonly errorMessage = input<string | null>(null);
  readonly showPasswordToggle = input<boolean>(false);

  readonly passwordVisible = signal(false);
  readonly togglePassword = output<void>();

  protected togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
    this.togglePassword.emit();
  }

  protected getInputType(): string {
    if (this.type() === 'password' && this.showPasswordToggle()) {
      return this.passwordVisible() ? 'text' : 'password';
    }
    return this.type();
  }

  protected isInvalid(): boolean {
    return this.control().invalid && this.control().touched;
  }
}