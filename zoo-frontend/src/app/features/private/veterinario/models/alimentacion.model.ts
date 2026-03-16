import { Animal, Especie } from "@models/animales";
import { Producto, UnidadMedida } from "../../admin/models/productos.model";

export interface DetalleDieta {
  id?: number;
  productoId: number;
  producto?: Producto;
  unidadMedidaId: number;
  unidadMedida?: UnidadMedida;
  cantidad: number;
  frecuencia: string;
}

export interface Dieta {
  id: number;
  nombre: string;
  animalId?: number;
  animal?: Animal;
  especieId?: number;
  especie?: Especie;
  detalles: DetalleDieta[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDietaRequest {
  nombre: string;
  animalId?: number;
  especieId?: number;
  detalles: Omit<DetalleDieta, "id" | "producto" | "unidadMedida">[];
}

export type UpdateDietaRequest = Partial<CreateDietaRequest>;
