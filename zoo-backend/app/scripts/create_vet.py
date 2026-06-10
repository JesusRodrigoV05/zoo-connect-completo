import logging

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.enums import UserRole
from app.core.security import get_password_hash
from app.crud.user import get_user_by_email
from app.db.session import SessionLocal
from app.models.role import Role
from app.models.user import User

logger = logging.getLogger(__name__)


def create_default_vet():
    db: Session = SessionLocal()
    try:
        vet_role_name = UserRole.VETERINARIO.value
        db_vet_role = db.query(Role).filter(Role.name == vet_role_name).first()

        if not db_vet_role:
            logger.info("El rol 'veterinario' no existe. Creándolo.")
            db_vet_role = Role(name=vet_role_name)
            db.add(db_vet_role)
            db.commit()
            db.refresh(db_vet_role)

        existing_vet = get_user_by_email(db, email=settings.DEFAULT_VET_EMAIL)
        hashed_password = get_password_hash(settings.DEFAULT_VET_PASSWORD)

        if existing_vet:
            updated = False
            if existing_vet.role_id != db_vet_role.id:
                logger.info(
                    "Actualizando rol del usuario %s a veterinario",
                    settings.DEFAULT_VET_EMAIL,
                )
                existing_vet.role_id = db_vet_role.id
                updated = True

            if not existing_vet.is_active:
                existing_vet.is_active = True
                updated = True

            existing_vet.hashed_password = hashed_password
            updated = True

            if updated:
                db.commit()
                logger.info(
                    "Usuario veterinario (%s) actualizado correctamente",
                    settings.DEFAULT_VET_EMAIL,
                )
            else:
                logger.info(
                    "El usuario veterinario (%s) ya existe con el rol correcto",
                    settings.DEFAULT_VET_EMAIL,
                )
            return

        logger.info(
            "Creando usuario veterinario por defecto: %s",
            settings.DEFAULT_VET_EMAIL,
        )
        vet_user = User(
            email=settings.DEFAULT_VET_EMAIL,
            username="vete",
            hashed_password=hashed_password,
            is_active=True,
            role_id=db_vet_role.id,
        )

        db.add(vet_user)
        db.commit()
        logger.info(
            "Usuario veterinario (%s) creado exitosamente",
            settings.DEFAULT_VET_EMAIL,
        )

    except Exception as e:
        logger.error(
            "Error al crear o actualizar el usuario veterinario por defecto: %s",
            e,
            exc_info=True,
        )
        db.rollback()
    finally:
        db.close()
