export interface LoginRequest {
  identifier: string;
  password: string;
  recaptcha_token?: string;
}

export interface RegisterRequest {
  email?: string;
  username: string;
  phone_number: string;
  password?: string;
  generate_password?: boolean;
  recaptcha_token?: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  username: string;
  phone_number?: string | null;
  phone_verified?: boolean;
  photo_url: string | null;
  is_active: boolean;
  role_id: number;
  created_at: string;
  permissions?: string[];
  generated_password?: string | null;
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
  identifier: string;
}

export interface ResetPasswordRequest {
  identifier: string;
  code: string;
  new_password: string;
}

export interface ChangePasswordRequestCodeResponse {
  message: string;
  masked_phone: string;
}

export interface ChangePasswordWithCodeRequest {
  current_password: string;
  new_password: string;
  code: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number | null;
  session_token?: string;
  step?: string;
  status?: string;
  reset_token?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface LogoutResponse {
  msg: string;
}
