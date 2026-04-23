from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.core.enums import TareaEstado, TareaPrioridad
from app.schemas.user import UserOut
from app.schemas.animal import AnimalOut, HabitatOut

class TipoTareaBase(BaseModel):
    nombre: str
    descripcion: Optional[str] = None

class TipoTareaCreate(TipoTareaBase):
    pass

class TipoTareaOut(TipoTareaBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    is_active: bool

class TareaBase(BaseModel):
    titulo: str
    descripcion: Optional[str] = None
    prioridad: TareaPrioridad = TareaPrioridad.MEDIA
    fecha_limite: Optional[datetime] = None

class TareaCreate(TareaBase):
    tipo_tarea_id: UUID
    usuario_asignado_id: Optional[UUID] = None
    animal_id: Optional[UUID] = None
    habitat_id: Optional[UUID] = None

class TareaUpdate(BaseModel):
    titulo: Optional[str] = None
    descripcion: Optional[str] = None
    estado: Optional[TareaEstado] = None
    prioridad: Optional[TareaPrioridad] = None
    fecha_limite: Optional[datetime] = None
    usuario_asignado_id: Optional[UUID] = None

class TareaOut(TareaBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    estado: TareaEstado
    fecha_finalizacion: Optional[datetime] = None
    created_at: datetime
    
    tipo_tarea: TipoTareaOut
    usuario_asignado: Optional[UserOut] = None
    animal: Optional[AnimalOut] = None
    habitat: Optional[HabitatOut] = None
