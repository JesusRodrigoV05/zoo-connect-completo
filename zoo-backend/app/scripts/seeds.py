from datetime import date, timedelta
from decimal import Decimal

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.tarea import TipoTarea, Dieta, DetalleDieta, Tarea
from app.models.inventario import TipoSalida, UnidadMedida, TipoProducto, Producto, Proveedor
from app.models.veterinario import TipoAtencion
from app.models.role import Role
from app.models.animal import Animal, Especie, Habitat
from app.core.enums import RolId, UnidadMedidaNombre, TipoProductoNombre, AnimalState
from app.schemas.transacciones import EntradaInventarioCreate, DetalleEntradaCreate
from app.crud.transacciones import create_entrada_inventario

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

        print("4b. Verificando Usuario Keeper...")
        if not db.query(User).filter_by(email="keeper@zconnect.com").first():
            print("   + Creando usuario: keeper@zconnect.com")
            db.add(User(
                email="keeper@zconnect.com",
                username="keeper",
                hashed_password=get_password_hash("keeperABC123!"),
                role_id=RolId.CUIDADOR,
                is_active=True,
                email_verified=True,
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
        unidad_u = db.query(UnidadMedida).filter_by(abreviatura=UnidadMedidaNombre.UNIDAD.value).first()

        productos_base = [
            ("Carne picada", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Frutas variadas", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Verduras mixtas", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Balanceado seco", tipo_alimento.id_tipo_producto if tipo_alimento else 2, unidad_kg.id_unidad if unidad_kg else 1),
            ("Suplemento vitamínico", tipo_suplemento.id_tipo_producto if tipo_suplemento else 3, unidad_g.id_unidad if unidad_g else 2),
            ("Antibiótico", tipo_medicamento.id_tipo_producto if tipo_medicamento else 4, unidad_g.id_unidad if unidad_g else 2),
            ("Pastillas", tipo_medicamento.id_tipo_producto if tipo_medicamento else 4, unidad_u.id_unidad if unidad_u else 4),
        ]
        for nombre, tipo_id, unidad_id in productos_base:
            if not db.query(Producto).filter_by(nombre_producto=nombre).first():
                print(f"   + Creando Producto: {nombre}")
                db.add(Producto(
                    nombre_producto=nombre,
                    tipo_producto_id=tipo_id,
                    unidad_medida_id=unidad_id,
                    stock_actual=0,
                    stock_minimo=10,
                ))

        db.commit()
        print("   Productos guardados en BD")

        print("8. Verificando Tipos de Atención...")
        if not db.query(TipoAtencion).filter_by(nombre_tipo_atencion="Consulta General").first():
            print("   + Creando Tipo Atención: Consulta General")
            db.add(TipoAtencion(
                nombre_tipo_atencion="Consulta General",
                descripcion="Atención veterinaria general",
                is_active=True,
            ))

        print("9. Verificando Proveedores...")
        if not db.query(Proveedor).filter_by(nombre_proveedor="Exedrin").first():
            print("   + Creando Proveedor: Exedrin")
            db.add(Proveedor(
                nombre_proveedor="Exedrin",
                is_active=True,
            ))
        db.commit()
        print("   Proveedores guardados en BD")

        print("9b. Creando Stock inicial vía entrada de inventario...")
        exedrin = db.query(Proveedor).filter_by(nombre_proveedor="Exedrin").first()
        keeper = db.query(User).filter_by(email="keeper@zconnect.com").first()
        if exedrin and keeper:
            productos_sin_stock = db.query(Producto).filter(Producto.stock_actual == 0).all()
            if productos_sin_stock:
                detalles_entrada = []
                for p in productos_sin_stock:
                    detalles_entrada.append(
                        DetalleEntradaCreate(
                            producto_id=p.id_producto,
                            cantidad_entrada=Decimal("100"),
                            fecha_caducidad=date.today() + timedelta(days=365),
                            lote="LOTE-INICIAL",
                        )
                    )
                entrada_data = EntradaInventarioCreate(
                    proveedor_id=exedrin.id_proveedor,
                    detalles=detalles_entrada,
                )
                print(f"   + Creando entrada con {len(detalles_entrada)} producto(s)")
                create_entrada_inventario(db, entrada_data, keeper.id)
        else:
            print("   ! Saltando entrada: falta proveedor o keeper")

        print("10. Verificando Hábitat, Especie, Animal, Dieta y Tarea para tests...")

        habitat = db.query(Habitat).filter_by(nombre_habitat="Catedral del Vuelo").first()
        if not habitat:
            print("   + Creando Hábitat: Catedral del Vuelo")
            habitat = Habitat(
                nombre_habitat="Catedral del Vuelo",
                tipo_habitat="Aviario",
                descripcion_habitat="Aviario de gran altura para aves rapaces",
                condiciones_climaticas="Tropical húmedo",
            )
            db.add(habitat)
            db.flush()

        especie = db.query(Especie).filter_by(nombre_cientifico="Harpia harpyja").first()
        if not especie:
            print("   + Creando Especie: Harpia harpyja (Águila Arpía)")
            especie = Especie(
                nombre_cientifico="Harpia harpyja",
                nombre_especie="Águila Arpía",
                filo="Chordata",
                clase="Aves",
                orden="Accipitriformes",
                familia="Accipitridae",
                descripcion_especie="Una de las águilas más grandes del mundo",
            )
            db.add(especie)
            db.flush()

        animal = db.query(Animal).filter_by(nombre_animal="Arpía").first()
        if not animal:
            print("   + Creando Animal: Arpía")
            animal = Animal(
                nombre_animal="Arpía",
                especie_id=especie.id_especie,
                genero=True,
                procedencia_animal="Rescate",
                estado_operativo=AnimalState.SALUDABLE,
                habitat_id=habitat.id_habitat,
                es_publico=True,
                descripcion="Águila arpía rescatada para pruebas de aceptación",
            )
            db.add(animal)
            db.flush()
        print(f"   [DEBUG] Animal Arpía id={animal.id_animal}, especie_id={animal.especie_id}, habitat_id={animal.habitat_id}")

        balanceado = db.query(Producto).filter_by(nombre_producto="Balanceado seco").first()
        unidad_kg = db.query(UnidadMedida).filter_by(nombre_unidad="Kilogramo").first()
        print(f"   [DEBUG] Balanceado seco: {balanceado.id_producto if balanceado else 'None'}, stock={balanceado.stock_actual if balanceado else 'N/A'}")
        if balanceado and unidad_kg:
            dieta = db.query(Dieta).filter_by(animal_id=animal.id_animal).first()
            print(f"   [DEBUG] Dieta existente para animal_id={animal.id_animal}: {dieta.id_dieta if dieta else 'None'}")
            if not dieta:
                print("   + Creando Dieta para Arpía")
                dieta = Dieta(
                    nombre_dieta=f"Dieta Arpía {animal.id_animal}",
                    animal_id=animal.id_animal,
                )
                db.add(dieta)
                db.flush()
                print(f"   [DEBUG] Dieta creada id={dieta.id_dieta}")

                detalle = DetalleDieta(
                    dieta_id=dieta.id_dieta,
                    producto_id=balanceado.id_producto,
                    unidad_medida_id=unidad_kg.id_unidad,
                    cantidad=10,
                    frecuencia="Diaria",
                )
                db.add(detalle)
                print("   + Creando Detalle de Dieta: Balanceado seco 10 kg diarios")
            else:
                print(f"   [DEBUG] Dieta ya existe, saltando creacion")

            keeper = db.query(User).filter_by(email="keeper@zconnect.com").first()
            print(f"   [DEBUG] Keeper: {keeper.email if keeper else 'None'}")
            if keeper:
                tarea_existente = db.query(Tarea).filter_by(
                    animal_id=animal.id_animal,
                    usuario_asignado_id=keeper.id,
                    tipo_tarea_id=1,
                    fecha_programada=date.today(),
                ).first()
                if not tarea_existente:
                    print("   + Creando Tarea de Alimentación para Arpía")
                    db.add(Tarea(
                        titulo="Alimentación Arpía",
                        descripcion_tarea="Alimentación diaria con Balanceado seco",
                        usuario_asignado_id=keeper.id,
                        tipo_tarea_id=1,
                        fecha_programada=date.today(),
                        animal_id=animal.id_animal,
                        habitat_id=habitat.id_habitat,
                    ))

        db.commit()
        print("--- Datos cargados exitosamente ---")

    except Exception as e:
        print(f"!!! Error cargando datos iniciales: {e}")
        db.rollback()
    finally:
        db.close()