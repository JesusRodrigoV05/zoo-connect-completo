export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  fotoUrl?: string;
}

export interface VerifyLogin2FARequest {
  session_token: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number | null;
  session_token?: string;
  step?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LogoutResponse {
  msg: string;
}
