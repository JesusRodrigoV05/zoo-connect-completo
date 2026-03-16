export interface TipoProducto {
  id: number;
  nombre: string;
  descripcion: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnidadMedida {
  id: number;
  nombre: string;
  abreviatura: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Proveedor {
  id: number;
  nombre: string;
  telefono: string;
  email: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  stockMinimo: number;
  stockActual: number;
  photoUrl?: string;
  isActive: boolean;
  publicId?: string;

  tipoProductoId: number;
  unidadMedidaId: number;
  tipoProducto: TipoProducto;
  unidadMedida: UnidadMedida;
}

export interface CreateProducto {
  nombre: string;
  descripcion: string;
  stockMinimo: number;
  tipoProductoId: number;
  unidadMedidaId: number;
}

export interface UpdateProducto {
  nombre: string;
  descripcion: string;
  stockMinimo: number;
  tipoProductoId: number;
  unidadMedidaId: number;
  isActive: boolean;
}

export type CreateTipoProducto = Pick<TipoProducto, "nombre" | "descripcion">;
export type UpdateTipoProducto = Partial<CreateTipoProducto> & {
  isActive?: boolean;
};
export type CreateUnidadMedida = Pick<UnidadMedida, "nombre" | "abreviatura">;
export type UpdateUnidadMedida = Partial<CreateUnidadMedida> & {
  isActive?: boolean;
};
export type CreateProveedor = Pick<Proveedor, "nombre" | "telefono" | "email">;
export type UpdateProveedor = Partial<CreateProveedor> & { isActive?: boolean };
