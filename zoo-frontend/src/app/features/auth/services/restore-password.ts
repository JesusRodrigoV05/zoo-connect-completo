import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@env';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestorePassword {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly authUrl = `${this.apiUrl}/auth`;

  forgotPassword(email: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.authUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.authUrl}/reset-password`, {
      token,
      new_password: newPassword
    });
  }
}
