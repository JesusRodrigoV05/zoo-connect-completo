# 🦁 Zoo Connect - Plataforma Global

Repositorio unificado (Monorepo) del sistema **Zoo Connect**, una plataforma moderna para la gestión clínica, operativa y administrativa de zoológicos. Este entorno integra tanto el frontend (Angular + Bun) como el backend (FastAPI + PostgreSQL + Redis) para facilitar su despliegue ágil y seguro mediante contenedores.

---

## 📁 Estructura del Repositorio

```text
/zoo-connect-completo
├── zoo-backend/               # API RESTful (FastAPI, Python 3.10)
│   ├── app/                   # Código fuente principal
│   │   ├── api/v1/            # Endpoints REST (inventario_admin.py, etc.)
│   │   ├── crud/              # Lógica de negocio (inventario.py, etc.)
│   │   ├── models/            # Modelos SQLAlchemy (inventario.py, etc.)
│   │   └── schemas/           # Esquemas Pydantic (inventario.py, etc.)
│   ├── tests/                 # ✅ Pruebas Unitarias Backend (Pytest 9.0.3)
│   │   └── test_inventario_crud.py
│   ├── requirements.txt       # Dependencias de producción
│   └── requirements-test.txt  # Dependencias de pruebas (pytest==9.0.3)
├── zoo-frontend/              # Aplicación Web (Angular 21, Bun)
│   ├── src/
│   │   ├── app/features/private/admin/
│   │   │   └── adapters/      # Adapters del inventario (bajo prueba)
│   │   └── tests/             # ✅ Pruebas Unitarias Frontend (Vitest 4.1.7)
│   │       └── inventario.spec.ts
│   ├── vitest.config.ts       # Configuración de Vitest
│   └── package.json
├── docker-compose.yml         # Orquestador de contenedores
├── Jenkinsfile                # ✅ Pipeline CI/CD (build + tests + deploy)
└── .gitignore
```

---

## Requisitos Previos

- **Docker** y **Docker Compose** instalados en tu sistema.
- **Jenkins** con el plugin de Pipeline y acceso a Docker en el agente.
- No es necesario tener instalados Node, Bun o Python de forma local en tu máquina; el sistema descargará y encapsulará todo lo necesario dentro de los contenedores.

---

## Guía de Despliegue Rápido

Sigue estos pasos para levantar toda la infraestructura del zoológico con un solo comando:

### 1. Configurar Variables de Entorno

Asegúrate de crear y configurar los archivos `.env` en sus respectivas carpetas (basándote en los archivos `.env.example` de cada una):

- Directorio Backend: `zoo-backend/.env`
- Directorio Frontend: `zoo-frontend/.env`

### 2. Construir y Levantar el Sistema

Abre tu terminal en la raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`) y ejecuta la orden de construcción y ejecución en segundo plano:

```bash
docker-compose up -d --build
```

### 3. Puntos de Acceso del Sistema

Una vez que el proceso finalice y los contenedores estén en ejecución, los servicios estarán disponibles en las siguientes direcciones:

- **Frontend (Interfaz de Usuario):** `http://localhost:4200`
- **Backend (Documentación de la API):** `http://localhost:8000/docs`
- **Base de Datos (PostgreSQL):** `localhost:5432`
- **Caché (Redis):** `localhost:6379`

---

## Gestión de Contenedores

Comandos útiles para la administración diaria del sistema en tu terminal (siempre desde la raíz del proyecto):

- **Ver los registros (logs) en tiempo real:**

```bash
docker-compose logs -f
```

- **Apagar todo el sistema:**

```bash
docker-compose down
```

- **Reiniciar el sistema completo:**

```bash
docker-compose restart
```

---

## ✅ Pruebas Unitarias

Las pruebas unitarias están enfocadas en la **Gestión de Inventario** del sistema y siguen la estructura de 3 pasos: **Preparación → Lógica → Verificación (Assert)**.

### 🐍 Backend — Pytest 9.0.3

**Archivo:** `zoo-backend/tests/test_inventario_crud.py`  
**Framework:** [Pytest 9.0.3](https://docs.pytest.org/)  
**Módulos bajo prueba:** `app.crud.inventario`, `app.models.inventario`, `app.schemas.inventario`

Las pruebas utilizan `unittest.mock` para aislar la lógica de negocio de la base de datos real, sin necesidad de conexión a PostgreSQL.

| #   | Nombre de la Prueba                                        | Función/Clase Probada    | Descripción                                                                              |
| --- | ---------------------------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------- |
| 1   | `test_create_tipo_producto_exitoso`                        | `create_tipo_producto`   | Verifica que el CRUD persiste un nuevo TipoProducto cuando no existe duplicado           |
| 2   | `test_create_tipo_producto_duplicado_lanza_excepcion`      | `create_tipo_producto`   | Verifica que lanza `HTTPException 409` al crear un TipoProducto duplicado                |
| 3   | `test_delete_tipo_producto_marca_inactivo`                 | `delete_tipo_producto`   | Verifica que el soft-delete establece `is_active = False` sin borrar el registro         |
| 4   | `test_update_producto_excluye_stock_actual`                | `update_producto`        | Verifica que el campo `stock_actual` nunca es modificado por una actualización           |
| 5   | `test_validate_producto_fks_tipo_inactivo_lanza_excepcion` | `_validate_producto_fks` | Verifica que lanza `HTTPException 400` cuando el TipoProducto referenciado está inactivo |

**Ejecutar manualmente vía Docker:**

```bash
docker compose run --rm backend pytest tests/ -v --tb=short
```

---

### 🌐 Frontend — Vitest 4.1.7

**Archivo:** `zoo-frontend/src/tests/inventario.spec.ts`  
**Framework:** [Vitest 4.1.7](https://vitest.dev/)  
**Módulos bajo prueba:** `adapters/producto.adapter.ts` (`ProductoAdapter`, `TipoProductoAdapter`, `UnidadMedidaAdapter`, `ProveedorAdapter`)

Las pruebas son **puras** (sin Angular TestBed ni DOM), validando la lógica de mapeo entre el formato `snake_case` del backend y el modelo `camelCase` del frontend.

| #   | Nombre de la Prueba                                  | Clase/Método Probado              | Descripción                                                                                        |
| --- | ---------------------------------------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | `TipoProductoAdapter > debe mapear correctamente...` | `TipoProductoAdapter.fromBackend` | Verifica el mapeo `id_tipo_producto → id`, `nombre_tipo_producto → nombre`, `is_active → isActive` |
| 2   | `ProductoAdapter > debe convertir stock_minimo...`   | `ProductoAdapter.fromBackend`     | Verifica que `stock_minimo` y `stock_actual` (strings Decimal) se convierten a `number`            |
| 3   | `ProductoAdapter > debe generar el payload...`       | `ProductoAdapter.toCreate`        | Verifica que el payload generado para el backend usa `snake_case` y no incluye claves `camelCase`  |
| 4   | `ProveedorAdapter > debe incluir is_active...`       | `ProveedorAdapter.toUpdate`       | Verifica que `isActive` se serializa como `is_active` en el payload de actualización               |
| 5   | `UnidadMedidaAdapter > debe mapear id_unidad...`     | `UnidadMedidaAdapter.fromBackend` | Verifica el mapeo `id_unidad → id` y que el campo original no se expone en el resultado            |

**Ejecutar manualmente vía Docker (stage build):**

```bash
docker build --target build -t zoo-frontend-test:ci ./zoo-frontend
docker run --rm zoo-frontend-test:ci bun run test:unit
```

---

## 🔧 CI/CD con Jenkins

### Pipeline Principal (`Jenkinsfile`)

El pipeline de Jenkins automatiza el ciclo completo: **construcción → pruebas unitarias → despliegue → pruebas de aceptación**.

```bash
Checkout → Build → Test Backend → Test Frontend → Deploy → Verify → Acceptance Tests
```

| Stage                | Descripción                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Checkout**         | Clona el repositorio desde SCM                                                              |
| **Build**            | Construye todas las imágenes Docker con `docker compose build --no-cache`                   |
| **Test Backend**     | Ejecuta los 5 tests de Pytest dentro del contenedor del backend                             |
| **Test Frontend**    | Construye la imagen del frontend en su stage `build` y ejecuta los 5 tests de Vitest        |
| **Deploy**           | Detiene contenedores anteriores y levanta el sistema con `docker compose up -d`             |
| **Verify**           | Verifica que todos los contenedores estén corriendo con `docker compose ps`                 |
| **Acceptance Tests** | Dispara el Job `zoo-connect-acceptance-testing-pipeline` de forma asíncrona (`wait: false`) |

> **Nota:** El stage de `Test Frontend` construye una imagen temporal `zoo-frontend-test:ci` con toda la cadena de herramientas de Node/Bun (stage `build` del Dockerfile) y la elimina automáticamente al finalizar. El pipeline falla si cualquiera de las 10 pruebas unitarias no es exitosa, previniendo el despliegue.

### Job de Pruebas de Aceptación

**Nombre del Job:** `zoo-connect-acceptance-testing-pipeline`

Este Job se dispara automáticamente al finalizar el stage de **Verify**, ejecutándose de forma independiente sin bloquear el pipeline principal (`wait: false`).
