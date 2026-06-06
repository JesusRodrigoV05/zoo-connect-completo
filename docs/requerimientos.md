## 📋 Requerimientos Funcionales (RF)

Los requerimientos están divididos según los módulos operativos y de seguridad del sistema:

### 🐾 Gestión de Animales y Hábitats

* **RF-01 (Perfiles):** Creación, edición y baja lógica de perfiles de animales (datos biográficos, especie y salud). **[Actores: Admin, Veterinario]**.
* **RF-02 (Hábitats):** Registro y gestión de hábitats o áreas de manejo (estanques, aviarios) para asignar tareas y recursos globales. **[Actor: Administrador]**.
* **RF-03 (Multimedia e Integridad):** Adjuntar fotos a perfiles de animales y productos, garantizando la eliminación automática en la nube (Cloudinary) si falla el registro en la base de datos (Integridad Transaccional). **[Actores: Admin, Cuidador]**.

### 🩺 Gestión Clínica

* **RF-04 (Historial):** Registro y consulta del historial clínico completo (diagnósticos, tratamientos y vacunación). **[Actor: Veterinario]**.
* **RF-05 (Planes Alimenticios):** Configuración de dietas estandarizadas por especie o personalizadas por animal, detallando productos y cantidades. **[Actor: Veterinario]**.

### 📦 Gestión de Inventario

* **RF-06 (Catálogo Maestro):** Gestión de productos, proveedores, unidades de medida y tipos de salida. **[Actor: Administrador]**.
* **RF-07 (Entradas y Lotes):** Registro de abastecimiento con generación automática de lotes identificados por fecha de caducidad para trazabilidad. **[Actor: Administrador]**.
* **RF-08 (Algoritmo FEFO):** Salidas de inventario aplicando automáticamente el algoritmo *First Expired, First Out* (descontar del lote más próximo a vencer). **[Actores: Sistema, Admin]**.
* **RF-09 (Alertas de Stock):** Alertas automáticas y reportes cuando el stock cae por debajo del punto de reorden. **[Actores: Sistema, Admin]**.

### 📅 Gestión de Tareas y Operaciones

* **RF-10 (Plantillas CRON):** Configuración de plantillas de tareas recurrentes definiendo su periodicidad mediante expresiones CRON. **[Actor: Administrador]**.
* **RF-11 (Generación Automática):** El *Scheduler* genera las tareas diarias a una hora programada controlando la concurrencia para evitar duplicados. **[Actor: Sistema (Scheduler)]**.
* **RF-12 (Tareas Manuales):** Creación de tareas puntuales no recurrentes para necesidades específicas. **[Actor: Administrador]**.
* **RF-13 (Asignación):** Visualización y asignación de tareas pendientes o huérfanas a cuidadores específicos validando su rol. **[Actor: Administrador]**.
* **RF-14 (Cierre de Tareas):** Marcar tareas de mantenimiento como completadas, registrando fecha y observaciones. **[Actor: Cuidador]**.
* **RF-15 (Transacción de Alimentación):** Ejecución de tareas de alimentación mediante una transacción atómica que descuenta stock del inventario y genera el registro médico a la vez. **[Actor: Cuidador]**.
* **RF-16 (Sugerencia de Dieta):** El sistema sugiere automáticamente la dieta configurada para el animal/hábitat al ejecutar la tarea para prevenir errores. **[Actor: Sistema]**.

### 👥 Gestión de Usuarios y Portal Público

* **RF-17 (Roles):** Registro y control de accesos por roles (Administrador, Veterinario, Cuidador, Visitante). **[Actor: Administrador]**.
* **RF-18 (Autenticación):** Inicio y cierre de sesión seguro basado en tokens. **[Actor: Todos]**.
* **RF-19 (Fichas Públicas):** Acceso a fichas de animales con información educativa y galerías multimedia. **[Actor: Visitantes]**.
* **RF-22 (Página Principal):** Landing page informativa, estática y responsiva de bienvenida. **[Actor: Visitante]**.

### 📊 Reportes y Dashboard

* **RF-20 (Dashboard):** Panel de control con indicadores clave (N° de animales, alertas de inventario, cumplimiento diario). **[Actor: Administrador]**.
* **RF-21 (Exportación):** Exportar listados y reportes a formatos Excel y PDF. **[Actor: Administrador]**.

### 🔒 Seguridad del Sistema

* **RF-23 (Validación):** Validación de credenciales contra la base de datos. **[Actor: Sistema]**.
* **RF-24 (Hashing):** Almacenamiento de contraseñas utilizando algoritmos de hashing seguros. **[Actor: Sistema]**.
* **RF-25 (Recuperación):** Función de "Recuperar Contraseña" mediante el envío de un enlace temporal y único al correo. **[Actor: Sistema]**.
* **RF-26 y RF-27 (Auditoría):** Registro log de todos los intentos de sesión, cambios de clave y bloqueos (consultable por el Admin). **[Actores: Sistema / Administrador]**.
* **RF-28 (2FA):** Segundo factor de autenticación para los usuarios que tengan la función habilitada. **[Actor: Sistema]**.
* **RF-29 (Bloqueo):** Bloqueo automático de cuenta tras alcanzar un número límite de intentos fallidos consecutivos. **[Actor: Sistema]**.

---

## ⚙️ Requerimientos No Funcionales (RNF)

El documento sintetiza 6 requerimientos clave categorizados por su prioridad de negocio:

| ID | Requerimiento | Categoría | Prioridad |
| --- | --- | --- | --- |
| **RNF-01** | Interfaz intuitiva, de fácil uso para todas las edades, con navegación clara y texto legible. | Usabilidad | **ALTA** |
| **RNF-02** | Protección de datos personales y sensibles mediante control de acceso estricto según el rol de usuario. | Seguridad / Privacidad | **ALTA** |
| **RNF-03** | Almacenamiento y recuperación eficiente de registros, manteniendo tiempos de respuesta adecuados. | Fiabilidad / Rendimiento | **MEDIA** |
| **RNF-04** | Aplicación modular con documentación mínima para facilitar el mantenimiento técnico y escalabilidad futura. | Mantenibilidad | **ALTA** |
| **RNF-05** | Interfaz web *responsive* y multiplataforma compatible con dispositivos móviles y de escritorio. | Compatibilidad | **ALTA** |
| **RNF-06** | Definición de políticas de privacidad y retención de datos (protección de usuarios y datos sensibles de especies). | Privacidad / Cumplimiento | **ALTA** |