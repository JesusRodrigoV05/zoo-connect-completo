import { Animal } from "@models/animales";
import { Habitat } from "@models/habitat";
import { Usuario } from "@models/usuario";

export interface TipoTarea {
  id: number;
  nombre: string;
  descripcion: string;
  isActive: boolean;
}
export type CreateTipoTarea = Pick<TipoTarea, "nombre" | "descripcion">;
export type UpdateTipoTarea = Partial<CreateTipoTarea> & { isActive?: boolean };

export interface TareaRecurrente {
  id: number;
  titulo: string;
  descripcion: string;
  tipoTareaId: number;
  tipoTarea?: TipoTarea;
  frecuenciaCron: string;
  animalId?: number;
  habitatId?: number;
  isActive: boolean;
}
export interface CreateTareaRecurrente {
  titulo: string;
  descripcion: string;
  tipoTareaId: number;
  frecuenciaCron: string;
  animalId?: number;
  habitatId?: number;
  isActive: boolean;
}

export interface Tarea {
  id: number;
  titulo: string;
  descripcion: string;
  fechaProgramada: string;
  tipoTarea?: TipoTarea;
  usuarioAsignadoId?: number;
  usuarioAsignado?: Usuario;
  animalId?: number;
  animal?: Animal;
  habitatId?: number;
  habitat?: Habitat;
  isCompleted: boolean;
  fechaCompletada?: string;
  notasCompletacion?: string;
}

export interface CreateTareaManual {
  titulo: string;
  descripcion: string;
  fechaProgramada: string;
  tipoTareaId: number;
  usuarioAsignadoId?: number;
  animalId?: number;
  habitatId?: number;
}

export interface CompletarTareaSimple {
  notasCompletacion: string;
}

export interface CompletarTareaAlimentacion {
  notasObservaciones: string;
  detalles: {
    productoId: number;
    cantidadEntregada: number;
    cantidadConsumida: number;
  }[];
}

export interface ProductoSug {
  id_producto: number;
  nombre_producto: string;
  unidad_medida: { abreviatura: string };
}

export interface DetalleDietaSug {
  producto_id: number;
  cantidad: string;
  frecuencia: string;
  producto: ProductoSug;
}

export interface SugerenciaDietaResponse {
  nombre_dieta: string;
  detalles_dieta: DetalleDietaSug[];
}
