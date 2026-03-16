import { Usuario } from "@models/usuario";
import { Producto, Proveedor } from "../productos.model";

export interface TipoSalida {
  id: number;
  nombre: string;
  descripcion: string;
  isActive: boolean;
}

export type CreateTipoSalida = Pick<TipoSalida, "nombre" | "descripcion">;
export type UpdateTipoSalida = Partial<CreateTipoSalida> & {
  isActive?: boolean;
};

export interface DetalleEntrada {
  id?: number;
  productoId: number;
  producto?: Producto;
  cantidad: number;
  fechaCaducidad?: string;
  lote?: string;
}

export interface EntradaInventario {
  id: number;
  fecha: string;
  usuarioId: number;
  usuario?: Usuario;
  proveedorId?: number;
  proveedor?: Proveedor;
  detalles: DetalleEntrada[];
}

export interface CreateEntradaRequest {
  proveedorId?: number;
  detalles: {
    productoId: number;
    cantidad: number;
    fechaCaducidad?: string;
    lote?: string;
  }[];
}

export interface DetalleSalida {
  id?: number;
  productoId: number;
  producto?: Producto;
  cantidad: number;
  animalId?: number;
  habitatId?: number;
}

export interface SalidaInventario {
  id: number;
  fecha: string;
  tipoSalidaId: number;
  tipoSalida?: TipoSalida;
  usuarioId: number;
  usuario?: Usuario;
  detalles: DetalleSalida[];
}

export interface CreateSalidaRequest {
  tipoSalidaId: number;
  detalles: {
    productoId: number;
    cantidad: number;
    animalId?: number;
    habitatId?: number;
  }[];
}

export type AlertaStock = Producto;
