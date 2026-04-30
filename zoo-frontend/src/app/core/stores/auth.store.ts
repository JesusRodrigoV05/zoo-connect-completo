import { computed, inject, PLATFORM_ID } from '@angular/core';
import {
  signalStore,
  withComputed,
  withMethods,
  withState,
  patchState,
} from '@ngrx/signals';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RolId, Usuario } from '@models/usuario/usuario.model';
import { Auth } from '@app/features/auth/services';
import {
  LoginResponse,
  UpdateProfileRequest,
  RegisterResponse,
} from "@models/usuario/request_response.model";
import { isPlatformBrowser } from "@angular/common";
import { ShowToast } from "@app/shared/services";
import { Theme } from "@app/features/private/settings/services/theme-service";
import { environment } from "@env";
import { EncryptionService } from "../services/encryption.service";

interface AuthState {
  usuario: Usuario | null;
  nombreMarca: string;
  twoFA: boolean;
  accessToken: string | null;
  loading: boolean;
  error: string | null;
}

function getInitialState(): AuthState {
  return {
    usuario: null,
    nombreMarca: environment.marca,
    twoFA: false,
    accessToken: null,
    loading: false,
    error: null,
  };
}

const ACCESS_TOKEN_KEY = 'access_token';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(getInitialState()),
  withComputed(({ usuario, accessToken, twoFA }) => ({
    suggest2FA: computed(() => {
      const u = usuario();
      return !!u && Number(u.rol?.id) !== RolId.VISITANTE && !twoFA();
    }),
    twoFAenabled: computed(() => twoFA()),
    isAuthenticated: computed(() => !!usuario() && !!accessToken()),
    userRole: computed(() => usuario()?.rol),
    isAdmin: computed(() => usuario()?.rol.id === RolId.ADMIN),
    isVeterinario: computed(() => usuario()?.rol.id === RolId.VETERINARIO),
    isCuidador: computed(() => usuario()?.rol.id === RolId.CUIDADOR),
    isOsi: computed(() => usuario()?.rol.id === RolId.OSI),
    isVisitante: computed(() => usuario()?.rol.id === RolId.VISITANTE),
    permissions: computed(() => usuario()?.permisos ?? []),
    userId: computed(() => parseInt(usuario()?.id ?? "0")),
  })),
  withMethods(
    (
      store,
      authService = inject(Auth),
      router = inject(Router),
      platformId = inject(PLATFORM_ID),
      toastService = inject(ShowToast),
      themeService = inject(Theme),
      encryptionService = inject(EncryptionService),
    ) => {
      const setTokenInStorage = (key: string, value: string): void => {
        if (isPlatformBrowser(platformId)) {
          localStorage.setItem(key, value);
        }
      };

      const getTokenFromStorage = (key: string): string | null => {
        if (isPlatformBrowser(platformId)) {
          return localStorage.getItem(key);
        }
        return null;
      };

      const removeTokenFromStorage = (key: string): void => {
        if (isPlatformBrowser(platformId)) {
          localStorage.removeItem(key);
        }
      };

      const clearAuthStateAndStorage = () => {
        removeTokenFromStorage(ACCESS_TOKEN_KEY);
        removeTokenFromStorage(themeService.THEME_KEY);
        patchState(store, getInitialState());
      };

      const isTokenValid = (
        token: string | null,
        bufferSeconds: number = 300,
      ): boolean => {
        if (!token) return false;
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
      };

      const handleError = (error: any, context: string): string => {
        console.error(`Error en ${context}:`, error);
        let errorMessage = `Error en ${context}`;
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.status === 401) {
          errorMessage =
            context === 'login'
              ? 'Email o contraseña incorrectos'
              : 'Sesión expirada o no autorizado';
        } else if (error?.status === 400 && context === 'login') {
          errorMessage = 'Usuario inactivo. Contacte al administrador';
        } else if (error?.status === 403 && context === 'login') {
          errorMessage =
            'Cuenta bloqueada temporalmente, intente dentro de 30 minutos';
        } else if (error?.status === 400 && context === 'register') {
          errorMessage = error.error?.message?.includes('email')
            ? 'Este email ya está registrado. Intente con otro email'
            : 'Datos de registro inválidos';
        } else if (error?.status === 422 && context === 'register') {
          errorMessage = 'Formato de email inválido o contraseña muy débil';
        } else if (error?.status === 429) {
          errorMessage = 'Demasiados intentos. Intenta de nuevo más tarde';
        } else if (
          error?.message?.includes('NetworkError') ||
          error?.status === 0
        ) {
          errorMessage =
            'No se pudo conectar con el servidor. Verifique su conexión';
        } else if (error?.error?.detail) {
          errorMessage = Array.isArray(error.error.detail)
            ? error.error.detail[0].msg
            : error.error.detail;
        } else if (error?.message) {
          errorMessage = error.message;
        }

        patchState(store, { error: errorMessage, loading: false });
        toastService.showError(`Error en ${context}`, errorMessage);

        if (error?.status === 401 || error?.status === 403) {
          if (context !== 'login' && context !== 'register') {
            methods.logoutSilently();
          } else if (context === 'login') {
            clearAuthStateAndStorage();
          }
        }
        return errorMessage;
      };

      const methods = {
        async login(email: string, password: string, recaptchaToken?: string) {
          patchState(store, {
            loading: true,
            error: null,
          });

          try {
            // Cifrar contraseña antes de enviar
            const encryptedPassword = await encryptionService.encrypt(password);
            
            const loginResponse: LoginResponse = await firstValueFrom(
              authService.login(email, encryptedPassword, recaptchaToken),
            );

            if (
              'session_token' in loginResponse &&
              loginResponse.session_token
            ) {
              patchState(store, {
                twoFA: true,
                loading: false,
              });

              await router.navigate(['/verify-2fa'], {
                queryParams: { session_token: loginResponse.session_token },
              });
              return;
            }

            methods.setTokens(loginResponse.access_token);
            await methods.loadUserProfile();

            const currentUser = store.usuario();

            if (currentUser && !currentUser.fotoUrl) {
              const imagen = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
              const update: UpdateProfileRequest = {
                fotoUrl: `/assets/images/profile-icons/${imagen}.png`,
              };

              try {
                const updatedUser = await firstValueFrom(
                  authService.updateProfile(update),
                );
                patchState(store, { usuario: updatedUser });
              } catch (updateError) {}
            }

            console.log(currentUser);

            toastService.showSuccess('Inicio de sesión exitoso', 'Éxito');

            if (store.suggest2FA()) {
              toastService.showWarning(
                'Habilitación de Verificacion en dos pasos',
                'Tu cuenta puede ser más segura si habilitas la verificación en dos pasos.',
              );
            }
            await router.navigate(['/inicio']);
          } catch (error: any) {
            handleError(error, 'login');
          }
        },

        set2FAStatus(status: boolean) {
          patchState(store, {
            twoFA: status,
          });
        },

        async register(
          email: string,
          username: string,
          password?: string,
          generate_password: boolean = false,
          recaptchaToken?: string,
        ): Promise<RegisterResponse | undefined> {
          patchState(store, { loading: true, twoFA: false, error: null });
          try {
            let finalPassword = password;
            if (password && !generate_password) {
              finalPassword = await encryptionService.encrypt(password);
            }

            const response: RegisterResponse = await firstValueFrom(
              authService.register(email, username, finalPassword, generate_password, recaptchaToken),
            );
            patchState(store, { loading: false });
            toastService.showSuccess(
              'Éxito',
              'Registro exitoso. Por favor, inicie sesión.',
            );
            // Do not navigate here — caller (component) may want to show generated password modal
            return response;
          } catch (error: any) {
            handleError(error, 'register');
            throw error;
          }
        },

        async verifyEmail(email: string, code: string): Promise<void> {
          patchState(store, { loading: true, error: null });
          try {
            await firstValueFrom(authService.verifyEmail(email, code));
            patchState(store, { loading: false });
            toastService.showSuccess(
              '¡Éxito!',
              'Correo verificado correctamente. Ya puedes iniciar sesión.',
            );
            await router.navigate(['/login']);
          } catch (error: any) {
            handleError(error, 'verificación de email');
            throw error;
          }
        },

        async updateProfilePicture(fotoUrl: string, silent = false) {
          patchState(store, { loading: true, error: null });

          const update: UpdateProfileRequest = { fotoUrl };

          try {
            const updatedUser = await firstValueFrom(
              authService.updateProfile(update),
            );

            patchState(store, { usuario: updatedUser, loading: false });

            if (!silent) {
              toastService.showSuccess('¡Avatar actualizado!', 'Éxito');
            }
          } catch (error: any) {
            handleError(error, 'actualizar foto de perfil');
          }
        },

        async logout() {
          patchState(store, { loading: true, twoFA: false, error: null });
          try {
            await firstValueFrom(authService.logout());
          } catch (error: any) {
            console.warn(
              'Error al cerrar sesión en el servidor (ignorado):',
              error,
            );
          } finally {
            clearAuthStateAndStorage();
            themeService.setTheme('light');
            toastService.showSuccess('Sesión cerrada exitosamente', 'Éxito');
            await router.navigate(['/login']);
          }
        },

        logoutSilently() {
          clearAuthStateAndStorage();
          themeService.setTheme('light');
          router.navigate(['/login'], {
            queryParams: { sessionExpired: true },
          });
        },

        async loadUserProfile() {
          const currentToken = store.accessToken();
          if (!currentToken || !isTokenValid(currentToken, 0)) {
            try {
              await methods.refreshTokens();
            } catch (e) {
              patchState(store, { usuario: null, twoFA: false });
              handleError(e, 'cargar perfil (refresh fallido)');
              return;
            }
          }

          patchState(store, { loading: true, error: null });
          try {
            const usuario = await firstValueFrom(authService.getProfile());
            patchState(store, {
              usuario,
              loading: false,
              error: null,
            });
          } catch (error: any) {
            handleError(error, 'cargar perfil');
          } finally {
            patchState(store, { loading: false });
          }
        },

        async refreshTokens() {
          try {
            patchState(store, { loading: true });
            const response: LoginResponse = await firstValueFrom(
              authService.refreshToken(),
            );
            methods.setTokens(response.access_token);
            patchState(store, { loading: false });
            return response;
          } catch (error: any) {
            handleError(error, 'refrescar token');
            throw error;
          }
        },

        clearError() {
          patchState(store, { error: null });
        },

        setTokens(accessToken: string) {
          setTokenInStorage(ACCESS_TOKEN_KEY, accessToken);
          patchState(store, { accessToken, error: null });
        },

        hasPermission(permission: string): boolean {
          return store.usuario()?.permisos?.includes(permission) ?? false;
        },

        async initializeAuth() {
          patchState(store, { loading: true });
          try {
            const accessToken = getTokenFromStorage(ACCESS_TOKEN_KEY);

            if (accessToken) {
              patchState(store, { accessToken });

              if (isTokenValid(accessToken)) {
                await methods.loadUserProfile();
              } else {
                try {
                  await methods.refreshTokens();
                  await methods.loadUserProfile();
                } catch (refreshError) {
                  clearAuthStateAndStorage();
                }
              }
            } else {
              try {
                const response: LoginResponse = await firstValueFrom(
                  authService.refreshToken(),
                );

                methods.setTokens(response.access_token);
                await methods.loadUserProfile();
              } catch (e) {
                clearAuthStateAndStorage();
              }
            }
          } catch (error) {
            console.error('Error durante inicialización:', error);
            clearAuthStateAndStorage();
          } finally {
            patchState(store, { loading: false });
          }
        },
      };
      return methods;
    },
  ),
);
