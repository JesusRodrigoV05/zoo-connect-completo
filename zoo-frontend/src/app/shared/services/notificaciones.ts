import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { Notificacion } from '@models/notificaciones';

@Injectable({
  providedIn: 'root'
})
export class Notificaciones {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getNotificaciones(){
    return this.http.get(`${this.apiUrl}/notificaciones`);
  }

  getMockNotificaciones(): Notificacion[]{
    return [
      { idNotificacion: 1, mensaje: 'Nueva solicitud de amistad', leido: false, fecha: new Date() },
      { idNotificacion: 2, mensaje: 'Tu publicación ha sido comentada', leido: true, fecha: new Date() },
      { idNotificacion: 3, mensaje: 'Actualización de la política de privacidad', leido: false, fecha: new Date() },
      { idNotificacion: 4, mensaje: 'Recordatorio de evento próximo', leido: true, fecha: new Date() },
      { idNotificacion: 5, mensaje: 'Nuevo seguidor en tu perfil', leido: false, fecha: new Date() }
    ];
  }

  getNotificacionesNoLeidas() {
    return this.getMockNotificaciones().filter(notificacion => !notificacion.leido);
  }

  getContadorNoLeidas() {
    return this.getNotificacionesNoLeidas().length;
  }
}
