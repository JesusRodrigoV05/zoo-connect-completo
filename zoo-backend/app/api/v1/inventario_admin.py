from typing import Optional
import logging
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status, Query
from fastapi_pagination import Page
from fastapi_pagination.ext.sqlalchemy import paginate
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.dependencies import (
    require_inventory_create_product_permission,
    require_inventory_create_supplier_permission,
    require_inventory_manage_permission,
    require_inventory_read_permission,
)
from app.core.uploader import delete_from_cloudinary, upload_to_cloudinary
from app.crud import inventario
from app.db.session import get_db
from app.models import inventario as models_inv
from app.schemas import inventario as schemas_inv


router = APIRouter()
logger = logging.getLogger(__name__)

# helpers
def _get_tipo_producto_or_404(
    id: int, db: Session = Depends(get_db)
) -> models_inv.TipoProducto:
    db_obj = inventario.get_tipo_producto(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Tipo de producto no encontrado")
    return db_obj


def _get_unidad_medida_or_404(
    id: int, db: Session = Depends(get_db)
) -> models_inv.UnidadMedida:
    db_obj = inventario.get_unidad_medida(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Unidad de medida no encontrada")
    return db_obj


def _get_proveedor_or_404(
    id: int, db: Session = Depends(get_db)
) -> models_inv.Proveedor:
    db_obj = inventario.get_proveedor(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return db_obj


def _get_producto_or_404(id: int, db: Session = Depends(get_db)) -> models_inv.Producto:
    db_obj = inventario.get_producto(db, id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return db_obj


# TIPO PRODUCTO


@router.post(
    "/tipos-producto",
    response_model=schemas_inv.TipoProductoOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_inventory_manage_permission)],
)
def create_tipo_producto(
    tipo_producto_in: schemas_inv.TipoProductoCreate,
    db: Session = Depends(get_db),
):
    db_obj = inventario.get_tipo_producto_by_nombre(
        db, tipo_producto_in.nombre_tipo_producto
    )
    if db_obj:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El tipo de producto con este nombre ya existe",
        )
    return inventario.create_tipo_producto(db, tipo_producto_in)


@router.get(
    "/tipos-producto",
    response_model=Page[schemas_inv.TipoProductoOut],
    dependencies=[Depends(require_inventory_read_permission)],
)
def list_tipos_producto(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
):
    query = inventario.get_tipos_producto_query(db, include_inactive)
    return paginate(query)


@router.get(
    "/tipos-producto/{id}",
    response_model=schemas_inv.TipoProductoOut,
    dependencies=[Depends(require_inventory_read_permission)],
)
def get_tipo_producto(
    db_obj: models_inv.TipoProducto = Depends(_get_tipo_producto_or_404),
):
    return db_obj


@router.put(
    "/tipos-producto/{id}",
    response_model=schemas_inv.TipoProductoOut,
    dependencies=[Depends(require_inventory_manage_permission)],
)
def update_tipo_producto(
    id: int,
    tipo_producto_in: schemas_inv.TipoProductoUpdate,
    db_obj: models_inv.TipoProducto = Depends(_get_tipo_producto_or_404),
    db: Session = Depends(get_db),
):
    return inventario.update_tipo_producto(db, db_obj, tipo_producto_in)


@router.delete(
    "/tipos-producto/{id}",
    response_model=schemas_inv.TipoProductoOut,
    dependencies=[Depends(require_inventory_manage_permission)],
)
def soft_delete_tipo_producto(
    db_obj: models_inv.TipoProducto = Depends(_get_tipo_producto_or_404),
    db: Session = Depends(get_db),
):
    return inventario.delete_tipo_producto(db, db_obj)


# UNIDAD MEDIDA


@router.post(
    "/unidades-medida",
    response_model=schemas_inv.UnidadMedidaOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_inventory_manage_permission)],
)
def create_unidad_medida(
    unidad_in: schemas_inv.UnidadMedidaCreate,
    db: Session = Depends(get_db),
):
    return inventario.create_unidad_medida(db, unidad_in)


@router.get(
    "/unidades-medida",
    response_model=Page[schemas_inv.UnidadMedidaOut],
    dependencies=[Depends(require_inventory_read_permission)],
)
def list_unidades_medida(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
):
    query = inventario.get_unidades_medida_query(db, include_inactive)
    return paginate(query)


@router.get(
    "/unidades-medida/{id}",
    response_model=schemas_inv.UnidadMedidaOut,
    dependencies=[Depends(require_inventory_read_permission)],
)
def get_unidad_medida(
    db_obj: models_inv.UnidadMedida = Depends(_get_unidad_medida_or_404),
):
    return db_obj


@router.put(
    "/unidades-medida/{id}",
    response_model=schemas_inv.UnidadMedidaOut,
    dependencies=[Depends(require_inventory_manage_permission)],
)
def update_unidad_medida(
    id: int,
    unidad_in: schemas_inv.UnidadMedidaUpdate,
    db_obj: models_inv.UnidadMedida = Depends(_get_unidad_medida_or_404),
    db: Session = Depends(get_db),
):
    return inventario.update_unidad_medida(db, db_obj, unidad_in)


@router.delete(
    "/unidades-medida/{id}",
    response_model=schemas_inv.UnidadMedidaOut,
    dependencies=[Depends(require_inventory_manage_permission)],
)
def soft_delete_unidad_medida(
    db_obj: models_inv.UnidadMedida = Depends(_get_unidad_medida_or_404),
    db: Session = Depends(get_db),
):
    return inventario.delete_unidad_medida(db, db_obj)


# PROVEEDOR


@router.post(
    "/proveedores",
    response_model=schemas_inv.ProveedorOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_inventory_create_supplier_permission)],
)
def create_proveedor(
    proveedor_in: schemas_inv.ProveedorCreate,
    db: Session = Depends(get_db),
):
    return inventario.create_proveedor(db, proveedor_in)


@router.get(
    "/proveedores",
    response_model=Page[schemas_inv.ProveedorOut],
    dependencies=[Depends(require_inventory_read_permission)],
)
def list_proveedores(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
):
    query = inventario.get_proveedores_query(db, include_inactive)
    return paginate(query)


@router.get(
    "/proveedores/{id}",
    response_model=schemas_inv.ProveedorOut,
    dependencies=[Depends(require_inventory_read_permission)],
)
def get_proveedor(
    db_obj: models_inv.Proveedor = Depends(_get_proveedor_or_404),
):
    return db_obj


@router.put(
    "/proveedores/{id}",
    response_model=schemas_inv.ProveedorOut,
    dependencies=[Depends(require_inventory_create_supplier_permission)],
)
def update_proveedor(
    id: int,
    proveedor_in: schemas_inv.ProveedorUpdate,
    db_obj: models_inv.Proveedor = Depends(_get_proveedor_or_404),
    db: Session = Depends(get_db),
):
    return inventario.update_proveedor(db, db_obj, proveedor_in)


@router.delete(
    "/proveedores/{id}",
    response_model=schemas_inv.ProveedorOut,
    dependencies=[Depends(require_inventory_create_supplier_permission)],
)
def soft_delete_proveedor(
    db_obj: models_inv.Proveedor = Depends(_get_proveedor_or_404),
    db: Session = Depends(get_db),
):
    return inventario.delete_proveedor(db, db_obj)


# PRODUCTO


@router.post(
    "/productos",
    response_model=schemas_inv.ProductoOut,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_inventory_create_product_permission)],
)
def create_producto(
    db: Session = Depends(get_db),
    producto_data_json: str = Form(...),
    file: Optional[UploadFile] = File(
        None, description="La imagen opcional del producto"
    ),
):
    try:
        producto_in = schemas_inv.ProductoCreate.model_validate_json(producto_data_json)
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error en los datos JSON del producto: {e.errors()}",
        )

    photo_url = None
    public_id = None

    if file:
        try:
            upload_result = upload_to_cloudinary(file, folder="/productos")
            photo_url = upload_result.get("secure_url")
            public_id = upload_result.get("public_id")
        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Error al subir la imagen: {e}"
            )

    try:
        return inventario.create_producto(
            db=db, producto_in=producto_in, photo_url=photo_url, public_id=public_id
        )
    except Exception as e:
        if public_id:
            try:
                delete_from_cloudinary(public_id)
                logger.info(
                    "Rollback de imagen en Cloudinary tras error en BD",
                    extra={"public_id": public_id},
                )
            except Exception as e_cloud:
                logger.exception(
                    "No se pudo hacer rollback de imagen en Cloudinary",
                    extra={"public_id": public_id, "error": str(e_cloud)},
                )

        raise e


@router.get("/productos", response_model=Page[schemas_inv.ProductoOut], dependencies=[Depends(require_inventory_read_permission)])
def list_productos(
    include_inactive: bool = False,
    tipo_producto_id: Optional[int] = Query(None, description="Filtrar por ID de tipo de producto"),
    nombre: Optional[str] = Query(None, description="Buscar por nombre del producto"),
    db: Session = Depends(get_db),
):
    query = inventario.get_productos_query(
        db, 
        include_inactive=include_inactive,
        tipo_producto_id=tipo_producto_id,
        nombre=nombre
    )
    return paginate(query)

@router.get(
    "/productos/{id}",
    response_model=schemas_inv.ProductoOut,
    dependencies=[Depends(require_inventory_read_permission)],
)
def get_producto(
    db_obj: models_inv.Producto = Depends(_get_producto_or_404),
):
    return db_obj


@router.put(
    "/productos/{id}",
    response_model=schemas_inv.ProductoOut,
    dependencies=[Depends(require_inventory_create_product_permission)],
)
def update_producto(
    id: int,
    producto_in: schemas_inv.ProductoUpdate,
    db_obj: models_inv.Producto = Depends(_get_producto_or_404),
    db: Session = Depends(get_db),
):
    return inventario.update_producto(db, db_obj, producto_in)


@router.put(
    "/productos/{id}/imagen",
    response_model=schemas_inv.ProductoOut,
    dependencies=[Depends(require_inventory_create_product_permission)],
)
def update_producto_imagen(
    id: int,
    db_obj: models_inv.Producto = Depends(_get_producto_or_404),
    file: UploadFile = File(
        ..., description="La nueva imagen para reemplazar la anterior"
    ),
    db: Session = Depends(get_db),
):
    old_public_id = db_obj.public_id
    new_public_id = None

    try:
        upload_result = upload_to_cloudinary(file, folder="/productos")
        new_secure_url = upload_result.get("secure_url")
        new_public_id = upload_result.get("public_id")

        if not new_secure_url or not new_public_id:
            raise HTTPException(
                status_code=500,
                detail="Error en Cloudinary: no se recibieron credenciales",
            )

        db_producto_actualizado = inventario.update_producto_imagen(
            db=db, db_producto=db_obj, photo_url=new_secure_url, public_id=new_public_id
        )

    except Exception as e:
        if new_public_id:
            delete_from_cloudinary(new_public_id)
        raise HTTPException(
            status_code=500, detail=f"Error al reemplazar la imagen: {e}"
        )

    if old_public_id:
        try:
            delete_from_cloudinary(old_public_id)
        except Exception as e:
            logger.warning(
                "No se pudo eliminar la imagen antigua de Cloudinary",
                extra={"public_id": old_public_id, "error": str(e)},
            )

    return db_producto_actualizado


@router.delete(
    "/productos/{id}",
    response_model=schemas_inv.ProductoOut,
    dependencies=[Depends(require_inventory_create_product_permission)],
)
def soft_delete_producto(
    db_obj: models_inv.Producto = Depends(_get_producto_or_404),
    db: Session = Depends(get_db),
):
    return inventario.delete_producto(db, db_obj)


@router.delete(
    "/productos/{id}/imagen",
    response_model=schemas_inv.ProductoOut,
    dependencies=[Depends(require_inventory_create_product_permission)],
)
def delete_producto_imagen(
    id: int,
    db_obj: models_inv.Producto = Depends(_get_producto_or_404),
    db: Session = Depends(get_db),
):
    public_id_to_delete = db_obj.public_id

    db_producto_actualizado = inventario.update_producto_imagen(
        db=db, db_producto=db_obj, photo_url=None, public_id=None
    )

    if public_id_to_delete:
        try:
            delete_from_cloudinary(public_id_to_delete)
        except Exception as e:
            logger.warning(
                "No se pudo eliminar imagen de Cloudinary",
                extra={"public_id": public_id_to_delete, "error": str(e)},
            )

    return db_producto_actualizado
