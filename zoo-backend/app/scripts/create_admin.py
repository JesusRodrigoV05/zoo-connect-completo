from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.tarea import TipoTarea
from app.models.inventario import TipoSalida
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash
from app.crud.permission import ensure_permissions_catalog, ensure_role_permissions
from sqlalchemy import or_
from app.core.config import settings

def create_default_admin():
    db = SessionLocal()
    try:
        print("--- Iniciando Semillas (Seeds) ---")

        print("1. Verificando Roles...")
        # ... (roles logic)
        roles_basicos = [
            {"id": 1, "name": "administrador"},
            {"id": 2, "name": "visitante"},
            {"id": 3, "name": "cuidador"},
            {"id": 4, "name": "veterinario"},
            {"id": 5, "name": "osi"}
        ]

        for rol in roles_basicos:
            rol_existente = db.query(Role).filter_by(id=rol["id"]).first()
            if not rol_existente:
                print(f"   + Creando Rol: {rol['name']}")
                nuevo_rol = Role(id=rol["id"], name=rol["name"])
                db.add(nuevo_rol)
        
        print("2. Verificando Tipos de Tarea...")
        # ... (Tus validaciones existentes de TipoTarea)
        if not db.query(TipoTarea).filter_by(id_tipo_tarea=1).first():
            db.add(TipoTarea(id_tipo_tarea=1, nombre_tipo_tarea="Alimentacion", is_active=True))
        if not db.query(TipoTarea).filter_by(id_tipo_tarea=2).first():
            db.add(TipoTarea(id_tipo_tarea=2, nombre_tipo_tarea="Tratamiento Médico", is_active=True))
        
        print("3. Verificando Tipos de Salida...")
        # ... (Tus validaciones existentes de TipoSalida)
        if not db.query(TipoSalida).filter_by(id_tipo_salida=1).first():
            db.add(TipoSalida(id_tipo_salida=1, nombre_tipo_salida="Consumo Alimentación", is_active=True))

        print("4. Verificando Permisos...")
        ensure_permissions_catalog(db)
        ensure_role_permissions(db)

        print("5. Creando Usuarios de Sistema...")
        
        # Lista de usuarios a crear
        usuarios_seed = [
            {
                "email": settings.DEFAULT_ADMIN_EMAIL,
                "username": "admin.admin.primary",
                "phone_number": settings.DEFAULT_ADMIN_PHONE,
                "password": settings.DEFAULT_ADMIN_PASSWORD,
                "role": "administrador"
            },
            {
                "email": "jose.alvarado@zooconnect.qzz.io",
                "username": "jose.admin.alvarado",
                "phone_number": "+10000000002",
                "password": "AdminZ0o_2026_SecurePass!",
                "role": "administrador"
            },
            {
                "email": "juan.perez@zooconnect.qzz.io",
                "username": "juan.cuidador.perez",
                "phone_number": "+10000000003",
                "password": "Cuidador_2026_Safe#88",
                "role": "cuidador"
            },
            {
                "email": "ana.garcia@zooconnect.qzz.io",
                "username": "ana.vet.garcia",
                "phone_number": "+10000000004",
                "password": "Vet_Secure_Access_2026$",
                "role": "veterinario"
            },
            {
                "email": "visita1@gmail.com",
                "username": "visita.visitante.demo",
                "phone_number": "+10000000005",
                "password": "User_Visitor_Pass_99!",
                "role": "visitante"
            },
            {
                "email": "soporte@zooconnect.qzz.io",
                "username": "soporte.admin.tecnico",
                "phone_number": "+10000000006",
                "password": "Support_Zoo_Connect_2026*",
                "role": "administrador"
            }
        ]

        for u_data in usuarios_seed:
            user_exists = db.query(User).filter(
                or_(
                    User.id == u_data["username"],
                    User.email == u_data["email"]
                )
            ).first()
            if not user_exists:
                role = db.query(Role).filter(Role.name == u_data["role"]).first()
                if role:
                    print(f"   + Creando usuario: {u_data['username']}")
                    db.add(User(
                        id=u_data["username"],
                        email=u_data["email"],
                        username=u_data["username"],
                        phone_number=u_data["phone_number"],
                        hashed_password=get_password_hash(u_data["password"]),
                        is_active=True,
                        email_verified=True,
                        must_change_password=True,
                        role_id=role.id
                    ))

        print("6. Verificando usuario OSI...")
        osi_role = db.query(Role).filter(Role.name == "osi").first()
        if osi_role:
            osi_email = "osi@zooconnect.qzz.io"
            osi_user = db.query(User).filter(User.id == "oscar.osi.seguridad").first()
            if not osi_user:
                print("   + Creando usuario OSI de prueba")
                db.add(User(
                    id="oscar.osi.seguridad",
                    email=osi_email,
                    username="oscar.osi.seguridad",
                    phone_number="+10000000007",
                    hashed_password=get_password_hash("Osi_Secure_Change_2026!"),
                    is_active=True,
                    email_verified=True,
                    must_change_password=True,
                    role_id=osi_role.id,
                ))

        db.commit()
        print("--- Datos cargados exitosamente ---")

    except Exception as e:
        print(f"!!! Error cargando datos iniciales: {e}")
        db.rollback()
    finally:
        db.close()
