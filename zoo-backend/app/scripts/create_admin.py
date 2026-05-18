import logging
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User
from app.models.role import Role
from app.core.security import get_password_hash
from app.core.enums import UserRole
from app.crud.user import get_user_by_email

logger = logging.getLogger(__name__)

# Credenciales directas solicitadas
ADMIN_EMAIL = "admin@zooconnect.com"
ADMIN_PASSWORD = "ZooSecure_2026_Admin#99"

def create_default_admin():
    db: Session = SessionLocal()
    try:
        # 1. Asegurar que existan los roles básicos
        role_names = [role.value for role in UserRole]
        for name in role_names:
            if not db.query(Role).filter(Role.name == name).first():
                db.add(Role(name=name))
        db.commit()

        # Obtener el rol de administrador para el admin y rol de usuario para los demás
        admin_role = db.query(Role).filter(Role.name == UserRole.ADMINISTRADOR.value).first()
        user_role = db.query(Role).filter(Role.name == UserRole.USUARIO.value).first()

        # 2. Crear el Administrador por defecto
        existing_admin = get_user_by_email(db, email=ADMIN_EMAIL)
        if not existing_admin:
            logger.info(f"Creando usuario administrador por defecto: {ADMIN_EMAIL}")
            admin_user = User(
                email=ADMIN_EMAIL,
                username="superadmin",
                hashed_password=get_password_hash(ADMIN_PASSWORD),
                is_active=True,
                role_id=admin_role.id 
            )
            db.add(admin_user)
            logger.info("Admin creado exitosamente")
        else:
            logger.info("El administrador ya existe en la base de datos")

        # 3. Crear 5 usuarios adicionales de prueba
        test_users = [
            {"email": "juan.perez@test.com", "username": "juanp", "role": UserRole.USUARIO.value},
            {"email": "maria.vet@test.com", "username": "mariav", "role": UserRole.VETERINARIO.value},
            {"email": "carlos.m@test.com", "username": "carlosm", "role": UserRole.USUARIO.value},
            {"email": "ana.guia@test.com", "username": "anag", "role": UserRole.GUIA.value},
            {"email": "sergio.s@test.com", "username": "sergios", "role": UserRole.USUARIO.value},
        ]

        for u_data in test_users:
            if not get_user_by_email(db, email=u_data["email"]):
                logger.info(f"Creando usuario de prueba: {u_data['email']}")
                role_obj = db.query(Role).filter(Role.name == u_data["role"]).first()
                new_user = User(
                    email=u_data["email"],
                    username=u_data["username"],
                    hashed_password=get_password_hash("ZooTest12345678#"), # Contraseña genérica segura
                    is_active=True,
                    role_id=role_obj.id if role_obj else user_role.id
                )
                db.add(new_user)
        
        db.commit()
        logger.info("Proceso de semillas (seeds) completado exitosamente")

    except Exception as e:
        logger.error(f"Error en la creación de semillas: {e}", exc_info=True)
        db.rollback()
    finally:
        db.close()
