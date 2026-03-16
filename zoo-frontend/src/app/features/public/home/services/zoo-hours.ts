import { Injectable } from "@angular/core";
import { ZooStatus } from "../models/zoo-hours.model";

@Injectable({
  providedIn: "root",
})
export class ZooHours {
  private readonly OPEN_HOUR = 9;
  private readonly CLOSE_HOUR = 16;
  private readonly WARNING_MINUTES = 60;

  getStatus(): ZooStatus {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const nowInMinutes = currentHour * 60 + currentMinutes;
    const openInMinutes = this.OPEN_HOUR * 60;
    const closeInMinutes = this.CLOSE_HOUR * 60;

    if (nowInMinutes < openInMinutes) {
      const diff = openInMinutes - nowInMinutes;
      if (diff <= this.WARNING_MINUTES) {
        return {
          state: "opening-soon",
          message: "Abre pronto",
          subMessage: `Abrimos en ${diff} min`,
          colorClass: "status-warning",
        };
      }
      return {
        state: "closed",
        message: "Cerrado",
        subMessage: `Abre a las ${this.OPEN_HOUR}:00`,
        colorClass: "status-danger",
      };
    }

    if (nowInMinutes >= closeInMinutes) {
      return {
        state: "closed",
        message: "Cerrado",
        subMessage: "Nos vemos mañana",
        colorClass: "status-danger",
      };
    }

    const diffClose = closeInMinutes - nowInMinutes;
    if (diffClose <= this.WARNING_MINUTES) {
      return {
        state: "closing-soon",
        message: "Cierra pronto",
        subMessage: `Cerramos en ${diffClose} min`,
        colorClass: "status-warning",
      };
    }

    return {
      state: "open",
      message: "Abierto ahora",
      subMessage: `Hasta las ${this.CLOSE_HOUR}:00`,
      colorClass: "status-success",
    };
  }
}
