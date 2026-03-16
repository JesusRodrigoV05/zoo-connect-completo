interface User {
  id: number;
  username: string;
  email: string;
}

export interface Auditoria {
  id: number;
  event: string;
  timestamp: Date;
  attempted_email: string;
  user: User;
}
