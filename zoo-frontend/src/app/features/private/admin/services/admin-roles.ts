import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import { environment } from "@env";
import { PermissionCatalogItem } from "./permissions";

export interface RolePermissionState {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  module: string;
  is_active: boolean;
  allowed: boolean;
}

export interface RoleItem {
  id: number;
  name: string;
  user_count: number;
  has_custom_permissions: boolean;
}

export interface RoleDetail extends RoleItem {
  permissions: RolePermissionState[];
}

export interface RolePermissionToggle {
  permission_id: number;
  allowed: boolean;
}

export interface RoleFilters {
  search?: string | null;
}

@Injectable({
  providedIn: "root",
})
export class AdminRolesService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private rolesUrl = `${this.apiUrl}/admin_roles`;

  getRoles(
    page: number = 1,
    size: number = 20,
    filters?: RoleFilters,
  ): Observable<{ items: RoleItem[]; total: number; page: number; size: number; pages: number }> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (filters?.search) {
      params = params.set("search", filters.search);
    }

    return this.http.get<{ items: RoleItem[]; total: number; page: number; size: number; pages: number }>(
      this.rolesUrl,
      { params },
    );
  }

  getRoleById(id: number): Observable<RoleDetail> {
    return this.http.get<RoleDetail>(`${this.rolesUrl}/${id}`);
  }

  createRole(name: string): Observable<RoleItem> {
    return this.http.post<RoleItem>(this.rolesUrl, { name }).pipe(
      catchError((error) => {
        let errorMessage = "Error al crear el rol";
        if (error.status === 400) {
          errorMessage = error.error?.detail || "El rol ya existe";
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  updateRole(id: number, name: string): Observable<RoleItem> {
    return this.http.put<RoleItem>(`${this.rolesUrl}/${id}`, { name }).pipe(
      catchError((error) => {
        let errorMessage = "Error al actualizar el rol";
        if (error.status === 400) {
          errorMessage = error.error?.detail || "El rol ya existe";
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  deleteRole(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.rolesUrl}/${id}`).pipe(
      catchError((error) => {
        let errorMessage = "Error al eliminar el rol";
        if (error.status === 400) {
          errorMessage = error.error?.detail || "No se puede eliminar el rol porque tiene usuarios asignados";
        }
        return throwError(() => new Error(errorMessage));
      }),
    );
  }

  getRolePermissions(roleId: number): Observable<RoleDetail> {
    return this.http.get<RoleDetail>(`${this.rolesUrl}/${roleId}/permissions`);
  }

  updateRolePermissions(
    roleId: number,
    permissions: RolePermissionToggle[],
  ): Observable<RoleDetail> {
    return this.http.put<RoleDetail>(`${this.rolesUrl}/${roleId}/permissions`, permissions);
  }

  getPermissionCatalog(): Observable<PermissionCatalogItem[]> {
    return this.http.get<PermissionCatalogItem[]>(`${this.rolesUrl}/permissions/catalog`);
  }
}