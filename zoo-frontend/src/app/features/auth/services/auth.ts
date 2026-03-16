import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { map, Observable } from "rxjs";
import {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  RegisterRequest,
  ResetPasswordRequest,
  TokenResponse,
  UpdateProfileRequest,
  VerifyLogin2FARequest,
} from "@models/usuario/request_response.model";
import { Usuario } from "@models/usuario/usuario.model";
import { environment } from "@env";
import {
  BackendUpdateProfileRequest,
  UsuarioBackendResponse,
  UsuarioAdapter,
} from "@adapters/usuario";

@Injectable({
  providedIn: "root",
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}`;
  private readonly authUrl = `${this.apiUrl}/auth`;

  register(
    email: string,
    username: string,
    password: string,
  ): Observable<Usuario> {
    const registerData: RegisterRequest = { email, username, password };
    return this.http
      .post<UsuarioBackendResponse>(`${this.authUrl}/register`, registerData)
      .pipe(map((backendUser) => UsuarioAdapter.fromBackend(backendUser)));
  }

  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, loginData);
  }

  verifyLogin2FA(data: VerifyLogin2FARequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${this.authUrl}/2fa/verify-login`,
      data,
    );
  }

  refreshToken(): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(
      `${this.authUrl}/refresh`,
      {},
      { withCredentials: true },
    );
  }

  logout(): Observable<LogoutResponse> {
    return this.http
      .post<string>(`${this.authUrl}/logout`, {}, { withCredentials: true })
      .pipe(map((apiResponse) => ({ msg: apiResponse })));
  }

  getProfile(): Observable<Usuario> {
    return this.http
      .get<UsuarioBackendResponse>(`${this.authUrl}/me`)
      .pipe(map((backendUser) => UsuarioAdapter.fromBackend(backendUser)));
  }

  updateProfile(updateData: UpdateProfileRequest): Observable<Usuario> {
    const backendRequest: BackendUpdateProfileRequest =
      UsuarioAdapter.toUpdateProfileRequest(updateData);

    return this.http
      .put<UsuarioBackendResponse>(
        `${this.authUrl}/update-profile`,
        backendRequest,
      )
      .pipe(map((backendUser) => UsuarioAdapter.fromBackend(backendUser)));
  }

  forgotPassword(email: string): Observable<string> {
    const requestData: ForgotPasswordRequest = { email };
    return this.http.post<string>(
      `${this.authUrl}/forgot-password`,
      requestData,
    );
  }

  resetPassword(token: string, new_password: string): Observable<string> {
    const requestData: ResetPasswordRequest = { token, new_password };
    return this.http.post<string>(
      `${this.authUrl}/reset-password`,
      requestData,
    );
  }
}
