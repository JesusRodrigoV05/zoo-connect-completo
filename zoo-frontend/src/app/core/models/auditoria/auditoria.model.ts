interface User {
  id: string;
  username: string;
  email: string;
}

export interface IpGuideData {
  ip?: string;
  network?: {
    cidr?: string;
    hosts?: {
      start?: string;
      end?: string;
    };
    autonomous_system?: {
      asn?: number;
      name?: string;
      organization?: string;
      country?: string;
      rir?: string;
    };
  };
  location?: {
    city?: string | null;
    country?: string | null;
    timezone?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  lookup_skipped?: string;
  lookup_error?: string;
  [key: string]: unknown;
}

export interface Auditoria {
  id: number;
  event: string;
  log_type: "application" | "security";
  action?: string | null;
  detail?: string | null;
  timestamp: Date;
  attempted_email?: string | null;
  ip_address?: string | null;
  ip_country?: string | null;
  ip_asn?: number | null;
  ip_organization?: string | null;
  ip_guide_data?: IpGuideData | null;
  user?: User | null;
}
