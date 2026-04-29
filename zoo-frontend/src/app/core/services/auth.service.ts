import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError, from } from 'rxjs';
import { catchError, first, map, switchMap, tap } from 'rxjs/operators';
import { Usuario } from '@models/usuario/usuario.model';
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, UpdateProfileRequest } from '@models/usuario/request_response.model';
import { Auth } from '@app/features/auth/services/auth';
import { EncryptionService } from './encryption.service';
import { ShowToast } from '@app/shared/services/show-toast';
import { Theme } from '@app/features/private/settings/services/theme-service';
import { environment } from '@env';

export interface AuthState {
  usuario: Usuario | null;
  nombreMarca: string;
  twoFA: boolean;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  usuario: null,
  nombreMarca: environment.marca,
  twoFA: false,
  accessToken: null,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(Auth);
  private readonly encryptionService = inject(EncryptionService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ShowToast);
  private readonly themeService = inject(Theme);

  private state$ = new BehaviorSubject<AuthState>(initialState);
  state: Observable<AuthState> = this.state$.asObservable();

  // Observables públicos para facilitar el acceso
  get usuario$(): Observable<Usuario | null> {
    return this.state$.pipe(map(s => s.usuario));
  }
  get loading$(): Observable<boolean> {
    return this.state$.pipe(map(s => s.loading));
  }
  get error$(): Observable<string | null> {
    return this.state$.pipe(map(s => s.error));
  }
  get isAuthenticated$(): Observable<boolean> {
    return this.state$.pipe(map(s => !!s.usuario && !!s.accessToken));
  }
  get userRole$(): Observable<any> {
    return this.state$.pipe(map(s => s.usuario?.rol));
  }
  get isAdmin$(): Observable<boolean> {
    return this.state$.pipe(map(s => s.usuario?.rol?.id === 1)); // Ajustar según tu enum RolId
  }

  private setState(partial: Partial<AuthState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }

  async login(email: string, password: string, recaptchaToken?: string): Promise<LoginResponse | undefined> {
    this.setState({ loading: true, error: null });

    try {
      const encryptedPassword = await this.encryptionService.encrypt(password);
      const loginData: LoginRequest = { email, password: encryptedPassword };
      if (recaptchaToken) {
        loginData.recaptcha_token = recaptchaToken;
      }

      const loginResponse = await firstValueFrom(
        this.authService.login(email, encryptedPassword, recaptchaToken)
      );

      if ('session_token' in loginResponse && loginResponse.session_token) {
        this.setState({ twoFA: true, loading: false });
        await this.router.navigate(['/verify-2fa'], {
          queryParams: { session_token: loginResponse.session_token },
        });
        return loginResponse;
      }

      this.setTokens(loginResponse.access_token);
      await this.loadUserProfile();

      const currentUser = this.state$.value.usuario;
      if (currentUser && !currentUser.fotoUrl) {
        const imagen = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
        const update: UpdateProfileRequest = {
          fotoUrl: `/assets/images/profile-icons/${imagen}.png`,
        };
        try {
          await firstValueFrom(this.authService.updateProfile(update));
          // Recargar perfil
          await this.loadUserProfile();
        } catch (updateError) {}
      }

      this.toastService.showSuccess('Inicio de sesión exitoso', 'Éxito');
      if (this.state$.value.usuario && !this.state$.value.usuario?.permisos?.includes('2FA_ENABLED')) {
        this.toastService.showWarning(
          'Habilitación de Verificación en dos pasos',
          'Tu cuenta puede ser más segura si habilitas la verificación en dos pasos.'
        );
      }
      await this.router.navigate(['/inicio']);
      return loginResponse;
    } catch (error: any) {
      this.handleError(error, 'login');
      return undefined;
    }
  }

  async register(email: string, username: string, password?: string, generate_password: boolean = false, recaptchaToken?: string): Promise<RegisterResponse | undefined> {
    this.setState({ loading: true, twoFA: false, error: null });
    try {
      let finalPassword = password;
      if (password && !generate_password) {
        finalPassword = await this.encryptionService.encrypt(password);
      }

      const response = await firstValueFrom(
        this.authService.register(email, username, finalPassword, generate_password, recaptchaToken)
      );
      this.setState({ loading: false });
      this.toastService.showSuccess('Éxito', 'Registro exitoso. Por favor, inicia sesión.');
      return response;
    } catch (error: any) {
      this.handleError(error, 'register');
      throw error;
    }
  }

  async loadUserProfile(): Promise<void> {
    const currentToken = this.state$.value.accessToken;
    if (!currentToken || !this.isTokenValid(currentToken, 0)) {
      try {
        await this.refreshTokens();
      } catch (e) {
        this.clearAuthStateAndStorage();
        return;
      }
    }

    this.setState({ loading: true, error: null });
    try {
      const usuario = await firstValueFrom(
        this.authService.getProfile().pipe(
          map(user => {
            // Adaptar usuario si es necesario
            return user;
          })
        )
      );
      this.setState({ usuario, loading: false, error: null });
    } catch (error: any) {
      this.handleError(error, 'cargar perfil');
    }
  }

  async refreshTokens(): Promise<void> {
    try {
      this.setState({ loading: true });
      const response = await firstValueFrom(this.authService.refreshToken());
      this.setTokens(response.access_token);
      this.setState({ loading: false });
    } catch (error: any) {
      this.handleError(error, 'refrescar token');
      throw error;
    }
  }

  logout(): void {
    this.setState({ loading: true, twoFA: false, error: null });
    this.authService.logout().pipe(
      catchError(err => {
        console.warn('Error al cerrar sesión en el servidor (ignorado):', err);
        return of(null);
      })
    ).subscribe({
      next: () => {
        this.clearAuthStateAndStorage();
        this.themeService.setTheme('light');
        this.toastService.showSuccess('Sesión cerrada exitosamente', 'Éxito');
        this.router.navigate(['/login']);
      }
    });
  }

  clearError(): void {
    this.setState({ error: null });
  }

  private setTokens(accessToken: string): void {
    if (isPlatformBrowser()) {
      localStorage.setItem('access_token', accessToken);
    }
    this.setState({ accessToken, error: null });
  }

  private clearAuthStateAndStorage(): void {
    if (isPlatformBrowser()) {
      localStorage.removeItem('access_token');
      localStorage.removeItem(this.themeService.THEME_KEY);
    }
    this.state$.next(initialState);
  }

  private isTokenValid(token: string, bufferSeconds: number = 300): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      const buffer = bufferSeconds * 1000;
      return exp > now + buffer;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  private handleError(error: any, context: string): void {
    console.error(`Error en ${context}:`, error);
    let errorMessage = `Error en ${context}`;
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error?.status === 401) {
      errorMessage = context === 'login' ? 'Email o contraseña incorrectos' : 'Sesión expirada o no autorizado';
    } else if (error?.status === 400 && context === 'login') {
      errorMessage = 'Usuario inactivo. Contacte al administrador';
    } else if (error?.status === 403 && context === 'login') {
      errorMessage = 'Cuenta bloqueada temporalmente, intente dentro de 30 minutos';
    } else if (error?.status === 400 && context === 'register') {
      errorMessage = error.error?.message?.includes('email') ? 'Este email ya está registrado. Intente con otro email' : 'Datos de registro inválidos';
    } else if (error?.status === 422 && context === 'register') {
      errorMessage = 'Formato de email inválido o contraseña muy débil';
    } else if (error?.status === 429) {
      errorMessage = 'Demasiados intentos. Intenta de nuevo más tarde';
    } else if (error?.message?.includes('NetworkError') || error?.status === 0) {
      errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión';
    } else if (error?.error?.detail) {
      errorMessage = Array.isArray(error.error.detail) ? error.error.detail[0].msg : error.error.detail;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    this.setState({ error: errorMessage, loading: false });
    this.toastService.showError(`Error en ${context}`, errorMessage);

    if (error?.status === 401 || error?.status === 403) {
      if (context !== 'login' && context !== 'register') {
        this.logout();
      } else if (context === 'login') {
        this.clearAuthStateAndStorage();
      }
    }
  }

  async initializeAuth(): Promise<void> {
    this.setState({ loading: true });
    try {
      const accessToken = isPlatformBrowser() ? localStorage.getItem('access_token') : null;
      if (accessToken) {
        this.setState({ accessToken });
        if (this.isTokenValid(accessToken)) {
          await this.loadUserProfile();
        } else {
          try {
            await this.refreshTokens();
            await this.loadUserProfile();
          } catch (refreshError) {
            this.clearAuthStateAndStorage();
          }
        }
      } else {
        try {
          await this.refreshTokens();
          await this.loadUserProfile();
        } catch (e) {
          this.clearAuthStateAndStorage();
        }
      }
    } catch (error) {
      console.error('Error durante inicialización:', error);
      this.clearAuthStateAndStorage();
    } finally {
      this.setState({ loading: false });
    }
  }

  hasPermission(permission: string): boolean {
    return this.state$.value.usuario?.permisos?.includes(permission) ?? false;
  }
}

function isPlatformBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function firstValueFrom<T>(observable: Observable<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    observable.pipe(first()).subscribe({
      next: resolve,
      error: reject,
    });
  });
}
