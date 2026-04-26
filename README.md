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

## 🛡️ Seguridad Avanzada (RSA Daily Encryption)

Este proyecto implementa una capa extra de seguridad denominada **"Cifrado a Nivel de Aplicación"** mediante algoritmos asimétricos (RSA). Este mecanismo protege las credenciales de los usuarios incluso si el túnel HTTPS fuera comprometido.

### Flujo de Cifrado
1. **Rotación Diaria:** El backend genera un nuevo par de llaves RSA (Pública y Privada) automáticamente cada 24 horas.
2. **Entrega de Llave:** El frontend solicita la llave pública del día antes de enviar formularios sensibles (Login/Registro).
3. **Cifrado en el Cliente:** La contraseña se cifra en el navegador del usuario usando la llave pública, convirtiéndola en un bloque ilegible.
4. **Descifrado Seguro:** El backend recibe el bloque cifrado y lo descifra utilizando la llave privada que reside únicamente en la memoria/disco temporal del servidor.
5. **Doble Validación:** Tras el descifrado, el servidor vuelve a validar la fuerza de la contraseña antes de proceder al almacenamiento (hashing) final.

Este flujo garantiza que las contraseñas nunca viajen ni se registren en texto plano en ninguna capa intermedia de la infraestructura.