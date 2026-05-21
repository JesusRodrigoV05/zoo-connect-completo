interface User {
  id: number;
  username: string;
  email: string;
}

export interface Auditoria {
  id: number;
  event: string;
  log_type: "application" | "security";
  action?: string | null;
  detail?: string | null;
  timestamp: Date;
  attempted_email?: string | null;
  user?: User | null;
}
