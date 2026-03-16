import {
  Animal,
  CreateAnimal,
  EstadoOperativo,
  MediaAnimal,
} from "@models/animales";
import { EspecieAdapter, EspecieApiResponse } from "./especie.adapter";
import { HabitatAdapter, HabitatBackendResponse } from "@adapters/habitat";

export interface AnimalMediaApiResponse {
  tipo_medio: boolean;
  url_animal: string;
  titulo_media_animal: string;
  descripcion_media_animal: string;
  id_media_animal: number;
  public_id: string;
}

export class AnimalMediaAdapter {
  static fromApi(apiResponse: AnimalMediaApiResponse): MediaAnimal {
    return {
      id_media: apiResponse.id_media_animal,
      tipo_medio: apiResponse.tipo_medio,
      url: apiResponse.url_animal,
      titulo: apiResponse.titulo_media_animal,
      descripcion: apiResponse.descripcion_media_animal,
      public_id: apiResponse.public_id,
    };
  }
}

export interface BackendAnimalResponse {
  id_animal: number;
  nombre_animal: string;
  genero: boolean;
  fecha_nacimiento: string;
  fecha_ingreso: string;
  procedencia_animal: string;
  estado_operativo: EstadoOperativo;
  es_publico: boolean;
  descripcion: string;
  especie_id: number;
  habitat_id: number;
  especie: EspecieApiResponse;
  habitat: HabitatBackendResponse;
  media: AnimalMediaApiResponse[];
  age: number;
}

export interface AnimalApiRequest {
  nombre_animal: string;
  genero: boolean;
  fecha_nacimiento: string;
  fecha_ingreso: string;
  procedencia_animal: string;
  estado_operativo: EstadoOperativo;
  es_publico: boolean;
  descripcion: string;
  especie_id: number;
  habitat_id: number;
}

export class AnimalAdapter {
  static fromBackend(backendAnimal: BackendAnimalResponse): Animal {
    return {
      id_animal: backendAnimal.id_animal,
      nombre: backendAnimal.nombre_animal,
      genero: backendAnimal.genero,
      fecha_nacimiento: backendAnimal.fecha_nacimiento,
      fecha_ingreso: backendAnimal.fecha_ingreso,
      procedencia: backendAnimal.procedencia_animal,
      estado_operativo: backendAnimal.estado_operativo,
      es_publico: backendAnimal.es_publico,
      descripcion: backendAnimal.descripcion,
      age: backendAnimal.age,
      especie: EspecieAdapter.fromApi(backendAnimal.especie),
      habitat: HabitatAdapter.toFrontend(backendAnimal.habitat),
      especie_id: backendAnimal.especie.id_especie,
      habitat_id: backendAnimal.habitat.id_habitat,
      media: backendAnimal.media.map((media) => this.mediaFromBackend(media)),
    };
  }

  static toCreateRequest(animal: CreateAnimal): AnimalApiRequest {
    return {
      nombre_animal: animal.nombre,
      genero: animal.genero,
      fecha_nacimiento: animal.fecha_nacimiento,
      fecha_ingreso: animal.fecha_ingreso,
      procedencia_animal: animal.procedencia,
      estado_operativo: animal.estado_operativo,
      es_publico: animal.es_publico,
      descripcion: animal.descripcion,
      especie_id: animal.especie_id,
      habitat_id: animal.habitat_id,
    };
  }
  static toUpdateRequest(
    animal: Partial<CreateAnimal>,
  ): Partial<AnimalApiRequest> {
    const request: Partial<AnimalApiRequest> = {};

    if (animal.nombre !== undefined) request.nombre_animal = animal.nombre;
    if (animal.genero !== undefined) request.genero = animal.genero;
    if (animal.fecha_nacimiento !== undefined)
      request.fecha_nacimiento = animal.fecha_nacimiento;
    if (animal.fecha_ingreso !== undefined)
      request.fecha_ingreso = animal.fecha_ingreso;
    if (animal.procedencia !== undefined)
      request.procedencia_animal = animal.procedencia;
    if (animal.estado_operativo !== undefined)
      request.estado_operativo = animal.estado_operativo;
    if (animal.es_publico !== undefined) request.es_publico = animal.es_publico;
    if (animal.descripcion !== undefined)
      request.descripcion = animal.descripcion;
    if (animal.especie_id !== undefined) request.especie_id = animal.especie_id;
    if (animal.habitat_id !== undefined) request.habitat_id = animal.habitat_id;

    return request;
  }

  private static mediaFromBackend(
    backendMedia: AnimalMediaApiResponse,
  ): MediaAnimal {
    return {
      id_media: backendMedia.id_media_animal,
      tipo_medio: backendMedia.tipo_medio,
      url: backendMedia.url_animal,
      titulo: backendMedia.titulo_media_animal,
      descripcion: backendMedia.descripcion_media_animal,
      public_id: backendMedia.public_id,
    };
  }
  static getGeneroTexto(genero: boolean): string {
    return genero ? "Macho" : "Hembra";
  }

  static getEstadoClass(estado: Animal["estado_operativo"]): string {
    const clases: Record<Animal["estado_operativo"], string> = {
      Saludable: "estado-saludable",
      "En tratamiento": "estado-tratamiento",
      "En cuarentena": "estado-cuarentena",
      Trasladado: "estado-trasladado",
      Fallecido: "estado-fallecido",
    };
    return clases[estado] || "";
  }

  static getEstadoColor(estado: Animal["estado_operativo"]): string {
    const colores: Record<Animal["estado_operativo"], string> = {
      Saludable: "success",
      "En tratamiento": "info",
      "En cuarentena": "warn",
      Trasladado: "secondary",
      Fallecido: "danger",
    };
    return colores[estado] || "secondary";
  }
}
