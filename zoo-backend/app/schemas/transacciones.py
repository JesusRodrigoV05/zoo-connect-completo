from pydantic import BaseModel, ConfigDict, model_validator
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal
from uuid import UUID
from app.schemas.user import UserOut 
from app.schemas.inventario import ProductoOut, ProveedorOut
from app.schemas.animal import AnimalOut, HabitatOut

# Schemas creacion
class DetalleEntradaCreate(BaseModel):
    producto_id: UUID
    cantidad_entrada: Decimal
    fecha_caducidad: date
    lote: str

class EntradaInventarioCreate(BaseModel):
    proveedor_id: UUID
    detalles: List[DetalleEntradaCreate] 

class DetalleEntradaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_detalle_entrada: UUID
    producto_id: UUID
    cantidad_entrada: Decimal
    fecha_caducidad: date
    lote: str
    
    producto: ProductoOut 

class EntradaInventarioOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_entrada_inventario: UUID
    fecha_entrada: datetime
    usuario_id: UUID
    proveedor_id: UUID

    usuario: UserOut
    proveedor: ProveedorOut
    detalles: List[DetalleEntradaOut]


# tipo salidas
class TipoSalidaBase(BaseModel):
    nombre_tipo_salida: str
    descripcion_tipo_salida: Optional[str] = None

class TipoSalidaCreate(TipoSalidaBase):
    pass

class TipoSalidaUpdate(BaseModel):
    nombre_tipo_salida: Optional[str] = None
    descripcion_tipo_salida: Optional[str] = None
    is_active: Optional[bool] = None

class TipoSalidaOut(TipoSalidaBase):
    model_config = ConfigDict(from_attributes=True)
    id_tipo_salida: UUID
    nombre_tipo_salida: str
    is_active: bool

# SALIDAS
class DetalleSalidaCreate(BaseModel):
    producto_id: UUID
    cantidad_salida: Decimal
    animal_id: Optional[UUID] = None
    habitat_id: Optional[UUID] = None

    @model_validator(mode='after')
    def check_destiny(self):
        if not self.animal_id and not self.habitat_id:
            raise ValueError('Debe especificar un animal_id o un habitat_id')
        if self.animal_id and self.habitat_id:
            raise ValueError('No puede especificar animal y habitat al mismo tiempo')
        return self

class SalidaInventarioCreate(BaseModel):
    tipo_salida: UUID
    detalles: List[DetalleSalidaCreate]


class DetalleSalidaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id_detalle_salida: UUID
    cantidad_salida: Decimal
    producto: ProductoOut 
    animal: Optional[AnimalOut] = None
    habitat: Optional[HabitatOut] = None

class SalidaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_salida: UUID
    fecha_salida: datetime
    
    tipo_salida: TipoSalidaOut
    usuario: UserOut
    detalles: List[DetalleSalidaOut]
