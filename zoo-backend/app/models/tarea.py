import uuid
from sqlalchemy import (
    Column, Integer, String, Boolean, ForeignKey, DateTime, func,
    Text, Numeric, Date, CheckConstraint, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base


class TipoTarea(Base):
    __tablename__ = "tipo_tarea"
    
    id_tipo_tarea = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre_tipo_tarea = Column(String(100), nullable=False, unique=True)
    descripcion_tipo_tarea = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    tareas = relationship("Tarea", back_populates="tipo_tarea")
    tareas_recurrentes = relationship("TareaRecurrente", back_populates="tipo_tarea")
#id 1 siempre alimentacion
class Tarea(Base):
    __tablename__ = "tarea"
    
    id_tarea = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo = Column(String(255), nullable=False)
    descripcion_tarea = Column(Text, nullable=True)
    
    usuario_asignado_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True, index=True)
    tipo_tarea_id = Column(UUID(as_uuid=True), ForeignKey("tipo_tarea.id_tipo_tarea"), nullable=False, index=True)
    
    fecha_programada = Column(Date, nullable=False, index=True)
    is_completed = Column(Boolean, default=False, nullable=False, index=True)
    fecha_completada = Column(DateTime(timezone=True), nullable=True)
    notas_completacion = Column(Text, nullable=True)
    
    animal_id = Column(UUID(as_uuid=True), ForeignKey("animals.id_animal"), nullable=True)
    habitat_id = Column(UUID(as_uuid=True), ForeignKey("habitats.id_habitat"), nullable=True)
    
    tarea_recurrente_id = Column(UUID(as_uuid=True), ForeignKey("tarea_recurrente.id_tarea_recurrente"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    tipo_tarea = relationship("TipoTarea", back_populates="tareas")
    usuario_asignado = relationship("User", back_populates="tareas_asignadas")
    animal = relationship("Animal", back_populates="tareas")
    habitat = relationship("Habitat", back_populates="tareas")
    tarea_recurrente = relationship("TareaRecurrente", back_populates="tareas_generadas")
    

    registro_alimentacion_generado = relationship( "RegistroAlimentacion", back_populates="tarea_asociada", uselist=False, cascade="all, delete-orphan")

class TareaRecurrente(Base):
    __tablename__ = "tarea_recurrente"
    
    id_tarea_recurrente = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo_plantilla = Column(String(255), nullable=False)
    descripcion_plantilla = Column(Text, nullable=True)
    
    tipo_tarea_id = Column(UUID(as_uuid=True), ForeignKey("tipo_tarea.id_tipo_tarea"), nullable=False)
    usuario_asignado_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    frecuencia_cron = Column(String(100), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    animal_id = Column(UUID(as_uuid=True), ForeignKey("animals.id_animal"), nullable=True)
    habitat_id = Column(UUID(as_uuid=True), ForeignKey("habitats.id_habitat"), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    tipo_tarea = relationship("TipoTarea", back_populates="tareas_recurrentes")
    usuario_asignado = relationship("User", backref="tareas_recurrentes_asignadas")
    animal = relationship("Animal", back_populates="tareas_recurrentes")
    habitat = relationship("Habitat", back_populates="tareas_recurrentes")
    
    tareas_generadas = relationship("Tarea", back_populates="tarea_recurrente")


class Dieta(Base):
    __tablename__ = "dieta"
    
    id_dieta = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    nombre_dieta = Column(String(100), nullable=False, unique=True)
    animal_id = Column(UUID(as_uuid=True), ForeignKey("animals.id_animal"), nullable=True)
    especie_id = Column(UUID(as_uuid=True), ForeignKey("especies.id_especie"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    animal = relationship("Animal", back_populates="dieta", uselist=False)
    especie = relationship("Especie", back_populates="dieta", uselist=False)
    detalles_dieta = relationship("DetalleDieta", back_populates="dieta", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint('animal_id IS NOT NULL OR especie_id IS NOT NULL', name='chk_dieta_target'),
        UniqueConstraint('animal_id', name='uq_dieta_animal_id'),
        UniqueConstraint('especie_id', name='uq_dieta_especie_id'),
    )

class DetalleDieta(Base):
    __tablename__ = "detalle_dieta"
    
    id_detalle_dieta = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dieta_id = Column(UUID(as_uuid=True), ForeignKey("dieta.id_dieta"), nullable=False)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("productos.id_producto"), nullable=False)
    unidad_medida_id = Column(UUID(as_uuid=True), ForeignKey("unidad_medida.id_unidad"), nullable=False)
    
    cantidad = Column(Numeric(10, 2), nullable=False)
    frecuencia = Column(String(50), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    dieta = relationship("Dieta", back_populates="detalles_dieta")
    producto = relationship("Producto", back_populates="detalles_dieta")
    unidad_medida = relationship("UnidadMedida", back_populates="detalles_dieta")

class RegistroAlimentacion(Base):
    __tablename__ = "registro_alimentacion"
    
    id_registro_alimentacion = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    fecha_alimentacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    notas_observaciones = Column(Text, nullable=True)
    
    animal_id = Column(UUID(as_uuid=True), ForeignKey("animals.id_animal"), nullable=True)
    habitat_id = Column(UUID(as_uuid=True), ForeignKey("habitats.id_habitat"), nullable=True)
    
    tarea_id = Column(UUID(as_uuid=True), ForeignKey("tarea.id_tarea"), nullable=True, unique=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    usuario = relationship("User", backref="registros_alimentacion")
    animal = relationship("Animal", back_populates="registros_alimentacion")
    habitat = relationship("Habitat", back_populates="registros_alimentacion")
    tarea_asociada = relationship("Tarea", back_populates="registro_alimentacion_generado")
    
    detalles_alimentacion = relationship("DetalleAlimentacion", back_populates="registro_alimentacion", cascade="all, delete-orphan")
    
    __table_args__ = (
        CheckConstraint('animal_id IS NOT NULL OR habitat_id IS NOT NULL', name='chk_registro_alimentacion_target'),
    )

class DetalleAlimentacion(Base):
    __tablename__ = "detalle_alimentacion"
    
    id_detalle_alimentacion = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    registro_alimentacion_id = Column(UUID(as_uuid=True), ForeignKey("registro_alimentacion.id_registro_alimentacion"), nullable=False)
    producto_id = Column(UUID(as_uuid=True), ForeignKey("productos.id_producto"), nullable=False)
    
    cantidad_entregada = Column(Numeric(10, 2), nullable=False)
    cantidad_consumida = Column(Numeric(10, 2), nullable=True)

    registro_alimentacion = relationship("RegistroAlimentacion", back_populates="detalles_alimentacion")
    producto = relationship("Producto", back_populates="detalles_alimentacion")
