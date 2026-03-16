import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

/**
 * Servicio centralizado para mostrar notificaciones Toast de PrimeNG.
 */
@Injectable({
  providedIn: 'root',
})
export class ShowToast {
  private messageService = inject(MessageService);

  /**
   * Muestra un mensaje de éxito.
   */
  showSuccess(summary: string, detail: string, life: number = 3000) {
    const message = {
      severity: 'success',
      summary: summary,
      detail: detail,
      life: life,
    };
    this.messageService.add(message);
  }

  showError(summary: string, detail: string, life: number = 5000) {
    const message = {
      severity: 'error',
      summary: summary,
      detail: detail,
      life: life,
    };
    this.messageService.add(message);
  }

  showWarning(summary: string, detail: string, life: number = 4000) {
    const message = {
      severity: 'warn',
      summary: summary,
      detail: detail,
      life: life,
    };
    this.messageService.add(message);
  }

  showInfo(summary: string, detail: string, life: number = 3000): void {
    const message = {
      severity: 'info',
      summary: summary,
      detail: detail,
      life: life,
    };
    this.messageService.add(message);
  }

  showContrast(summary: string, detail: string, life: number = 3000): void {
    const message = {
      severity: 'contrast',
      summary: summary,
      detail: detail,
      life: life,
    };
    this.messageService.add(message);
  }

  showSecondary(summary: string, detail: string, life: number = 3000): void {
    const message = {
      severity: 'secondary',
      summary: summary,
      detail: detail,
      life: life,
    };
    this.messageService.add(message);
  }

  clear(): void {
    this.messageService.clear();
  }
}
