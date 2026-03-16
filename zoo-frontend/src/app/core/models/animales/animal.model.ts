import { Especie } from "./especie.model";
import { Habitat } from "../habitat";

export interface MediaAnimal {
  id_media: number;
  tipo_medio: boolean;
  url: string;
  titulo: string;
  descripcion?: string;
  public_id: string;
}

export enum EstadoOperativo {
  SALUDABLE = "Saludable",
  EN_TRATAMIENTO = "En tratamiento",
  EN_CUARENTENA = "En cuarentena",
  TRASLADADO = "Trasladado",
  FALLECIDO = "Fallecido",
}
export interface Animal {
  id_animal: number;
  nombre: string;
  genero: boolean;
  fecha_nacimiento: string;
  fecha_ingreso: string;
  procedencia: string;
  estado_operativo: EstadoOperativo;
  es_publico: boolean;
  descripcion: string;
  especie_id: number;
  habitat_id: number;
  especie: Especie;
  habitat: Habitat;
  media: MediaAnimal[];
  age: number;
}

export type CreateAnimal = Omit<
  Animal,
  "id_animal" | "especie" | "habitat" | "media" | "age"
>;

export type UpdateAnimal = CreateAnimal;
