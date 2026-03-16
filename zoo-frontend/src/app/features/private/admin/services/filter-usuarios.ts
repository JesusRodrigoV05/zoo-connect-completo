import { UsuarioAdapter, UsuarioBackendResponse } from "@adapters/usuario";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { inject } from "@angular/core";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";
import { RolId, Usuario } from "@models/usuario";
import { map, Observable } from "rxjs";

export interface UserSelectOption {
  id: string;
  label: string;
  email: string;
  username: string;
  roleName: string;
  roleId: RolId;
}

export interface UserFilter {
  page: number;
  size: number;
  search?: string;
  excludeRoles?: RolId[];
}

export interface LazyLoadParams {
  first: number;
  rows: number;
  filter?: string;
}

@Injectable({
  providedIn: "root",
})
export class FilterUsuarios {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/admin_users`;

  getUsers(
    filter: UserFilter,
  ): Observable<PaginatedResponse<UserSelectOption>> {
    let params: any = {
      page: filter.page.toString(),
      size: filter.size.toString(),
    };

    if (filter.search && filter.search.trim()) {
      params.search = filter.search.trim();
    }

    return this.http
      .get<
        PaginatedResponse<UsuarioBackendResponse>
      >(`${this.baseUrl}/users`, { params })
      .pipe(
        map((response) => {
          let filteredItems = response.items;

          if (filter.excludeRoles && filter.excludeRoles.length > 0) {
            filteredItems = filteredItems.filter(
              (user) => !filter.excludeRoles!.includes(user.role_id as RolId),
            );
          }

          const options = filteredItems.map((user) => {
            const usuario = UsuarioAdapter.fromBackend(user);
            return this.mapToSelectOption(usuario);
          });

          return {
            items: options,
            total: response.total,
            page: response.page,
            size: response.size,
            pages: Math.ceil(response.total / filter.size),
          };
        }),
      );
  }

  getUsersLazy(
    page: number,
    size: number,
    search: string = "",
    excludeRoles: RolId[] = [],
  ): Observable<UserSelectOption[]> {
    const filter: UserFilter = {
      page,
      size,
      search,
      excludeRoles,
    };

    return this.getUsers(filter).pipe(map((response) => response.items));
  }

  getUserById(id: string): Observable<UserSelectOption | null> {
    return this.http
      .get<UsuarioBackendResponse>(`${this.baseUrl}/users/${id}`)
      .pipe(
        map((user) => {
          const usuario = UsuarioAdapter.fromBackend(user);
          return this.mapToSelectOption(usuario);
        }),
        map((user) => user || null),
      );
  }

  private mapToSelectOption(usuario: any): UserSelectOption {
    return {
      id: usuario.id,
      label: `${usuario.username} (${usuario.email})`,
      email: usuario.email,
      username: usuario.username,
      roleName: usuario.rol.nombre,
      roleId: usuario.rol.id,
    };
  }
}
