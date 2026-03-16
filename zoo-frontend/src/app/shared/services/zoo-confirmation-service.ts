import { Injectable, inject } from "@angular/core";
import { ConfirmationService } from "primeng/api";

export interface ConfirmOptions {
  key?: string;
  target?: EventTarget;
  message: string;
  header?: string;
  icon?: string;
  acceptLabel?: string;
  rejectLabel?: string;
  accept: () => void;
  reject?: () => void;
}

@Injectable({
  providedIn: "root",
})
export class ZooConfirmationService {
  private confirmationService = inject(ConfirmationService);

  public delete(options: ConfirmOptions) {
    this.confirmationService.confirm({
      key: options.key || "confirm-dialog",
      target: options.target || undefined,
      message: options.message,
      header: options.header || "Confirmar eliminación",
      icon: options.icon || "pi pi-exclamation-triangle",
      rejectButtonProps: {
        label: options.rejectLabel || "Cancelar",
        severity: "secondary",
        rounded: true,
        outlined: true,
      },
      acceptButtonProps: {
        label: options.acceptLabel || "Eliminar",
        rounded: true,
        severity: "danger",
      },

      accept: options.accept,
      reject: options.reject,
    });
  }
  public confirm(options: ConfirmOptions) {
    this.confirmationService.confirm({
      key: options.key || "confirm-dialog",
      target: options.target || undefined,
      message: options.message,
      header: options.header || "Confirmación",
      icon: options.icon || "pi pi-info-circle",

      rejectButtonProps: {
        label: options.rejectLabel || "Cancelar",
        severity: "secondary",
        rounded: true,
        outlined: true,
      },
      acceptButtonProps: {
        label: options.acceptLabel || "Aceptar",
        rounded: true,
        severity: "primary",
      },

      accept: options.accept,
      reject: options.reject,
    });
  }
}
