export interface PasswordHistoryEntry {
  id: number;
  user_id: string;
  created_at: string;
}

export interface PasswordHistoryPolicy {
  role_name: string;
  history_limit: number;
  password_validity_days: number;
}
