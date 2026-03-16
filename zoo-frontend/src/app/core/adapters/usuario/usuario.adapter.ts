import { UpdateProfileRequest } from "@models/usuario";
import { Usuario, RolId } from "../../models/usuario/usuario.model";

export interface UsuarioBackendResponse {
  id: number;
  email: string;
  username: string;
  photo_url: string | null;
  is_active: boolean;
  role_id: number;
  created_at: string;
}

export interface CreateUsuarioRequest {
  email: string;
  username: string;
  password: string;
  role_id: number;
}

export interface UpdateUsuarioRequest {
  email?: string;
  username?: string;
  password?: string;
  role_id?: number;
  is_active?: boolean;
}

export interface BackendUpdateProfileRequest {
  username?: string;
  email?: string;
  photo_url?: string;
}

export class UsuarioAdapter {
  static fromBackend(backendUser: UsuarioBackendResponse): Usuario {
    return {
      id: backendUser.id.toString(),
      email: backendUser.email,
      username: backendUser.username,
      fotoUrl: backendUser.photo_url || "",
      activo: backendUser.is_active,
      rol: {
        id: backendUser.role_id as RolId,
        nombre: this.getRoleNameById(backendUser.role_id),
      },
      creadoEn: backendUser.created_at,
    };
  }

  static fromBackendList(backendUsers: UsuarioBackendResponse[]): Usuario[] {
    return backendUsers.map((user) => this.fromBackend(user));
  }

  private static getRoleNameById(roleId: number): string {
    const roleNames: { [key: number]: string } = {
      1: "Administrador",
      2: "Visitante",
      3: "Cuidador",
      4: "Veterinario",
    };
    return roleNames[roleId] || "Desconocido";
  }

  static toCreateRequest(
    frontendUser: Omit<Usuario, "id" | "creadoEn" | "activo"> & {
      password: string;
    },
  ): CreateUsuarioRequest {
    if (!frontendUser.email || frontendUser.email.trim().length < 3) {
      throw new Error(
        "El email es requerido y debe tener al menos 3 caracteres",
      );
    }

    if (!frontendUser.username || frontendUser.username.trim().length < 2) {
      throw new Error(
        "El nombre de usuario es requerido y debe tener al menos 2 caracteres",
      );
    }

    if (!frontendUser.password || frontendUser.password.trim().length < 6) {
      throw new Error(
        "La contraseña es requerida y debe tener al menos 6 caracteres",
      );
    }

    return {
      email: frontendUser.email.trim(),
      username: frontendUser.username.trim(),
      password: frontendUser.password.trim(),
      role_id: frontendUser.rol.id,
    };
  }

  static toUpdateProfileRequest(
    data: UpdateProfileRequest,
  ): BackendUpdateProfileRequest {
    const backendRequest: BackendUpdateProfileRequest = {};

    if (data.username !== undefined) {
      backendRequest.username = data.username.trim();
    }
    if (data.email !== undefined) {
      backendRequest.email = data.email.trim();
    }
    if (data.fotoUrl !== undefined) {
      backendRequest.photo_url = data.fotoUrl;
    }

    return backendRequest;
  }

  static toUpdateRequest(
    frontendUser: Partial<Omit<Usuario, "id" | "creadoEn">> & {
      password?: string;
    },
  ): UpdateUsuarioRequest {
    const request: UpdateUsuarioRequest = {};

    if (frontendUser.email !== undefined) {
      if (frontendUser.email.trim().length < 3) {
        throw new Error("El email debe tener al menos 3 caracteres");
      }
      request.email = frontendUser.email.trim();
    }

    if (frontendUser.username !== undefined) {
      if (frontendUser.username.trim().length < 2) {
        throw new Error(
          "El nombre de usuario debe tener al menos 2 caracteres",
        );
      }
      request.username = frontendUser.username.trim();
    }

    if (
      frontendUser.password !== undefined &&
      frontendUser.password.trim().length > 0
    ) {
      if (frontendUser.password.trim().length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }
      request.password = frontendUser.password.trim();
    }

    if (frontendUser.rol !== undefined) {
      request.role_id = frontendUser.rol.id;
    }

    if (frontendUser.activo !== undefined) {
      request.is_active = frontendUser.activo;
    }

    return request;
  }

  static isValidBackendResponse(obj: any): obj is UsuarioBackendResponse {
    return (
      obj &&
      typeof obj.id === "number" &&
      typeof obj.email === "string" &&
      typeof obj.username === "string" &&
      (obj.photo_url === null || typeof obj.photo_url === "string") &&
      typeof obj.is_active === "boolean" &&
      typeof obj.role_id === "number" &&
      typeof obj.created_at === "string"
    );
  }

  static isValidFrontendModel(obj: any): obj is Usuario {
    return (
      obj &&
      typeof obj.id === "string" &&
      typeof obj.email === "string" &&
      typeof obj.username === "string" &&
      typeof obj.fotoUrl === "string" &&
      typeof obj.activo === "boolean" &&
      obj.rol &&
      typeof obj.rol.id === "number" &&
      typeof obj.rol.nombre === "string" &&
      typeof obj.creadoEn === "string"
    );
  }
}
