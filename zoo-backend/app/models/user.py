import uuid
import re
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship, validates
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import select

from app.db.base import Base
from app.models.role import Role
from app.core.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    email = Column(String(200), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    hashed_password = Column(String(200), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    email_verified = Column(Boolean, default=False, nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.id"), nullable=False)
    photo_url = Column(String(2048), nullable=True) 

    # 2fa
    is_totp_enabled = Column(Boolean, default=False, nullable=False)
    totp_secret = Column(String(255), nullable=True)
    
    # bloqueo
    locked_until = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    role = relationship("Role", back_populates="users")
    encuestas_creadas = relationship("Encuesta", back_populates="usuario_creador")
    participaciones_encuestas = relationship("ParticipacionEncuesta", back_populates="usuario")
    trivias_creadas = relationship("Trivia", back_populates="usuario")
    participaciones_trivia = relationship("ParticipacionTrivia", back_populates="usuario")   
    favorited_by_users = relationship("AnimalFavorito", back_populates="usuario", cascade="all, delete-orphan")
    
    backup_codes = relationship("TwoFactorCodes", back_populates="user", cascade="all, delete-orphan")
    
    # inventario
    entradas_inventario = relationship("EntradaInventario", back_populates="usuario")
    salidas_inventario = relationship("Salida", back_populates="usuario")
    
    # tareas
    tareas_asignadas = relationship("Tarea", back_populates="usuario_asignado", foreign_keys="[Tarea.usuario_asignado_id]")

    # veterinario
    historiales_creados = relationship("HistorialMedico", back_populates="veterinario")
    recetas_asignadas = relationship("RecetaMedica", back_populates="usuario_asignado")
