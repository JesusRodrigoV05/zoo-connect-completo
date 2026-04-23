import uuid
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base

class Trivia(Base):
    __tablename__ = "trivia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    titulo = Column(String(200), nullable=False)
    descripcion = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    usuario = relationship("User", back_populates="trivias_creadas")
    preguntas = relationship("PreguntaTrivia", back_populates="trivia", cascade="all, delete-orphan")
    participaciones = relationship("ParticipacionTrivia", back_populates="trivia", cascade="all, delete-orphan")

class PreguntaTrivia(Base):
    __tablename__ = "pregunta_trivia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    trivia_id = Column(UUID(as_uuid=True), ForeignKey("trivia.id"), nullable=False)
    texto_pregunta = Column(Text, nullable=False)
    puntos = Column(Integer, default=10, nullable=False)

    trivia = relationship("Trivia", back_populates="preguntas")
    opciones = relationship("OpcionTrivia", back_populates="pregunta", cascade="all, delete-orphan")

class OpcionTrivia(Base):
    __tablename__ = "opcion_trivia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    pregunta_id = Column(UUID(as_uuid=True), ForeignKey("pregunta_trivia.id"), nullable=False)
    texto_opcion = Column(Text, nullable=False)
    es_correcta = Column(Boolean, default=False, nullable=False)

    pregunta = relationship("PreguntaTrivia", back_populates="opciones")

class ParticipacionTrivia(Base):
    __tablename__ = "participacion_trivia"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    trivia_id = Column(UUID(as_uuid=True), ForeignKey("trivia.id"), nullable=False)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    puntaje_total = Column(Integer, default=0, nullable=False)
    fecha_participacion = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    trivia = relationship("Trivia", back_populates="participaciones")
    usuario = relationship("User", back_populates="participaciones_trivia")

    __table_args__ = (
        UniqueConstraint('usuario_id', 'trivia_id', name='_usuario_trivia_uc'),
    )
