from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID

class TriviaBase(BaseModel):
    fecha_trivia: datetime
    cantidad_preguntas: int
    dificultad: str

class TriviaCreate(TriviaBase):
    pass

class TriviaOut(TriviaBase):
    model_config = ConfigDict(from_attributes=True)
    id_trivia: UUID
    usuario_id: UUID

class ParticipacionTriviaCreate(BaseModel):
    trivia_id: UUID
    aciertos: int

class ParticipacionTriviaOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id_participacion_trivia: UUID
    usuario_id: UUID
    aciertos: int
    fecha_trivia: datetime
    trivia_id: UUID
