# 🦁 Zoo Connect - Plataforma Global

Repositorio unificado (Monorepo) del sistema **Zoo Connect**, una plataforma moderna para la gestión clínica, operativa y administrativa de zoológicos. Este entorno integra tanto el frontend (Angular + Bun) como el backend (FastAPI + PostgreSQL + Redis) para facilitar su despliegue ágil y seguro mediante contenedores.

---

## 📁 Estructura del Repositorio

```text
/zoo-connect-completo
├── zoo-backend/           # API RESTful (FastAPI, Python 3.10)
├── zoo-frontend/          # Aplicación Web (Angular 20, Bun)
├── docker-compose.yml     # Orquestador de contenedores
└── .gitignore             # Reglas globales de exclusión

```

## Requisitos Previos

* **Docker** y **Docker Compose** instalados en tu sistema.
* No es necesario tener instalados Node, Bun o Python de forma local en tu máquina; el sistema descargará y encapsulará todo lo necesario dentro de los contenedores.

---

## Guía de Despliegue Rápido

Sigue estos pasos para levantar toda la infraestructura del zoológico con un solo comando:

### 1. Configurar Variables de Entorno

Asegúrate de crear y configurar los archivos `.env` en sus respectivas carpetas (basándote en los archivos `.env.example` de cada una):

* Directorio Backend: `zoo-backend/.env`
* Directorio Frontend: `zoo-frontend/.env`

### 2. Construir y Levantar el Sistema

Abre tu terminal en la raíz del proyecto (donde se encuentra el archivo `docker-compose.yml`) y ejecuta la orden de construcción y ejecución en segundo plano:

```bash
docker-compose up -d --build
```

### 3. Puntos de Acceso del Sistema

Una vez que el proceso finalice y los contenedores estén en ejecución, los servicios estarán disponibles en las siguientes direcciones:

* **Frontend (Interfaz de Usuario):** `http://localhost:4200`
* **Backend (Documentación de la API):** `http://localhost:8000/docs`
* **Base de Datos (PostgreSQL):** `localhost:5432`
* **Caché (Redis):** `localhost:6379`

---

## Gestión de Contenedores

Comandos útiles para la administración diaria del sistema en tu terminal (siempre desde la raíz del proyecto):

* **Ver los registros (logs) en tiempo real:**
```bash
docker-compose logs -f
```


* **Apagar todo el sistema:**
```bash
docker-compose down
```


* **Reiniciar el sistema completo:**
```bash
docker-compose restart
```

---

## Pruebas

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

Ejecutar tests:

```bash
cd zoo-frontend && vitest
cd zoo-backend && pytest
```

