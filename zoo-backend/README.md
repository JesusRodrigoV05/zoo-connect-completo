# 🦁 Zoo Connect API - Backend de Gestión

El backend oficial para el sistema **Zoo Connect**, una API RESTful robusta y segura construida con **FastAPI** y **Python**. Este componente centraliza la lógica de negocio, la seguridad y el acceso a datos para la gestión clínica, operativa y administrativa del zoológico.

El proyecto está diseñado con una arquitectura en capas, garantizando escalabilidad, fácil mantenimiento y un rendimiento óptimo en la comunicación con la base de datos **PostgreSQL**.

---

## 🛠️ Instalación y Configuración Local

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

### 1. Prerrequisitos

* Tener **Python 3.10** (o superior) instalado.
* Tener **PostgreSQL** instalado y ejecutándose localmente.

### 2. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/project_arca_backend.git
cd project_arca_backend
```

### 3. Crear y Activar el Entorno Virtual

Es fundamental utilizar un entorno virtual para aislar las dependencias del proyecto y evitar conflictos con otros paquetes de tu sistema.

**En Windows (Powershell o CMD):**

```bash
python -m venv venv
venv\Scripts\activate
```

**En MacOS / Linux:**

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Instalar Dependencias

Con el entorno virtual activado, instala todas las librerías necesarias ejecutando:

```bash
pip install -r requirements.txt
```

### 5. Configuración de Variables de Entorno 🔐
El sistema requiere credenciales para conectarse a la base de datos, enviar correos y manejar la seguridad. 

Crea un archivo llamado `.env` en la raíz del proyecto utilizando la plantilla proporcionada:

```bash
cp .env.example .env
```
### 6. Creación y Migración de la Base de Datos

Antes de iniciar el sistema, la base de datos y su estructura deben existir.

1. Abre tu gestor de PostgreSQL (pgAdmin, DBeaver o consola) y crea una base de datos vacía llamada `ZOOCONNECT` (o el nombre que hayas definido en tu `.env`).
2. Una vez creada la base de datos física, ejecuta la herramienta de migración **Alembic** para generar todas las tablas y relaciones necesarias:

```bash
alembic upgrade head
```

---

## 🏃‍♂️ Ejecución del Servidor

Una vez completados todos los pasos de configuración, puedes iniciar el servidor de desarrollo utilizando Uvicorn:

```bash
uvicorn app.main:app --reload

```

* La API estará disponible en: `http://localhost:8000`
* La **documentación interactiva automática (Swagger UI)** estará en: `http://localhost:8000/docs`
* La documentación alternativa (ReDoc) estará en: `http://localhost:8000/redoc`

---

## 📁 Estructura Principal del Proyecto

```text
project_arca_backend/
├── alembic/                 # Configuraciones y scripts de migración de BD
├── app/                     # Código fuente principal
│   ├── api/                 # Controladores y rutas (endpoints por versión)
│   ├── core/                # Configuraciones, seguridad, scheduler y utilidades
│   ├── crud/                # Lógica de acceso a datos (Create, Read, Update, Delete)
│   ├── models/              # Modelos de base de datos (SQLAlchemy)
│   ├── schemas/             # Esquemas Pydantic para validación de datos (Input/Output)
│   ├── scripts/             # Scripts utilitarios (ej. creación de administrador)
│   ├── templates/           # Plantillas estáticas (HTML/CSS)
│   └── main.py              # Punto de entrada de la aplicación FastAPI
├── .env                     # Variables de entorno (No se sube al repositorio)
├── alembic.ini              # Archivo de configuración principal de Alembic
└── requirements.txt         # Lista de dependencias del proyecto

```

**Desarrollado por el equipo Tech Zoo Innovators**


