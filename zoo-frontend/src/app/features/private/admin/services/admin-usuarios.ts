import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable, map, catchError, throwError } from "rxjs";
import {
  UsuarioAdapter,
  UsuarioBackendResponse,
} from "@app/core/adapters/usuario";
import { Usuario } from "@app/core/models/usuario";
import { environment } from "@env";
import { PaginatedResponse } from "@models/common";

export interface UserFilters {
  roleIds?: number[] | null;
  isActive?: boolean | null;
  search?: string | null;
}

@Injectable({
  providedIn: "root",
})
export class AdminUsuarios {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;
  private usuariosUrl = `${this.apiUrl}/admin_users/users`;

  getAllUsers(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Usuario>> {
    return this.getUsers(page, size, {
      isActive: true,
    });
  }

  getUsers(
    page: number = 1,
    size: number = 10,
    filters?: UserFilters,
  ): Observable<PaginatedResponse<Usuario>> {
    let params = new HttpParams()
      .set("page", page.toString())
      .set("size", size.toString());

    if (filters) {
      if (filters.roleIds && filters.roleIds.length > 0) {
        filters.roleIds.forEach((id) => {
          params = params.append("role_id", id.toString());
        });
      }

      if (filters.isActive !== undefined && filters.isActive !== null) {
        params = params.set("is_active", filters.isActive.toString());
      }

      if (filters.search) {
        params = params.set("search", filters.search);
      }
    }

    return this.http
      .get<PaginatedResponse<UsuarioBackendResponse>>(this.usuariosUrl, {
        params,
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((user) => UsuarioAdapter.fromBackend(user)),
        })),
        catchError((error) => {
          console.error("Error fetching users:", error);
          return throwError(() => error);
        }),
      );
  }

  getUserById(id: number): Observable<Usuario> {
    return this.http
      .get<UsuarioBackendResponse>(`${this.usuariosUrl}/${id}`)
      .pipe(
        map((response) => UsuarioAdapter.fromBackend(response)),
        catchError((error) => {
          return throwError(() => new Error("Error al obtener el usuario"));
        }),
      );
  }

  createUser(
    userData: Omit<Usuario, "id" | "creadoEn" | "activo"> & {
      password: string;
    },
  ): Observable<Usuario> {
    try {
      const backendRequest = UsuarioAdapter.toCreateRequest(userData);

      return this.http
        .post<UsuarioBackendResponse>(this.usuariosUrl, backendRequest)
        .pipe(
          map((response) => UsuarioAdapter.fromBackend(response)),
          catchError((error) => {
            let errorMessage = "Error al crear el usuario";
            if (error.status === 400) {
              errorMessage = "El email ya está registrado";
            } else if (error.status === 422) {
              errorMessage = "Los datos enviados no son válidos";
            }

            return throwError(() => new Error(errorMessage));
          }),
        );
    } catch (validationError: any) {
      return throwError(() => new Error(validationError.message));
    }
  }

  updateUser(
    id: number,
    userData: Partial<Omit<Usuario, "id" | "creadoEn">> & { password?: string },
  ): Observable<Usuario> {
    try {
      const backendRequest = UsuarioAdapter.toUpdateRequest(userData);

      return this.http
        .put<UsuarioBackendResponse>(
          `${this.usuariosUrl}/${id}`,
          backendRequest,
        )
        .pipe(
          map((response) => UsuarioAdapter.fromBackend(response)),
          catchError((error) => {
            let errorMessage = "Error al actualizar el usuario";
            if (error.status === 404) {
              errorMessage = "Usuario no encontrado";
            } else if (error.status === 400) {
              errorMessage = "El email ya está registrado por otro usuario";
            }

            return throwError(() => new Error(errorMessage));
          }),
        );
    } catch (validationError: any) {
      return throwError(() => new Error(validationError.message));
    }
  }

  /**
   * Elimina un usuario
   */
  deleteUser(id: number): Observable<Usuario> {
    return this.http
      .delete<UsuarioBackendResponse>(`${this.usuariosUrl}/${id}`)
      .pipe(
        map((response) => UsuarioAdapter.fromBackend(response)),
        catchError((error) => {
          let errorMessage = "Error al eliminar el usuario";
          if (error.status === 404) {
            errorMessage = "Usuario no encontrado";
          }

          return throwError(() => new Error(errorMessage));
        }),
      );
  }

  /**
   * Activa o desactiva un usuario
   */
  toggleUserStatus(id: number, activo: boolean): Observable<Usuario> {
    return this.updateUser(id, { activo });
  }

  /**
   * Cambia el rol de un usuario
   */
  changeUserRole(id: number, rol: Usuario["rol"]): Observable<Usuario> {
    return this.updateUser(id, { rol });
  }

  /**
   * Busca usuarios por email o username
   */
  searchUsers(
    searchTerm: string,
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Usuario>> {
    return this.http
      .get<PaginatedResponse<UsuarioBackendResponse>>(this.usuariosUrl, {
        params: {
          page: page.toString(),
          size: size.toString(),
          search: searchTerm,
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((user) => UsuarioAdapter.fromBackend(user)),
        })),
      );
  }

  /**
   * Obtiene usuarios por rol
   */
  getUsersByRole(
    roleId: number,
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Usuario>> {
    return this.http
      .get<PaginatedResponse<UsuarioBackendResponse>>(this.usuariosUrl, {
        params: {
          page: page.toString(),
          size: size.toString(),
          roleId: roleId.toString(),
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((user) => UsuarioAdapter.fromBackend(user)),
        })),
      );
  }

  /**
   * Obtiene solo usuarios activos
   */
  getActiveUsers(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Usuario>> {
    return this.http
      .get<PaginatedResponse<UsuarioBackendResponse>>(this.usuariosUrl, {
        params: {
          page: page.toString(),
          size: size.toString(),
          active: "true",
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((user) => UsuarioAdapter.fromBackend(user)),
        })),
      );
  }

  /**
   * Obtiene solo usuarios inactivos
   */
  getInactiveUsers(
    page: number = 1,
    size: number = 10,
  ): Observable<PaginatedResponse<Usuario>> {
    return this.http
      .get<PaginatedResponse<UsuarioBackendResponse>>(this.usuariosUrl, {
        params: {
          page: page.toString(),
          size: size.toString(),
          active: "false",
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          items: response.items.map((user) => UsuarioAdapter.fromBackend(user)),
        })),
      );
  }

  /**
   * Valida si los datos del usuario son correctos antes de enviar
   */
  validateUserData(
    userData: Partial<Usuario & { password?: string }>,
  ): boolean {
    if (userData.email && userData.email.trim().length < 3) {
      throw new Error("El email debe tener al menos 3 caracteres");
    }

    if (userData.username && userData.username.trim().length < 2) {
      throw new Error("El nombre de usuario debe tener al menos 2 caracteres");
    }

    if (userData.password && userData.password.trim().length < 6) {
      throw new Error("La contraseña debe tener al menos 6 caracteres");
    }

    return true;
  }
}
