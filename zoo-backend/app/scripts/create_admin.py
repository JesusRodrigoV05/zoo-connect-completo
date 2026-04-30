from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.tarea import TipoTarea
from app.models.inventario import TipoSalida
from app.models.role import Role
from app.models.user import User
from app.core.security import get_password_hash
from app.crud.permission import ensure_permissions_catalog, ensure_role_permissions

def init_db():
    db = SessionLocal()
    try:
        print("--- Iniciando Semillas (Seeds) ---")

        print("1. Verificando Roles...")
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
                "email": "admin@zooconnect.com",
                "username": "admin_central",
                "password": "AdminZ0o_2026_SecurePass!",
                "role": "administrador"
            },
            {
                "email": "juan.cuidador@zooconnect.com",
                "username": "juan_cuida",
                "password": "Cuidador_2026_Safe#88",
                "role": "cuidador"
            },
            {
                "email": "ana.vet@zooconnect.com",
                "username": "ana_veterinaria",
                "password": "Vet_Secure_Access_2026$",
                "role": "veterinario"
            },
            {
                "email": "visita1@gmail.com",
                "username": "visitante_pro",
                "password": "User_Visitor_Pass_99!",
                "role": "visitante"
            },
            {
                "email": "soporte@zooconnect.com",
                "username": "soporte_tecnico",
                "password": "Support_Zoo_Connect_2026*",
                "role": "administrador"
            }
        ]

        for u_data in usuarios_seed:
            user_exists = db.query(User).filter(User.email == u_data["email"]).first()
            if not user_exists:
                role = db.query(Role).filter(Role.name == u_data["role"]).first()
                if role:
                    print(f"   + Creando usuario: {u_data['username']}")
                    db.add(User(
                        email=u_data["email"],
                        username=u_data["username"],
                        hashed_password=get_password_hash(u_data["password"]),
                        is_active=True,
                        role_id=role.id
                    ))

        print("6. Verificando usuario OSI...")
        osi_role = db.query(Role).filter(Role.name == "osi").first()
        if osi_role:
            osi_email = "osi@zconnect.com"
            osi_user = db.query(User).filter(User.email == osi_email).first()
            if not osi_user:
                print("   + Creando usuario OSI de prueba")
                db.add(User(
                    email=osi_email,
                    username="osi",
                    hashed_password=get_password_hash("osi123"),
                    is_active=True,
                    role_id=osi_role.id,
                ))

        db.commit()
        print("--- Datos cargados exitosamente ---")

    except Exception as e:
        print(f"!!! Error cargando datos iniciales: {e}")
        db.rollback()
    finally:
        db.close()
