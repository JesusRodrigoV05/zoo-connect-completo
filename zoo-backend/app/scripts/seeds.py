from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.tarea import TipoTarea
from app.models.inventario import TipoSalida
from app.models.role import Role


def init_db():
    db = SessionLocal()
    try:
        print("--- Iniciando Semillas (Seeds) ---")

        print("1. Verificando Roles...")
        roles_basicos = [
            {"id": 1, "name": "administrador"},
            {"id": 2, "name": "visitante"},
            {"id": 3, "name": "cuidador"},
            {"id": 4, "name": "veterinario"}
        ]

        for rol in roles_basicos:
            rol_existente = db.query(Role).filter_by(id=rol["id"]).first()
            if not rol_existente:
                print(f"   + Creando Rol: {rol['name']}")
                nuevo_rol = Role(id=rol["id"], name=rol["name"])
                db.add(nuevo_rol)
        
        print("2. Verificando Tipos de Tarea...")
        
        if not db.query(TipoTarea).filter_by(id_tipo_tarea=1).first():
            print("   + Creando Tipo Tarea: Alimentacion")
            db.add(TipoTarea(
                id_tipo_tarea=1, 
                nombre_tipo_tarea="Alimentacion",
                descripcion_tipo_tarea="Tareas relacionadas con dar de comer a los animales",
                is_active=True
            ))

        if not db.query(TipoTarea).filter_by(id_tipo_tarea=2).first():
            print("   + Creando Tipo Tarea: Tratamiento Médico")
            db.add(TipoTarea(
                id_tipo_tarea=2, 
                nombre_tipo_tarea="Tratamiento Médico",
                descripcion_tipo_tarea="Administración de medicamentos y curaciones",
                is_active=True
            ))
        
        print("3. Verificando Tipos de Salida...")

        if not db.query(TipoSalida).filter_by(id_tipo_salida=1).first():
            print("   + Creando Tipo Salida: Consumo Alimentación")
            db.add(TipoSalida(
                id_tipo_salida=1,
                nombre_tipo_salida="Consumo Alimentación",
                descripcion_tipo_salida="Salida automática generada por tareas de alimentación",
                is_active=True
            ))

        if not db.query(TipoSalida).filter_by(id_tipo_salida=2).first():
            print("   + Creando Tipo Salida: Consumo Tratamiento")
            db.add(TipoSalida(
                id_tipo_salida=2,
                nombre_tipo_salida="Consumo Tratamiento",
                descripcion_tipo_salida="Salida automática por aplicación de medicamentos",
                is_active=True
            ))

        print("4. Verificando Usuario Cuidador...")
        from app.models.user import User
        from app.core.security import get_password_hash
        if not db.query(User).filter_by(email="cuidador@zconnect.com").first():
            print("   + Creando usuario: cuidador@zconnect.com")
            db.add(User(
                email="cuidador@zconnect.com",
                username="cuidador",
                hashed_password=get_password_hash("cuidador123"),
                role_id=3,
                is_active=True,
                email_verified=True
            ))

        db.commit()
        print("--- Datos cargados exitosamente ---")

    except Exception as e:
        print(f"!!! Error cargando datos iniciales: {e}")
        db.rollback()
    finally:
        db.close()