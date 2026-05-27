import { Component, inject, OnInit, OnDestroy, NgZone, output, signal } from "@angular/core";
import { RecaptchaService } from "@app/core/services/recaptcha.service";
import { CustomCaptcha } from "@app/shared/components/custom-captcha/custom-captcha";

let nextId = 1;

@Component({
  selector: "zoo-captcha",
  standalone: true,
  imports: [CustomCaptcha],
  template: `
    @if (useCustomFallback()) {
      <app-custom-captcha (tokenChange)="onCustomToken($event)" />
    } @else {
      <div [id]="elementId" class="recaptcha-container"></div>
    }

    @if (showError() && !token()) {
      <small class="p-error recaptcha-error">Por favor, verifica que no eres un robot.</small>
    }
  `,
  styles: [`
    :host {
      display: block;
      margin: 1rem 0;
    }
    .recaptcha-container {
      display: flex;
      justify-content: center;
      min-height: 78px;
    }
    .recaptcha-error {
      display: block;
      margin-top: 0.25rem;
      text-align: center;
    }
  `],
})
export class ZooCaptcha implements OnInit, OnDestroy {
  private readonly recaptchaService = inject(RecaptchaService);
  private readonly ngZone = inject(NgZone);

  protected readonly token = signal<string | null>(null);
  protected readonly useCustomFallback = signal(false);
  protected readonly showError = signal(false);

  readonly tokenChange = output<string>();

  protected readonly elementId = `zoo-captcha-${nextId++}`;

  ngOnInit() {
    this.useCustomFallback.set(this.recaptchaService.shouldUseCustomFallback());

    if (!this.useCustomFallback()) {
      this.initRecaptchaWithRetry();
    }
  }

  private async initRecaptchaWithRetry(attempts = 0): Promise<void> {
    const el = document.getElementById(this.elementId);

    if (el) {
      try {
        await this.recaptchaService.render(this.elementId, (t: string) => {
          this.ngZone.run(() => {
            this.token.set(t);
            this.tokenChange.emit(t);
          });
        });
      } catch {
        this.ngZone.run(() => this.useCustomFallback.set(true));
      }
    } else if (attempts < 20) {
      await new Promise((r) => setTimeout(r, 200));
      return this.initRecaptchaWithRetry(attempts + 1);
    } else {
      this.ngZone.run(() => this.useCustomFallback.set(true));
    }
  }

  protected onCustomToken(t: string): void {
    this.token.set(t);
    this.tokenChange.emit(t);
  }

  triggerError(): void {
    this.showError.set(true);
  }

  reset(): void {
    this.token.set(null);
    this.showError.set(false);
  }

  ngOnDestroy() {
    this.recaptchaService.reset();
  }
}
