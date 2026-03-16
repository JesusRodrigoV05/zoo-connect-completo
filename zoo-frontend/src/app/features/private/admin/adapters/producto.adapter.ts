import {
  CreateProducto,
  CreateProveedor,
  CreateTipoProducto,
  CreateUnidadMedida,
  Producto,
  Proveedor,
  TipoProducto,
  UnidadMedida,
  UpdateProducto,
  UpdateProveedor,
  UpdateTipoProducto,
  UpdateUnidadMedida,
} from "../models/productos.model";

export class TipoProductoAdapter {
  static fromBackend(data: any): TipoProducto {
    return {
      id: data.id_tipo_producto,
      nombre: data.nombre_tipo_producto,
      descripcion: data.descripcion_tipo_producto,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static toCreate(data: CreateTipoProducto): any {
    return {
      nombre_tipo_producto: data.nombre,
      descripcion_tipo_producto: data.descripcion,
    };
  }

  static toUpdate(data: UpdateTipoProducto): any {
    return {
      nombre_tipo_producto: data.nombre,
      descripcion_tipo_producto: data.descripcion,
      is_active: data.isActive,
    };
  }
}

export class UnidadMedidaAdapter {
  static fromBackend(data: any): UnidadMedida {
    return {
      id: data.id_unidad,
      nombre: data.nombre_unidad,
      abreviatura: data.abreviatura,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static toCreate(data: CreateUnidadMedida): any {
    return {
      nombre_unidad: data.nombre,
      abreviatura: data.abreviatura,
    };
  }

  static toUpdate(data: UpdateUnidadMedida): any {
    return {
      nombre_unidad: data.nombre,
      abreviatura: data.abreviatura,
      is_active: data.isActive,
    };
  }
}

export class ProveedorAdapter {
  static fromBackend(data: any): Proveedor {
    return {
      id: data.id_proveedor,
      nombre: data.nombre_proveedor,
      telefono: data.telefono_proveedor,
      email: data.email_proveedor,
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  static toCreate(data: CreateProveedor): any {
    return {
      nombre_proveedor: data.nombre,
      telefono_proveedor: data.telefono,
      email_proveedor: data.email,
    };
  }

  static toUpdate(data: UpdateProveedor): any {
    return {
      nombre_proveedor: data.nombre,
      telefono_proveedor: data.telefono,
      email_proveedor: data.email,
      is_active: data.isActive,
    };
  }
}

export class ProductoAdapter {
  static fromBackend(data: any): Producto {
    return {
      id: data.id_producto,
      nombre: data.nombre_producto,
      descripcion: data.descripcion_producto,
      stockMinimo: Number(data.stock_minimo),
      stockActual: Number(data.stock_actual),
      photoUrl: data.photo_url,
      isActive: data.is_active,
      publicId: data.public_id,

      tipoProductoId: data.tipo_producto_id,
      unidadMedidaId: data.unidad_medida_id,

      tipoProducto: TipoProductoAdapter.fromBackend(data.tipo_producto),
      unidadMedida: UnidadMedidaAdapter.fromBackend(data.unidad_medida),
    };
  }

  static toCreate(data: CreateProducto): any {
    return {
      nombre_producto: data.nombre,
      descripcion_producto: data.descripcion,
      stock_minimo: data.stockMinimo,
      tipo_producto_id: data.tipoProductoId,
      unidad_medida_id: data.unidadMedidaId,
    };
  }

  static toUpdate(data: UpdateProducto): any {
    return {
      nombre_producto: data.nombre,
      descripcion_producto: data.descripcion,
      stock_minimo: data.stockMinimo,
      tipo_producto_id: data.tipoProductoId,
      unidad_medida_id: data.unidadMedidaId,
      is_active: data.isActive,
    };
  }
}
