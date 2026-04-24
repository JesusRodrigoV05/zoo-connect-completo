import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "@env";
import { Observable } from "rxjs";

export interface PermissionCatalogItem {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  module: string;
  is_active: boolean;
}

export interface PermissionState extends PermissionCatalogItem {
  allowed: boolean;
  source: "role" | "user";
}

export interface PermissionMatrixUser {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  role_id: number;
  role_name: string;
  photo_url?: string | null;
  created_at?: string | null;
  permissions: PermissionState[];
}

export interface PermissionMatrixResponse {
  items: PermissionMatrixUser[];
  total: number;
  page: number;
  size: number;
  pages: number;
  permissions: PermissionCatalogItem[];
}

export interface UpdatePermissionPayload {
  permission_id: number;
  allowed: boolean;
}

@Injectable({
  providedIn: "root",
})
export class AdminPermissionsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly permissionsUrl = `${this.apiUrl}/admin_users/permissions`;

  getPermissionMatrix(filters?: {
    roleId?: number | null;
    isActive?: boolean | null;
    search?: string | null;
  }): Observable<PermissionMatrixResponse> {
    let params = new HttpParams();

    if (filters?.roleId !== undefined && filters.roleId !== null) {
      params = params.set("role_id", filters.roleId.toString());
    }
    if (filters?.isActive !== undefined && filters.isActive !== null) {
      params = params.set("is_active", filters.isActive.toString());
    }
    if (filters?.search) {
      params = params.set("search", filters.search);
    }

    return this.http.get<PermissionMatrixResponse>(`${this.permissionsUrl}/users`, { params });
  }

  updateUserPermissions(
    userId: number,
    permissions: UpdatePermissionPayload[],
  ): Observable<PermissionMatrixUser> {
    return this.http.put<PermissionMatrixUser>(
      `${this.permissionsUrl}/users/${userId}`,
      permissions,
    );
  }

  getPermissionCatalog(): Observable<PermissionCatalogItem[]> {
    return this.http.get<PermissionCatalogItem[]>(`${this.permissionsUrl}/catalog`);
  }
}