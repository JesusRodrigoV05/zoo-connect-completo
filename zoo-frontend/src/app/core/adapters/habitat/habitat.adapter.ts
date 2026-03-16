import { Habitat } from "@models/habitat";

/**
 * Estructura de datos del hábitat tal como viene del backend
 */
export interface HabitatBackendResponse {
  id_habitat: number;
  nombre_habitat: string;
  tipo_habitat: string;
  descripcion_habitat: string;
  condiciones_climaticas: string;
  is_active: boolean;
}

export interface HabitatMediaResponse {
  tipo_medio: boolean;
  url_habitat: string;
  titulo_media_habitat: string;
  descripcion_media_habitat: string;
  id_media_habitat: number;
  public_id: string;
}

/**
 * Estructura para crear un hábitat (envío al backend)
 */
export interface CreateHabitatRequest {
  nombre_habitat: string;
  tipo_habitat: string;
  descripcion_habitat: string;
  condiciones_climaticas: string;
}

/**
 * Estructura para actualizar un hábitat (envío al backend)
 */
export interface UpdateHabitatRequest {
  nombre_habitat?: string;
  tipo_habitat?: string;
  descripcion_habitat?: string;
  condiciones_climaticas?: string;
  is_active?: boolean;
}

/**
 * Adapter para transformar los datos de hábitat entre backend y frontend
 */
export class HabitatAdapter {
  /**
   * Convierte la respuesta del backend al modelo del frontend
   * @param backendHabitat - Datos del hábitat desde el backend
   * @returns Modelo de hábitat para el frontend
   */
  static toFrontend(backendHabitat: HabitatBackendResponse): Habitat {
    return {
      id: backendHabitat.id_habitat,
      nombre: backendHabitat.nombre_habitat,
      tipo: backendHabitat.tipo_habitat,
      descripcion: backendHabitat.descripcion_habitat,
      condicionesClimaticas: backendHabitat.condiciones_climaticas,
      isActive: backendHabitat.is_active,
    };
  }

  /**
   * Convierte una lista de hábitats del backend al frontend
   * @param backendHabitats - Lista de hábitats desde el backend
   * @returns Lista de hábitats para el frontend
   */
  static toFrontendList(backendHabitats: HabitatBackendResponse[]): Habitat[] {
    return backendHabitats.map((habitat) => this.toFrontend(habitat));
  }

  /**
   * Convierte los datos del frontend para crear un nuevo hábitat
   * @param frontendHabitat - Datos del hábitat desde el frontend (sin ID)
   * @returns Estructura para el request de creación al backend
   */
  static toCreateRequest(
    frontendHabitat: Omit<Habitat, "id" | "isActive">,
  ): CreateHabitatRequest {
    if (!frontendHabitat.nombre || frontendHabitat.nombre.trim().length < 2) {
      throw new Error(
        "El nombre del hábitat es requerido y debe tener al menos 2 caracteres",
      );
    }

    if (!frontendHabitat.tipo || frontendHabitat.tipo.trim().length < 2) {
      throw new Error(
        "El tipo de hábitat es requerido y debe tener al menos 2 caracteres",
      );
    }

    if (
      !frontendHabitat.descripcion ||
      frontendHabitat.descripcion.trim().length < 10
    ) {
      throw new Error(
        "La descripción es requerida y debe tener al menos 10 caracteres",
      );
    }

    if (
      !frontendHabitat.condicionesClimaticas ||
      frontendHabitat.condicionesClimaticas.trim().length < 5
    ) {
      throw new Error(
        "Las condiciones climáticas son requeridas y deben tener al menos 5 caracteres",
      );
    }

    return {
      nombre_habitat: frontendHabitat.nombre.trim(),
      tipo_habitat: frontendHabitat.tipo.trim(),
      descripcion_habitat: frontendHabitat.descripcion.trim(),
      condiciones_climaticas: frontendHabitat.condicionesClimaticas.trim(),
    };
  }

  /**
   * Convierte los datos del frontend para actualizar un hábitat
   * @param frontendHabitat - Datos parciales del hábitat desde el frontend
   * @returns Estructura para el request de actualización al backend
   */
  static toUpdateRequest(
    frontendHabitat: Partial<Omit<Habitat, "id">>,
  ): UpdateHabitatRequest {
    const request: UpdateHabitatRequest = {};

    if (frontendHabitat.nombre !== undefined) {
      request.nombre_habitat = frontendHabitat.nombre;
    }

    if (frontendHabitat.tipo !== undefined) {
      request.tipo_habitat = frontendHabitat.tipo;
    }

    if (frontendHabitat.descripcion !== undefined) {
      request.descripcion_habitat = frontendHabitat.descripcion;
    }

    if (frontendHabitat.condicionesClimaticas !== undefined) {
      request.condiciones_climaticas = frontendHabitat.condicionesClimaticas;
    }

    if (frontendHabitat.isActive !== undefined) {
      request.is_active = frontendHabitat.isActive;
    }

    return request;
  }

  /**
   * Valida si un objeto tiene la estructura correcta del backend
   * @param obj - Objeto a validar
   * @returns true si es una respuesta válida del backend
   */
  static isValidBackendResponse(obj: any): obj is HabitatBackendResponse {
    return (
      obj &&
      typeof obj.id_habitat === "number" &&
      typeof obj.nombre_habitat === "string" &&
      typeof obj.tipo === "string" &&
      typeof obj.descripcion === "string" &&
      typeof obj.condiciones_climaticas === "string" &&
      typeof obj.is_active === "boolean"
    );
  }

  /**
   * Valida si un objeto tiene la estructura correcta del frontend
   * @param obj - Objeto a validar
   * @returns true si es un modelo válido del frontend
   */
  static isValidFrontendModel(obj: any): obj is Habitat {
    return (
      obj &&
      typeof obj.id === "number" &&
      typeof obj.nombre === "string" &&
      typeof obj.tipo === "string" &&
      typeof obj.descripcion === "string" &&
      typeof obj.condicionesClimaticas === "string" &&
      typeof obj.isActive === "boolean"
    );
  }
}
