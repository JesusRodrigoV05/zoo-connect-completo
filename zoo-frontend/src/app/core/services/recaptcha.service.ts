import { Injectable, inject } from '@angular/core';
import { environment } from '@env';

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private readonly siteKey = environment.recaptchaSiteKey;
  private scriptLoaded = false;
  private loadPromise: Promise<void> | null = null;
  private widgetId: any = null;
  private useCustomFallback = false;

  /**
   * Carga el script de reCAPTCHA v2 (visible) dinámicamente.
   * Si falla, activa el modo fallback.
   */
  loadScript(): Promise<void> {
    if (this.scriptLoaded) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise<void>((resolve, reject) => {
      if ((window as any).grecaptcha) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        const devFallback = !this.siteKey || this.siteKey.includes('xxxxxxxxxx');
        this.useCustomFallback = devFallback;

        if (devFallback) {
          resolve();
          return;
        }

        reject(new Error('No se pudo cargar Google reCAPTCHA'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * Verifica si debemos usar el widget propio.
   */
  shouldUseCustomFallback(): boolean {
    return this.useCustomFallback;
  }

  /**
   * Renderiza el widget visible de reCAPTCHA v2 en un elemento DOM.
   */
  render(elementId: string, callback: (token: string) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.shouldUseCustomFallback()) {
        // No renderizar reCAPTCHA, se usará el widget propio
        resolve();
        return;
      }

      this.loadScript().then(() => {
        if (this.shouldUseCustomFallback()) {
          resolve();
          return;
        }

        (window as any).grecaptcha.ready(() => {
          if (this.widgetId !== null) {
            (window as any).grecaptcha.reset(this.widgetId);
          }
          
          const element = document.getElementById(elementId);
          if (!element) {
            reject(new Error(`Elemento con ID ${elementId} no encontrado`));
            return;
          }

          this.widgetId = (window as any).grecaptcha.render(elementId, {
            sitekey: this.siteKey,
            callback: (token: string) => {
              callback(token);
            },
            'expired-callback': () => {
              if (this.widgetId !== null) {
                (window as any).grecaptcha.reset(this.widgetId);
              }
            }
          });
          resolve();
        });
      }).catch(() => {
        this.useCustomFallback = true;
        resolve();
      });
    });
  }

  /**
   * Obtiene el token del widget renderizado.
   */
  getResponse(): string | null {
    if ((window as any).grecaptcha && this.widgetId !== null) {
      return (window as any).grecaptcha.getResponse(this.widgetId);
    }
    return null;
  }

  /**
   * Resetea el widget de reCAPTCHA.
   */
  reset(): void {
    if ((window as any).grecaptcha && this.widgetId !== null) {
      (window as any).grecaptcha.reset(this.widgetId);
    }
  }
}
