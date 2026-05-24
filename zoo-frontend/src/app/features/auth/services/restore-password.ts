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

  forgotPassword(email: string, recaptchaToken?: string): Observable<{ msg: string }> {
    return this.http.post<{ msg: string }>(`${this.authUrl}/forgot-password`, {
      email,
      recaptcha_token: recaptchaToken,
    });
  }

  resetPassword(token: string, newPassword: string, recaptchaToken?: string): Observable<{ msg?: string; access_token?: string; token_type?: string }> {
    return this.http.post<{ msg?: string; access_token?: string; token_type?: string }>(`${this.authUrl}/reset-password`, {
      token,
      new_password: newPassword,
      recaptcha_token: recaptchaToken
    });
  }
}
