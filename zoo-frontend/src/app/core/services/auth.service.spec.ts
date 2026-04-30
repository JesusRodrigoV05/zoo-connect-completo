import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { EncryptionService } from './encryption.service';
import { Auth } from '@app/features/auth/services/auth';
import { ShowToast } from '@app/shared/services/show-toast';
import { Theme } from '@app/features/private/settings/services/theme-service';

describe('AuthService', () => {
  let service: AuthService;
  let authApi: jasmine.SpyObj<Auth>;
  let encryptionService: jasmine.SpyObj<EncryptionService>;
  let router: jasmine.SpyObj<Router>;
  const validToken = `header.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }))}.signature`;

  beforeEach(() => {
    authApi = jasmine.createSpyObj<Auth>('Auth', [
      'login',
      'register',
      'getProfile',
      'updateProfile',
      'refreshToken',
      'logout',
    ]);
    encryptionService = jasmine.createSpyObj<EncryptionService>('EncryptionService', ['encrypt']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    authApi.getProfile.and.returnValue(
      of({ fotoUrl: '/assets/profile.png', permisos: ['2FA_ENABLED'], rol: { id: 2 } } as any),
    );
    authApi.updateProfile.and.returnValue(of({} as any));
    authApi.refreshToken.and.returnValue(of({ access_token: validToken, token_type: 'bearer' }));
    authApi.logout.and.returnValue(of({ msg: 'ok' } as any));
    router.navigate.and.resolveTo(true);
    encryptionService.encrypt.and.resolveTo('encrypted-value');

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: HttpClient, useValue: {} },
        { provide: Auth, useValue: authApi },
        { provide: EncryptionService, useValue: encryptionService },
        { provide: Router, useValue: router },
        {
          provide: ShowToast,
          useValue: jasmine.createSpyObj<ShowToast>('ShowToast', ['showSuccess', 'showWarning', 'showError']),
        },
        {
          provide: Theme,
          useValue: {
            setTheme: jasmine.createSpy('setTheme'),
            THEME_KEY: 'theme',
          },
        },
      ],
    });

    service = TestBed.inject(AuthService);
  });

  it('should pass recaptcha token on login', async () => {
    authApi.login.and.returnValue(of({ access_token: validToken, token_type: 'bearer' } as any));

    await service.login('user@test.com', 'secret', 'captcha-token');

    expect(encryptionService.encrypt).toHaveBeenCalledWith('secret');
    expect(authApi.login).toHaveBeenCalledWith('user@test.com', 'encrypted-value', 'captcha-token');
  });

  it('should pass recaptcha token on register', async () => {
    authApi.register.and.returnValue(
      of({ id: 1, email: 'user@test.com', username: 'user', is_active: false, role_id: 2, created_at: 'now', photo_url: null } as any),
    );

    await service.register('user@test.com', 'user', 'secret', false, 'captcha-token');

    expect(encryptionService.encrypt).toHaveBeenCalledWith('secret');
    expect(authApi.register).toHaveBeenCalledWith('user@test.com', 'user', 'encrypted-value', false, 'captcha-token');
  });
});