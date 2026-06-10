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

Las pruebas están organizadas por miembro del equipo:

```text
zoo-frontend/src/tests/
├── jesusvelasco/
├── luzticona/
├── manueldelgadillo/
├── manueljimenez/
└── oscarmenacho/

zoo-backend/tests/
├── jesusvelasco/
│   ├── conftest.py
│   └── test_backend.py
├── luzticona/
├── manueldelgadillo/
├── manueljimenez/
└── oscarmenacho/
```

**Ejecutar tests localmente:**

```bash
# Backend
cd zoo-backend
source .venv/bin/activate
pytest tests/ -v

# Frontend
cd zoo-frontend
bun run test:unit
```

### 🐍 Backend — Pytest

Las pruebas utilizan `unittest.mock` para aislar la lógica de negocio de la base de datos real.

**Ejecutar manualmente vía Docker:**

```bash
docker compose run --rm backend pytest tests/ -v --tb=short
```

### 🌐 Frontend — Vitest

Pruebas unitarias con Vitest + Angular Testing (via `@analogjs/vite-plugin-angular`).

**Ejecutar manualmente vía Docker (stage build):**

```bash
docker build --target build -t zoo-frontend-test:ci ./zoo-frontend
docker run --rm zoo-frontend-test:ci bun run test:unit
```

---

## 🔧 CI/CD con Jenkins

El pipeline de Jenkins automatiza el ciclo completo: **construcción → pruebas unitarias → despliegue → pruebas de aceptación**.

```bash
Checkout → Build → Test Backend → Test Frontend → Deploy → Verify → Acceptance Tests
```
