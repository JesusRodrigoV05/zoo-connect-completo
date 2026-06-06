from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.tarea import TipoTarea
from app.models.inventario import TipoSalida, UnidadMedida, TipoProducto, Producto
from app.models.role import Role
from app.core.enums import RolId, UnidadMedidaNombre, TipoProductoNombre

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
                role_id=RolId.CUIDADOR,
                is_active=True,
                email_verified=True
            ))

        print("5. Verificando Unidades de Medida...")
        unidades = [
            ("Kilogramo", UnidadMedidaNombre.KILOGRAMO.value),
            ("Gramo", UnidadMedidaNombre.GRAMO.value),
            ("Litro", UnidadMedidaNombre.LITRO.value),
            ("Unidad", UnidadMedidaNombre.UNIDAD.value),
        ]
        for nombre, abreviatura in unidades:
            if not db.query(UnidadMedida).filter_by(nombre_unidad=nombre).first():
                print(f"   + Creando Unidad: {nombre} ({abreviatura})")
                db.add(UnidadMedida(nombre_unidad=nombre, abreviatura=abreviatura))

        print("6. Verificando Tipos de Producto...")
        tipos_producto = [
            TipoProductoNombre.SIN_CLASIFICAR,
            TipoProductoNombre.ALIMENTO,
            TipoProductoNombre.SUPLEMENTO,
            TipoProductoNombre.MEDICAMENTO,
        ]
        for tipo in tipos_producto:
            if not db.query(TipoProducto).filter_by(nombre_tipo_producto=tipo.value).first():
                print(f"   + Creando Tipo Producto: {tipo.value}")
                db.add(TipoProducto(nombre_tipo_producto=tipo.value))

        print("7. Verificando Productos...")
        tipo_alimento = db.query(TipoProducto).filter_by(nombre_tipo_producto=TipoProductoNombre.ALIMENTO.value).first()
        tipo_suplemento = db.query(TipoProducto).filter_by(nombre_tipo_producto=TipoProductoNombre.SUPLEMENTO.value).first()
        tipo_medicamento = db.query(TipoProducto).filter_by(nombre_tipo_producto=TipoProductoNombre.MEDICAMENTO.value).first()
        unidad_kg = db.query(UnidadMedida).filter_by(abreviatura=UnidadMedidaNombre.KILOGRAMO.value).first()
        unidad_g = db.query(UnidadMedida).filter_by(abreviatura=UnidadMedidaNombre.GRAMO.value).first()

        productos_base = [
            ("Carne picada", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Frutas variadas", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Verduras mixtas", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Balanceado seco", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Suplemento vitamínico", tipo_suplemento.id_tipo_producto if tipo_suplemento else 3, unidad_g.id_unidad if unidad_g else 2),
            ("Antibiótico", tipo_medicamento.id_tipo_producto if tipo_medicamento else 4, unidad_g.id_unidad if unidad_g else 2),
        ]
        for nombre, tipo_id, unidad_id in productos_base:
            if not db.query(Producto).filter_by(nombre_producto=nombre).first():
                print(f"   + Creando Producto: {nombre}")
                db.add(Producto(
                    nombre_producto=nombre,
                    tipo_producto_id=tipo_id,
                    unidad_medida_id=unidad_id,
                    stock_actual=100,
                    stock_minimo=10,
                ))

        db.commit()
        print("--- Datos cargados exitosamente ---")

    except Exception as e:
        print(f"!!! Error cargando datos iniciales: {e}")
        db.rollback()
    finally:
        db.close()