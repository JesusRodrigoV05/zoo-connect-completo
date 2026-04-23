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
        roles_basicos = ["administrador", "visitante", "cuidador", "veterinario"]

        for role_name in roles_basicos:
            rol_existente = db.query(Role).filter_by(name=role_name).first()
            if not rol_existente:
                print(f"   + Creando Rol: {role_name}")
                nuevo_rol = Role(name=role_name)
                db.add(nuevo_rol)
        
        print("2. Verificando Tipos de Tarea...")
        
        tipos_tarea = [
            ("Alimentacion", "Tareas relacionadas con dar de comer a los animales"),
            ("Tratamiento Médico", "Administración de medicamentos y curaciones")
        ]
        for nombre, desc in tipos_tarea:
            if not db.query(TipoTarea).filter_by(nombre_tipo_tarea=nombre).first():
                print(f"   + Creando Tipo Tarea: {nombre}")
                db.add(TipoTarea(
                    nombre_tipo_tarea=nombre,
                    descripcion_tipo_tarea=desc,
                    is_active=True
                ))

        print("3. Verificando Tipos de Salida...")
        tipos_salida = [
            ("Consumo Alimentación", "Salida automática generada por tareas de alimentación"),
            ("Consumo Tratamiento", "Salida automática por aplicación de medicamentos")
        ]
        for nombre, desc in tipos_salida:
            if not db.query(TipoSalida).filter_by(nombre_tipo_salida=nombre).first():
                print(f"   + Creando Tipo Salida: {nombre}")
                db.add(TipoSalida(
                    nombre_tipo_salida=nombre,
                    descripcion_tipo_salida=desc,
                    is_active=True
                ))

        db.commit()
        print("--- Datos cargados exitosamente ---")

    except Exception as e:
        print(f"!!! Error cargando datos iniciales: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
