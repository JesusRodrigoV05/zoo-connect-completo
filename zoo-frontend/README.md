# 🦁 Zoo Connect Web - Sistema de Gestión de Zoológicos

Una aplicación web moderna para la **gestión de zoológicos** construida con **Angular 21** y optimizada con **Bun**. Su objetivo es **digitalizar y centralizar** la información operativa y clínica (salud, dieta, inventario) para el personal (gerentes, veterinarios, cuidadores) y mejorar la toma de decisiones.

El proyecto **Zoo Connect Web** tiene como objetivo principal proporcionar **información consolidada** para optimizar los recursos, asegurar el bienestar animal y mejorar la eficiencia en la gestión del zoológico.

---

## 👥 Equipo y Proyecto

### Equipo: Tech Zoo Innovators

| Rol | Nombre | Responsabilidades |
| --- | --- | --- |
| **Product Owner** | Delgadillo Calderon, Manuel F. | Representar las necesidades del cliente y priorizar y gestionar el product backlog. |
| **Scrum Master** | Jimenez Mendoza, Manuel F. | Facilitar el proceso Scrum, eliminar impedimentos y asegurar la adherencia a las normas. |
| **Desarrolladores** | Delgadillo, M. F., Jimenez, M. F., Velasco, J. J. R. | Diseño, desarrollo y entrega de incrementos funcionales. |
| **QAs** | Delgadillo, M. F., Jimenez, M. F., Velasco, J. J. R. | Validar la calidad, funcionalidad y seguridad de cada incremento del producto. |

### Normas y Acuerdos del Equipo

* **Comunicación:** Utilizamos **Slack** (formal) y **Discord** (síncrono/urgente) para mantenernos actualizados y comunicarnos eficazmente.
* **Reuniones:** Celebramos **Daily Scrums** (15 min) diariamente para sincronización. Las ceremonias de *sprint* se calendarizan en **Trello**.
* **Resolución de Conflictos:** Los conflictos se abordan de manera constructiva, escalando la decisión al **Scrum Master (Jimenez)** para mediar una solución colaborativa.
* **Entrega de Trabajo:** Se espera que cada miembro entregue su trabajo dentro del plazo y de acuerdo con la **Definición de Hecho (DoD)**, incluyendo una revisión de código obligatoria y pruebas de QA.

### Arquitectura y Herramientas

* **Herramientas de Desarrollo:** VS Code, Bun, GitHub, Postman, Docker.
* **Gestor de Base de Datos:** PostgreSQL (base de datos relacional robusta).
* **Arquitectura del Sistema:** El sistema utiliza una **arquitectura modular desacoplada** (Frontend Angular 20 + Backend API) que permite una alta escalabilidad y un rendimiento óptimo. Se utiliza PostgreSQL para la gestión de la información crítica (clínica y operativa).

---

## 🚀 Tecnologías Principales

* **Angular 21:** Framework principal con las últimas características.
* **Bun:** Runtime de JavaScript ultrarrápido y gestor de paquetes.
* **TypeScript 5.8:** Tipado estático robusto.
* **NgRx Signals:** Manejo de estado reactivo moderno.
* **PostgreSQL:** Base de datos relacional para información crítica.

---

## 🛠️ Preparación e Instalación del Proyecto

### 1. Prerrequisitos (Instalar Bun)

**Bun** es nuestro runtime y gestor de paquetes principal. **No uses npm** para este proyecto.

**Windows (Powershell como administrador):**

```powershell
powershell -c "irm bun.sh/install.ps1 | iex"
```

**MacOS/Linux:**

```bash
curl -fsSL https://bun.sh/install | bash
```

**Verificar instalación:**

```bash
bun --version
```

### 2. Clonar el Repositorio

```bash
git clone https://github.com/jesusrodrigov/zoo_conect_web.git
cd zoo_conect_web
```

### 3. Instalar Dependencias

```bash
bun install
```

### 4. Configuración de Variables de Entorno 🔐

El proyecto utiliza variables para conectar con servicios externos y el backend. Copia la plantilla base y configura tus credenciales:

```bash
cp .env.example .env
```

Abre el archivo `.env` recién creado y completa el valor correspondiente de `WEATHER_API_KEY` (puedes obtener una clave en la página oficial de Weather API).

---

## 🏃‍♂️ Cómo Iniciar la Aplicación

El proyecto puede ejecutarse de dos maneras distintas, dependiendo de si estás desarrollando nuevas características o si deseas levantar el entorno definitivo para producción.

### Opción A: Entorno de Desarrollo Local (Normal)

Utiliza estos comandos para programar y ver los cambios en tiempo real. La aplicación estará disponible en `http://localhost:4200/`.

* **Servidor de desarrollo estándar:**
```bash
bun start
```

* **Modo observador de cambios:**
```bash
bun run watch
```


* **Servidor SSR (Server-Side Rendering) local:**
```bash
bun run serve:ssr:zoo-connect-web
```

* **Generar build de producción manual:**
```bash
bun run build
```



### Opción B: Despliegue con Docker (Producción)

Esta es la ruta oficial para garantizar un entorno aislado, seguro y de alto rendimiento.

**Paso 1: Construcción de la Imagen (Build)**
Compilamos la aplicación de forma limpia. Al usar el archivo `.env` en el paso de ejecución, evitamos que las claves sensibles queden grabadas en el código fuente.

```bash
docker build -t zoo-connect-web .
```

**Paso 2: Ejecución del Contenedor**
Ponemos en marcha el servidor mapeando el puerto interno al puerto 4200 e inyectando las variables de entorno de forma segura.

```bash
docker run -d --name zoo-connect-frontend -p 4200:4200 --env-file .env zoo-connect-web
```

**Paso 3: Verificación y Gestión del Contenedor**
La aplicación estará disponible en `http://localhost:4200`. Utiliza estos comandos para gestionar el servicio:

* **Ver logs:** `docker logs -f zoo-connect-frontend`
* **Detener servicio:** `docker stop zoo-connect-frontend`
* **Iniciar servicio detenido:** `docker start zoo-connect-frontend`

---

## 📁 Estructura del Proyecto

```text
src/
├── app/
│   ├── core/                    # funcionalidades centrales del sistema
│   │   ├── guards/              # guards de autenticación y autorización
│   │   ├── interceptors/        # http interceptors globales
│   │   ├── models/              # tipos e interfaces globales
│   │   └── store/               # estado global con ngrx signals
│   │
│   ├── features/                # módulos funcionales por dominio
│   │   ├── auth/                # autenticación y autorización
│   │   ├── admin/               # panel administrativo
│   │   ├── animales/            # gestión de animales
│   │   ├── encuestas/           # sistema de encuestas
│   │   ├── home/                # página principal
│   │   ├── profile/             # perfil de usuario
│   │   ├── settings/            # configuraciones generales
│   │   └── not-found/           # página 404
│   │
│   ├── shared/                  # recursos compartidos
│   │   ├── components/          # componentes reutilizables (header, footer, forms, loader)
│   │   ├── layout/              # layouts principales
│   │   ├── services/            # servicios globales
│   │   └── utils/               # utilidades y helpers
│   │
│   ├── app.config.ts            # configuración principal
│   ├── app.routes.ts            # definición de rutas
│   └── app.ts                   # componente raíz
│
├── environment/                 # variables de entorno
├── assets/                      # recursos estáticos (imágenes, iconos, logos)
└── styles.scss                  # estilos globales principales

```

> **Nota:** La aplicación está en desarrollo activo. Se agregarán más módulos funcionales como gestión veterinaria, control de inventarios y sistema de reportes avanzados.

---

## 🔐 Sistema de Autenticación

La aplicación cuenta con un sistema robusto que incluye:

* Login y registro con validaciones reactivas.
* Tokens JWT (Access + Refresh Token) con auto-refresh.
* Persistencia segura compatible con SSR en `localStorage`.
* Guards de autenticación para proteger rutas sensibles.

**Roles disponibles:**

* `administrador`: Acceso total.
* `veterinario`: Gestión clínica de animales.
* `cuidador`: Mantenimiento diario.
* `visitante`: Visualización básica.

---

## 🔧 Gestión de Dependencias (Uso de Bun)

Para mantener la integridad del proyecto, es obligatorio usar únicamente Bun para instalar o actualizar librerías:

```bash
bun add nombre-paquete
bun add -d nombre-paquete
bun update
```

**Dependencias principales establecidas:**

* `@angular/core` ^20.0.0
* `@ngrx/signals` ^20.0.1
* `primeng` ^20.2.0
* `rxjs` ~7.8.0

---

## 🌐 Backend API

La aplicación web requiere conexión con el backend estructurado en FastAPI. Las rutas de conexión son:

* **Desarrollo:** `http://localhost:8000/api/v1`
* **Producción:** Configurado internamente en `environment.production.ts`.


**desarrollado con ❤️ usando angular 20 y bun por el equipo tech zoo innovators**
