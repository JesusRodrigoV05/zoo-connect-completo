from sqlalchemy.orm import Session, Query, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException
from starlette import status
from typing import List, Optional
import secrets
import string
from datetime import datetime, timedelta, timezone

from app.models.user import User
from app.models.role import Role
from app.models.password_history import PasswordHistory
from app.schemas.user import (
    UserCreate,
    AdminUserCreate,
    AdminUserUpdate,
    UserUpdateProfile,
)
from app.core.security import get_password_hash, verify_password
from app.core.enums import UserRole
from app.core.config import settings

def _get_visitante_role_id(db: Session) -> int:

    role = db.query(Role).filter(Role.name == UserRole.VISITANTE.value).first()
    if not role:
        raise RuntimeError(
            f"Rol por defecto '{UserRole.VISITANTE.value}' no encontrado en la base de datos"
        )
    return role.id


def get_user(db: Session, user_id: int) -> Optional[User]:
    """
    Obtiene un usuario por su ID
    """
    return (
        db.query(User).options(joinedload(User.role)).filter(User.id == user_id).first()
    )


def get_user_by_email(db: Session, email: str) -> User | None:
    """
    Busca un usuario por su email, aplicando la misma normalizacion
    """
    normalized_email = email.strip().lower()
    return (
        db.query(User)
        .options(joinedload(User.role))
        .filter(User.email == normalized_email)
        .first()
    )


def get_users_query(
    db: Session,
    role_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = "id",
    sort_type: Optional[str] = "desc",
) -> Query:
    query = db.query(User).options(joinedload(User.role))

    if role_id is not None:
        query = query.filter(User.role_id == role_id)

    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    if search:
        query = query.filter(
            (User.username.ilike(f"%{search}%")) | (User.email.ilike(f"%{search}%"))
        )
    # Ordenamiento seguro (evitar inyección SQL)
    valid_sort_fields = {
        "id": User.id,
        "email": User.email,
        "username": User.username,
        "created_at": User.created_at,
        "is_active": User.is_active,
    }

    sort_field = valid_sort_fields.get(sort_by, User.id)
    if (sort_type or "desc").lower() == "asc":
        query = query.order_by(sort_field.asc())
    else:
        query = query.order_by(sort_field.desc())

    return query

def create_public_user(db: Session, user_in: UserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)
    role_id = _get_visitante_role_id(db)
    
    # Generar código de 6 dígitos
    verification_code = ''.join(secrets.choice(string.digits) for _ in range(6))
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)

    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password,
        is_active=False,  # Inactivo hasta verificar por email
        email_verified=False,
        verification_code=verification_code,
        verification_code_expires_at=expires_at,
        role_id=role_id,
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email o nombre de usuario ya existen: {e.orig}",
        )
    db.refresh(user)
    return user


def create_user_by_admin(db: Session, user_in: AdminUserCreate) -> User:
    hashed_password = get_password_hash(user_in.password)

    user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_password,
        is_active=user_in.is_active,
        role_id=user_in.role_id,
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Email o nombre de usuario ya existen: {e.orig}",
        )
    db.refresh(user)
    return user


def update_user_by_admin(
    db: Session, db_user_to_update: User, user_in: AdminUserUpdate
) -> User:
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user_to_update, field, value)

    db.add(db_user_to_update)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Conflicto de datos: {e.orig}"
        )
    db.refresh(db_user_to_update)
    return db_user_to_update


def delete_user_by_admin(db: Session, user_id_to_delete: int) -> Optional[User]:
    db_user = db.query(User).filter(User.id == user_id_to_delete).first()
    if not db_user:
        return None

    db.delete(db_user)
    db.commit()
    return db_user


def update_own_profile(
    db: Session, db_user_to_update: User, user_in: UserUpdateProfile
) -> User:
    update_data = user_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(db_user_to_update, field, value)

    db.add(db_user_to_update)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail=f"Conflicto de datos: {e.orig}"
        )
    db.refresh(db_user_to_update)
    return db_user_to_update


def update_password(db: Session, db_user: User, new_password: str) -> User:
    # Guardar en histórico antes de actualizar
    _save_password_to_history(db, db_user, db_user.hashed_password)

    # Verificar límite de histórico según rol
    _enforce_password_history_limit(db, db_user)

    db_user.hashed_password = get_password_hash(new_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def generate_new_verification_code(db: Session, email: str) -> Optional[User]:
    """
    Genera un nuevo código de verificación y actualiza la expiración.
    """
    user = get_user_by_email(db, email)
    if not user or user.email_verified:
        return None

    new_code = ''.join(secrets.choice(string.digits) for _ in range(6))
    user.verification_code = new_code
    user.verification_code_expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def verify_user_email(db: Session, email: str, code: str) -> bool:
    """
    Verifica el código, comprueba la expiración y activa al usuario.
    """
    user = get_user_by_email(db, email=email)
    if not user:
        return False

    # Si ya está verificado, retornar True
    if user.email_verified:
        return True

    # Verificar expiración
    if user.verification_code_expires_at and datetime.now(timezone.utc) > user.verification_code_expires_at:
        return False

    if user.verification_code == code:
        user.email_verified = True
        user.is_active = True
        user.verification_code = None  # Limpiar código tras éxito
        user.verification_code_expires_at = None
        db.add(user)
        db.commit()
        return True

    return False

def _save_password_to_history(db: Session, user: User, password_hash: str) -> None:
    """Guarda el hash de la contraseña actual en el histórico."""
    history_entry = PasswordHistory(user_id=user.id, password_hash=password_hash)
    db.add(history_entry)
    db.commit()


def _enforce_password_history_limit(db: Session, user: User) -> None:
    """Elimina entradas antiguas del histórico si se excede el límite del rol."""
    if not user.role:
        return

    role_name = user.role.name
    limit = _get_password_history_limit(role_name)

    if limit <= 0:
        return

    # Obtener registros ordenados por fecha (más reciente primero)
    history_records = (
        db.query(PasswordHistory)
        .filter(PasswordHistory.user_id == user.id)
        .order_by(PasswordHistory.created_at.desc())
        .all()
    )

    # Si excedemos el límite, eliminar los más antiguos
    if len(history_records) > limit:
        records_to_delete = history_records[limit:]
        for record in records_to_delete:
            db.delete(record)
        db.commit()


def _get_password_history_limit(role_name: str) -> int:
    """Obtiene el límite de histórico según el rol."""
    role_limits = {
        "administrador": settings.PASSWORD_HISTORY_ADMIN_MAX,
        "osi": settings.PASSWORD_HISTORY_ESPECIALISTA_MAX,
        "veterinario": settings.PASSWORD_HISTORY_ESPECIALISTA_MAX,
        "cuidador": settings.PASSWORD_HISTORY_ESPECIALISTA_MAX,
        "visitante": settings.PASSWORD_HISTORY_PACIENTE_MAX,
    }
    return role_limits.get(role_name, settings.PASSWORD_HISTORY_USUARIO_BASICO_MAX)


def is_password_in_history(db: Session, user: User, new_password: str) -> bool:
    """Verifica si la nueva contraseña ya estuvo en el histórico."""
    history_records = (
        db.query(PasswordHistory)
        .filter(PasswordHistory.user_id == user.id)
        .order_by(PasswordHistory.created_at.desc())
        .all()
    )

    for record in history_records:
        if verify_password(new_password, record.password_hash):
            return True
    return False


def get_password_history(db: Session, user_id: int, limit: int = 10) -> list:
    """Obtiene el histórico de contraseñas de un usuario."""
    return (
        db.query(PasswordHistory)
        .filter(PasswordHistory.user_id == user_id)
        .order_by(PasswordHistory.created_at.desc())
        .limit(limit)
        .all()
    )
