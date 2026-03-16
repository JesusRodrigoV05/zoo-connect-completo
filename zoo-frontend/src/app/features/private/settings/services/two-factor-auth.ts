import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { Observable } from "rxjs";

export interface Enable2FAResponse {
  secret: string;
  otpauth_uri: string;
}

export interface Verify2FAResponse {
  backup_codes: string[];
}

export interface Disable2FARequest {
  password: string;
}

@Injectable({
  providedIn: "root",
})
export class TwoFactorAuth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly securityUrl = `${this.apiUrl}/security/2fa`;

  enable2FA(): Observable<Enable2FAResponse> {
    return this.http.post<Enable2FAResponse>(`${this.securityUrl}/enable`, {});
  }

  verify2FA(totpCode: string): Observable<Verify2FAResponse> {
    return this.http.post<Verify2FAResponse>(`${this.securityUrl}/verify`, {
      totp_code: totpCode,
    });
  }

  disable2FA(password: string): Observable<void> {
    return this.http.post<void>(`${this.securityUrl}/disable`, {
      password,
    });
  }

  verifyLogin2FA(
    sessionToken: string,
    code: string,
  ): Observable<{
    access_token: string;
    refresh_token: string;
    token_type: string;
  }> {
    return this.http.post<{
      access_token: string;
      refresh_token: string;
      token_type: string;
    }>(`${this.apiUrl}/auth/2fa/verify-login`, {
      session_token: sessionToken,
      code,
    });
  }
}
