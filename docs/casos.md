## 👥 MÓDULO 1: GESTIÓN DE USUARIOS (Casos de Prueba 1 - 15)

Caso de Prueba 1: Verificar que un usuario puede registrarse correctamente con datos válidos 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Acceso a la aplicación Zoo Connect Web, no tener una cuenta registrada con el correo a utilizar y conexión a internet estable.


* **Pasos y Resultados:**
1. Navegar a la página de inicio y hacer clic en 'Registrarse' ubicado en el header. *Resultado:* Se muestra el formulario de registro con campos de Usuario (nombre), email, contraseña y confirmación de contraseña.


2. Completar todos los campos con datos válidos: nombre de usuario, correo válido y contraseña segura. *Resultado:* Los campos aceptan la información sin errores de validación.


3. Hacer clic en el botón 'Crear cuenta'. *Resultado:* El sistema procesa el registro y muestra un mensaje de confirmación de cuenta creada.


4. Verificar que el sistema redirige al usuario a la pantalla de inicio de sesión. *Resultado:* El usuario es redirigido correctamente y puede acceder con las credenciales registradas.





Caso de Prueba 2: Verificar que el sistema impide el registro con un correo ya existente 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Acceso a la aplicación Zoo Connect Web, existir una cuenta registrada con el correo de prueba y conexión a internet estable.


* **Pasos y Resultados:**
1. Navegar al formulario de registro de la aplicación. *Resultado:* Se muestra el formulario de registro.


2. Ingresar un correo electrónico que ya esté registrado en el sistema junto con los demás datos requeridos. *Resultado:* El campo de correo acepta el valor ingresado.


3. Hacer clic en 'Registrar'. *Resultado:* El sistema muestra un mensaje de error indicando que el correo ya está en uso y no crea la cuenta duplicada.





Caso de Prueba 3: Verificar que un usuario puede iniciar sesión con credenciales correctas 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Tener una cuenta activa en Zoo Connect Web y conexión a internet estable.


* **Pasos y Resultados:**
1. Navegar a la página de inicio de sesión de la aplicación. *Resultado:* Se muestra el formulario de inicio de sesión con campos de correo y contraseña.


2. Ingresar el correo y contraseña correctos de la cuenta activa. *Resultado:* Los campos aceptan los datos ingresados.


3. Hacer clic en el botón 'Iniciar sesión'. *Resultado:* El sistema autentica al usuario, lo redirige a la Landing Page y los botones de acceso/registro son reemplazados por el icono de perfil.


4. Hacer clic en el icono de perfil ubicado en la barra de navegación. *Resultado:* Se despliega un menú o panel donde es visible el nombre de usuario, su rol asignado y las opciones de configuración de cuenta.





Caso de Prueba 4: Verificar que el sistema rechaza el inicio de sesión con contraseña incorrecta 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Tener una cuenta activa en Zoo Connect Web y conexión a internet estable.


* **Pasos y Resultados:**
1. Navegar a la página de inicio de sesión. *Resultado:* Se muestra el formulario de inicio de sesión.


2. Ingresar el correo correcto y una contraseña incorrecta. *Resultado:* Los campos aceptan los datos ingresados.


3. Hacer clic en 'Iniciar sesión'. *Resultado:* El sistema muestra un mensaje de error indicando "Email o contraseña incorrectos" y no permite el acceso.





Caso de Prueba 5: Verificar que un Administrador puede crear un nuevo usuario con rol Veterinario 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Estar autenticado como Administrador, tener acceso al módulo de gestión de usuarios y conexión a internet estable.


* **Pasos y Resultados:**
1. Iniciar sesión como administrador con el usuario `admin@zooconnect.com`. *Resultado:* Acceso exitoso y redirección a la página de inicio.


2. Hacer clic en el icono de perfil en la barra de navegación y presionar la opción de "Panel de Administración". *Resultado:* Se redirige a la pantalla de Dashboard administrativo.


3. Presionar el botón "Nuevo Usuario" ubicado en el header del panel de control. *Resultado:* Redirección a la pantalla de lista de usuarios.


4. Completar los datos: nombre de usuario, email y asignar el rol 'Veterinario'. *Resultado:* El formulario acepta los datos y el rol queda seleccionado.


5. Guardar el nuevo usuario. *Resultado:* El sistema crea el usuario y lo muestra en la lista con el rol 'Veterinario' asignado.





Caso de Prueba 6: Verificar que un Administrador puede editar el rol de un usuario existente 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Estar autenticado como Administrador, existir al menos un usuario con rol Cuidador en el sistema y conexión a internet estable.


* **Pasos y Resultados:**
1. Iniciar sesión como administrador con el usuario `admin@zooconnect.com`. *Resultado:* Acceso exitoso y redirección a la página de inicio.


2. Hacer clic en el icono de perfil en la barra de navegación y presionar la opción de "Panel de Administración". *Resultado:* Se redirige a la pantalla de Dashboard admin.


3. Navegar a la sección 'Gestión de Usuarios' desde el panel administrativo. *Resultado:* Se muestra la lista de usuarios activos.


4. Seleccionar un usuario y hacer clic en el botón de edición (icono de un lápiz azul). *Resultado:* Se abre el formulario de edición con sus datos actuales.


5. Cambiar el rol de 'Cuidador' a 'Veterinario' y guardar los cambios. *Resultado:* El sistema actualiza el rol del usuario y muestra el cambio reflejado en la lista.





Caso de Prueba 7: Verificar que el sistema bloquea una cuenta tras múltiples intentos fallidos de inicio de sesión 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Tener una cuenta activa en Zoo Connect Web, conocer el correo electrónico de la cuenta y conexión a internet estable.


* **Pasos y Resultados:**
1. Navegar al formulario de inicio de sesión. *Resultado:* Se muestra el formulario de autenticación.


2. Ingresar el correo correcto y una contraseña incorrecta, repitiendo el intento fallido 10 veces. *Resultado:* Cada intento fallido muestra el mensaje de error de credenciales inválidas.


3. Intentar iniciar sesión una vez más con la contraseña correcta. *Resultado:* El sistema bloquea la cuenta y muestra un mensaje indicando que la cuenta está bloqueada por exceso de intentos fallidos.





Caso de Prueba 8: Verificar la funcionalidad de recuperación de contraseña mediante correo electrónico 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Tener una cuenta activa con correo electrónico válido y accesible, junto a una conexión a internet estable.


* **Pasos y Resultados:**
1. En la pantalla de inicio de sesión, hacer clic en '¿Olvidaste tu contraseña?'. *Resultado:* Se muestra el formulario de recuperación solicitando el correo electrónico.


2. Ingresar el correo electrónico registrado y confirmar. *Resultado:* El sistema envía un correo con el enlace de restablecimiento y muestra un mensaje de confirmación.


3. Abrir el correo recibido y hacer clic en el enlace de recuperación. *Resultado:* El enlace redirige a un formulario para ingresar una nueva contraseña.


4. Ingresar y confirmar la nueva contraseña, y presionar el botón 'Restablecer contraseña'. *Resultado:* La contraseña es actualizada exitosamente y el usuario puede iniciar sesión con la nueva contraseña.





Caso de Prueba 9: Verificar que un usuario Visitante solo tiene acceso al Portal Público 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Tener una cuenta con rol Visitante activa y conexión a internet estable.


* **Pasos y Resultados:**
1. Iniciar sesión con una cuenta de visitante. *Resultado:* El sistema autentica al usuario y lo lleva al portal del visitante.


2. Intentar acceder directamente mediante URL a módulos administrativos (`/admin`). *Resultado:* El sistema deniega el acceso, redirige al portal del visitante o muestra un mensaje de acceso no autorizado.


3. Navegar por las secciones disponibles en el portal del visitante. *Resultado:* Solo son visibles las fichas públicas de animales y el contenido educativo; los módulos de gestión interna no están accesibles.





Caso de Prueba 10: Verificar que un usuario puede cerrar sesión correctamente 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Estar autenticado en la aplicación con cualquier rol y conexión a internet estable.


* **Pasos y Resultados:**
1. Desde cualquier pantalla de la aplicación, hacer clic en el menú de usuario o ícono de perfil. *Resultado:* Se muestra el menú contextual del usuario con la opción 'Cerrar sesión'.


2. Hacer clic en 'Cerrar sesión'. *Resultado:* El sistema cierra la sesión activa y redirige al usuario a la pantalla de inicio de sesión.


3. Intentar navegar hacia atrás o acceder a páginas protegidas. *Resultado:* El sistema no permite el acceso y mantiene cerrada la sesión.





Caso de Prueba 11: Verificar la habilitación exitosa de Autenticación de Dos Factores (2FA) 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Tener acceso de administrador al sistema y estar autenticado, tener instalada la app Google Authenticator y haber creado al menos un usuario con contraseña conocida.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil y seleccionar 'Configuración'. *Resultado:* Se muestra la sección de configuración de la cuenta.


2. En la barra de navegación lateral seleccionar la opción 'Seguridad'. *Resultado:* Se muestra la sección de seguridad de la cuenta con la opción "Configurar 2FA".


3. Presionar el botón para habilitar 2FA. *Resultado:* El sistema genera un código QR y una clave secreta de respaldo en pantalla.


4. Escanear el código QR con la aplicación Google Authenticator e ingresar el código de 6 dígitos generado. *Resultado:* El sistema valida el código.


5. Confirmar la activación. *Resultado:* El sistema muestra un mensaje de éxito, códigos de respaldo de un solo uso y el estado cambia a "Habilitado" en el perfil.





Caso de Prueba 12: Verificar que el sistema registra intentos fallidos de inicio de sesión en el log de auditoría 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Estar autenticado como Administrador y tener acceso al módulo de auditoría o log de seguridad.


* **Pasos y Resultados:**
1. Desde otra sesión, realizar 3 intentos fallidos de inicio de sesión con un correo conocido. *Resultado:* Cada intento falla y muestra el mensaje de error correspondiente.


2. Hacer clic en el icono de perfil ubicado en la barra de navegación y presionar la opción de "Panel de Administración". *Resultado:* Se redirige a la pantalla de Dashboard admin.


3. Hacer clic en el botón de menú desplegable situado a la derecha del nombre de usuario y seleccionar la opción 'Auditoría'. *Resultado:* Se muestra el log de auditoría con los eventos registrados.


4. Buscar los eventos de inicio de sesión fallido del correo utilizado. *Resultado:* El log muestra los intentos fallidos registrados con fecha, hora y correo de la cuenta afectada.





Caso de Prueba 13: Verificar que el Administrador puede desactivar o dar de baja un usuario 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir un usuario activo que no sea el Administrador actual.


* **Pasos y Resultados:**
1. Iniciar sesión como administrador con el usuario `admin@zooconnect.com`. *Resultado:* Acceso exitoso y redirección a la página de inicio.


2. Hacer clic en el icono de perfil en la barra de navegación y presionar la opción de "Panel de Administración". *Resultado:* Se redirige a la pantalla de Dashboard admin.


3. Navegar a la sección 'Gestión de Usuarios' desde el panel administrativo. *Resultado:* Se muestra la lista de usuarios activos.


4. Seleccionar un usuario activo y elegir la opción 'Desactivar usuario' (icono de papelera roja). *Resultado:* El usuario queda marcado como inactivo, ya no puede iniciar sesión y se muestra un mensaje de éxito.





Caso de Prueba 14: Verificar que el sistema solicita 2FA cuando está habilitado para el usuario 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Tener una cuenta con 2FA habilitada, acceso al dispositivo/correo configurado, la app móvil Google Authenticator enlazada y conexión a internet estable.


* **Pasos y Resultados:**
1. Navegar al formulario de inicio de sesión e ingresar correo y contraseña correctos. *Resultado:* El sistema valida las credenciales y solicita el código de segundo factor.


2. Observar el formulario de 2FA. *Resultado:* Se muestra un campo de entrada para 6 dígitos y un mensaje indicando que se requiere el código de la aplicación.


3. Abrir Google Authenticator en el móvil e ingresar el código de 6 dígitos activo. *Resultado:* El campo acepta solo caracteres numéricos y el código es ingresado.


4. Hacer clic en 'Verificar' o 'Confirmar'. *Resultado:* El sistema valida el token de forma atómica y procesa el inicio de sesión, redirigiendo a la Landing Page.





Caso de Prueba 15: Verificar la integridad de la información y navegación en el Log de Seguridad 

* **Módulo:** Gestión de Usuarios.


* **Pre-Condiciones:** Estar autenticado como Administrador y que haya ocurrido al menos un evento de seguridad (inicio de sesión, cambio de contraseña).


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil y seleccionar 'Panel de Administración'. *Resultado:* El sistema redirige a la pantalla de Dashboard administrativo.


2. (Acción de navegación interna hacia la bitácora) . *Resultado:* Se muestra la lista de registros de seguridad con el historial de eventos.


3. Revisar los detalles de un evento específico, desplazarse al final de la lista y utilizar los controles de paginación. *Resultado:* Se muestra la información detallada (fecha, hora, usuario, acción y resultado) y el sistema permite cambiar de página de forma fluida para consultar registros antiguos manteniendo el formato.





---

🐾 MÓDULO 2: GESTIÓN DE ANIMALES (Casos de Prueba 16 - 30) 

Caso de Prueba 16: Verificar que el sistema registra y gestiona hábitats 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador y tener acceso al módulo de hábitats.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Hacer clic en 'Añadir Hábitat' y completar los datos: nombre, tipo, descripción y condiciones climáticas. *Resultado:* El formulario acepta los datos sin errores.


4. Guardar el nuevo hábitat. *Resultado:* El hábitat queda registrado y aparece en la lista disponible para asignación de tareas y animales.





Caso de Prueba 17: Verificar que el sistema registra y gestiona especies 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado con rol Administrador y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Hacer clic en 'Añadir Especie' y completar los datos: Nombre Científico, Nombre Común, Filo, Clase, Orden, Familia y Descripción. *Resultado:* El formulario acepta los datos sin errores.


4. Guardar la nueva Especie. *Resultado:* La especie queda registrada y aparece en la lista disponible.





Caso de Prueba 18: Verificar que el Administrador puede registrar un nuevo animal con datos completos 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador, existir al menos un hábitat y una especie creados previamente, y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Hacer clic en "Registrar Animal". *Resultado:* Se abre el formulario de registro de animales.


4. Completar todos los campos requeridos: nombre, especie, fecha de nacimiento, estado de salud y hábitat asignado. *Resultado:* El formulario acepta todos los datos sin errores de validación.


5. Seleccionar imágenes del animal para la demostración. *Resultado:* Mensaje de confirmación de imágenes subidas.


6. Hacer clic en Finalizar. *Resultado:* El animal es registrado exitosamente y aparece en la lista del sistema.





Caso de Prueba 19: Verificar que el sistema permite editar los datos biográficos de un animal existente 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir un animal registrado junto con un hábitat de destino diferente.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Seleccionar un animal y hacer clic en el botón de edición (icono de un lápiz azul). *Resultado:* Se habilita el formulario de edición con los datos actuales del animal.


4. Modificar el nombre y el estado de salud del animal y guardar. *Resultado:* El sistema actualiza los datos y muestra el perfil con la información editada.





Caso de Prueba 20: Verificar que se puede dar de baja lógica a un animal del sistema 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir un animal activo en el sistema.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Hacer clic en 'Eliminar' (identificado como una papelera roja). *Resultado:* El sistema procesa la solicitud.


4. Confirmar la operación. *Resultado:* Aparece un mensaje de confirmación; el animal queda marcado como inactivo y ya no aparece en las listas activas.





Caso de Prueba 21: Verificar que se puede adjuntar una foto al perfil de un animal 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador o Cuidador, existir un animal registrado sin foto y tener una imagen válida (JPG/PNG) disponible.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Elegir un animal y hacer clic en la opción editar (icono de lápiz azul). *Resultado:* Se abre el perfil completo del animal disponible para edición.


4. Hacer clic en el paso 2 del formulario marcado como 'Subir imágenes'. *Resultado:* Se abre el selector de archivos disponible para arrastrar o seleccionar imágenes.


5. Seleccionar una imagen válida desde el dispositivo. *Resultado:* La imagen se previsualiza en el perfil del animal.


6. Confirmar y guardar la imagen. *Resultado:* La foto queda guardada en el perfil y es visible en la ficha del animal.





Caso de Prueba 22: Verificar que el sistema valida campos obligatorios al registrar un animal 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador o Veterinario y tener acceso al formulario de registro de animales.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Hacer clic en 'Registrar Animal'. *Resultado:* Se abre el formulario de registro de animales.


4. Dejar vacíos los campos obligatorios y presionar el botón 'Finalizar'. *Resultado:* El sistema muestra mensajes de validación indicando los campos requeridos y no envía el formulario.


5. Completar solo el campo nombre y volver a presionar el botón 'Finalizar'. *Resultado:* El sistema continúa mostrando la validación por los campos aún vacíos.





Caso de Prueba 23: Verificar que se puede editar el hábitat de un animal 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir al menos un hábitat registrado en el sistema.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Hacer clic en 'Lista Hábitats'. *Resultado:* Se despliega la lista de hábitats registrados en el sistema.


4. Elegir un registro y hacer clic en 'Editar' (botón representado por un lápiz de color azul). *Resultado:* Se muestra el formulario de edición de hábitats.


5. Seleccionar un hábitat de la lista y guardar. *Resultado:* El animal queda asignado al hábitat seleccionado y la información se actualiza en su perfil.





Caso de Prueba 24: Verificar que el sistema muestra la lista de animales paginada cuando hay muchos registros 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado con rol Administrador y que existan más de 10 animales registrados en el sistema.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados en el sistema.


3. Navegar a la siguiente página o hacer scroll para cargar más registros. *Resultado:* Se cargan los siguientes animales de forma correcta sin duplicados.





Caso de Prueba 25: Verificar que la foto de un animal se puede actualizar por una nueva imagen 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador o Cuidador y existir un animal con foto registrada.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Navegar al perfil de un animal que ya tenga foto. *Resultado:* Se muestra el perfil del animal.


4. Elegir un animal y hacer clic en la opción editar (icono de lápiz azul). *Resultado:* Se abre el formulario de editar datos de un animal.


5. Hacer clic en el paso 2 del formulario marcado como 'Subir imágenes'. *Resultado:* Se abre el selector de archivos disponible para arrastrar o seleccionar imágenes.


6. Seleccionar las imágenes ya cargadas y eliminarlas. *Resultado:* Se muestra mensaje de confirmación de la eliminación.


7. Seleccionar una imagen válida desde el dispositivo y agregarla. *Resultado:* La imagen se previsualiza en el perfil del animal.


8. Confirmar y guardar la imagen. *Resultado:* La foto queda guardada en el perfil y es visible en la ficha del animal.





Caso de Prueba 26: Verificar que el módulo de animales es accesible solo por roles autorizados 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Tener credenciales válidas para roles Visitante y Cuidador, y conexión a internet estable.


* **Pasos y Resultados:**
1. Iniciar sesión como Visitante e intentar acceder al módulo de Gestión de Animales mediante URL directa (`/admin/animales`). *Resultado:* El sistema deniega el acceso y muestra un mensaje de no autorizado o redirige al portal público.


2. Iniciar sesión como Cuidador e intentar acceder al módulo de Gestión de Animales. *Resultado:* El Cuidador no puede ver animales, crear ni eliminar; solo las acciones permitidas por su rol.





Caso de Prueba 27: Verificar que el sistema permite editar la información de un Hábitat existente 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador, existir al menos un hábitat en la lista y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. Hacer clic en 'Lista Hábitats'. *Resultado:* Se despliega la lista de hábitats registrados en el sistema.


4. Pulsar el icono de lápiz azul en un registro existente. *Resultado:* Se abre el formulario de edición con los datos actuales del hábitat.


5. Modificar la 'Descripción' o las 'Condiciones Climáticas' y guardar. *Resultado:* El sistema actualiza la información y muestra el cambio reflejado en la lista.





Caso de Prueba 28: Verificar que el sistema permite editar los datos de una Especie registrada 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir al menos una especie en la lista.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados en el sistema.


3. Hacer clic en 'Lista Especies'. *Resultado:* Se despliega la lista de especies registradas en el sistema.


4. Pulsar el icono de lápiz azul en un registro existente. *Resultado:* Se abre el formulario de edición con los datos actuales de la especie.


5. Realizar un cambio en la 'Descripción' o 'Familia' y presionar 'Guardar'. *Resultado:* La especie se actualiza correctamente sin afectar a los animales ya vinculados a ella.





Caso de Prueba 29: Verificar la integridad de visualización de la Ficha Técnica del Animal 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. En la lista de animales elegir un registro y hacer clic en el botón Ver Detalles (icono de un ojo). *Resultado:* El sistema abre la vista detallada o "Ficha Técnica" del animal.





Caso de Prueba 30: Verificar la restricción lógica de fechas 

* **Módulo:** Gestión de Animales.


* **Pre-Condiciones:** Estar autenticado como Administrador y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Animales'. *Resultado:* Se muestra la lista de animales registrados.


3. En el campo 'Fecha de Nacimiento', seleccionar o escribir una fecha posterior al día de hoy, año 2030. *Resultado:* El sistema bloquea la selección en el calendario o, al intentar guardar, muestra un mensaje de error.


4. Presionar el botón 'Finalizar'. *Resultado:* El sistema impide la creación del registro, protegiendo la veracidad histórica de la base de datos.





---

🩺 MÓDULO 3: GESTIÓN CLÍNICA (Casos de Prueba 31 - 45) 

Caso de Prueba 31: Verificar la creación de una nueva categoría de 'Tipo de Atención' 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el menú desplegable a la derecha de la foto de perfil y seleccionar 'Tipos de Atención'. *Resultado:* Se visualiza la lista de categorías clínicas configuradas actualmente.


3. Ingresar el nombre del tipo de atención "Tratamiento Ortopédico" y una descripción breve. *Resultado:* El formulario acepta los caracteres ingresados sin errores de validación.


4. Presionar el botón 'Guardar'. *Resultado:* El sistema registra la categoría y vuelve a la lista, donde el nuevo tipo ya es visible.





Caso de Prueba 32: Verificar que el Veterinario puede registrar una consulta clínica 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario, existir al menos un animal activo en el sistema y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos por animal registrados en el sistema.


3. Hacer clic en 'Nuevo Historial'. *Resultado:* Se abre el formulario con los campos: Paciente, Motivo, Constantes Vitales (Peso, Temp, Frecuencias), Anamnesis y Diagnóstico.


4. Seleccionar un Paciente (Animal) y un Motivo de Consulta (Tipo de atención). *Resultado:* El sistema vincula el registro al animal seleccionado.


5. Completar los datos fisiológicos (Peso, Temperatura, FC, FR) y los campos de texto (Anamnesis, Diagnóstico Presuntivo). *Resultado:* El formulario valida que los campos obligatorios (*) estén completos.


6. Presionar el botón 'Guardar Historial'. *Resultado:* El registro se almacena y el sistema vuelve a la lista general de historiales.





Caso de Prueba 33: Verificar la creación de una receta con generación de tareas automáticas 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario, existir un animal activo, un historial clínico abierto y stock disponible en inventario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos por animal registrados.


3. Acceder al historial clínico de un animal. *Resultado:* Se muestra el historial con los registros previos.


4. Seleccionar 'Agregar Medicamento'. *Resultado:* Se abre el formulario de registro de tratamiento con campos de nombre de la vacuna, dosis, fecha de aplicación y próxima dosis.


5. Ingresar la Dosis, Unidad, Indicación (ej: Con comida) y Duración del tratamiento. *Resultado:* El formulario acepta los valores numéricos y de texto.


6. Activar el interruptor "Programar Recordatorios". *Resultado:* Se habilitan las opciones de "Patrón de Repetición" y "Hora de ejecución".


7. Seleccionar un patrón (ej: Diariamente) y definir la hora (ej: 08:00). *Resultado:* El sistema muestra la nota aclaratoria: "Tarea todos los días a las 08:00 a. m.".


8. Presionar el botón 'Guardar'. *Resultado:* La receta se registra y el sistema genera automáticamente las tareas en la agenda del veterinario.





Caso de Prueba 34: Verificar la consulta y orden cronológico del historial clínico 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario y que exista un animal con múltiples registros clínicos en el sistema.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos por animal registrados en el sistema.


3. Buscar un animal específico y acceder a su historial. *Resultado:* Se muestra la lista de eventos ordenados del más reciente al más antiguo.


4. Hacer clic en un registro clínico específico. *Resultado:* Se despliega el detalle completo del evento clínico incluyendo diagnóstico, tratamiento aplicado y notas del veterinario.





Caso de Prueba 35: Verificar la emisión de una Orden de Examen Clínico 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos por animal registrados en el sistema.


3. Dentro del historial de un animal, seleccionar la opción 'Órdenes de Examen'. *Resultado:* Se muestra la pestaña con la lista de exámenes programados o solicitados.


4. Completar el tipo de examen (ej. Sangre) e instrucciones detalladas. Presionar 'Guardar Orden'. *Resultado:* La orden se genera en estado "Solicitado" y queda vinculada al expediente médico.





Caso de Prueba 36: Verificar la carga de resultados de laboratorio con evidencia física 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario y existir una orden en estado "Solicitado".


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos.


3. Dentro del historial de un animal, seleccionar la opción 'Órdenes de Examen'. *Resultado:* Se muestra la pestaña con la lista de exámenes programados o solicitados.


4. Seleccionar la orden pendiente y hacer clic en 'Subir Resultado'. *Resultado:* Se abre la ventana modal con el formulario para cargar resultados.


5. Subir un archivo de evidencia (Imagen/PDF) y redactar las conclusiones. Guardar el registro. *Resultado:* El estado cambia a "Completado" y se visualiza el enlace al archivo cargado.





Caso de Prueba 37: Verificar la programación de un Procedimiento Médico 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos por animal registrados en el sistema.


3. Dentro del historial de un animal, seleccionar la opción 'Procedimientos'. *Resultado:* Se muestra la pestaña con la lista de exámenes programados o solicitados.


4. Hacer clic en 'Agendar Procedimiento'. *Resultado:* Se abre la ventana modal con el formulario para programar procedimientos.


5. Completar nombre del procedimiento, descripción y programar fecha y hora. Presionar 'Agendar'. *Resultado:* La intervención se registra y aparece en la agenda de tareas pendientes del veterinario.





Caso de Prueba 38: Verificar la configuración de un plan de alimentación por especie 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario y existir productos en el inventario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Gestión de Dietas'. *Resultado:* Se muestra la lista de dietas por animal registrados en el sistema.


3. Hacer clic en 'Nueva Dieta' y seleccionar el tipo 'Por Especie'. *Resultado:* Se redirige a la página del formulario.


4. Seleccionar la especie y agregar productos con cantidades y unidades de medida. Presionar 'Guardar Dieta'. *Resultado:* El plan de alimentación queda asociado a todos los individuos de la especie.





Caso de Prueba 39: Verificar la creación de una dieta personalizada para un animal 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Gestión de Dietas'. *Resultado:* Se muestra la lista de dietas por animal registrados en el sistema.


3. Hacer clic en 'Nueva Dieta' y seleccionar el tipo 'Por Animal'. Seleccionar el animal, definir productos, frecuencia y guardar. *Resultado:* Se redirige a la página del formulario. La dieta personalizada se guarda con éxito y tiene prioridad sobre la de especie.





Caso de Prueba 40: Verificar que el sistema sugiere la dieta en las tareas de alimentación 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Cuidador y tener una tarea de alimentación generada.


* **Pasos y Resultados:**
1. Iniciar sesión como Cuidador. Hacer clic en el icono de perfil en el header y seleccionar la opción "Panel Cuidador". *Resultado:* Se muestran las tareas pendientes para el día.


2. Abrir una tarea de alimentación pendiente para un animal con dieta. *Resultado:* El sistema muestra automáticamente los productos y dosis configurados en el plan nutricional.





Caso de Prueba 41: Verificar el bloqueo de dosificación inválida 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos por animal registrados en el sistema.


3. Acceder al historial clínico de un animal. *Resultado:* Se muestra el historial con los registros previos.


4. Seleccionar 'Agregar Medicamento'. *Resultado:* Se abre el formulario de registro de tratamiento con campos de nombre de la vacuna, dosis, fecha de aplicación y próxima dosis.


5. Ingresar la Unidad, Indicación, Duración del tratamiento e ingresar el valor `0` o `-1` en el campo Dosis. *Resultado:* El formulario no acepta los valores numéricos y de texto; se muestra el campo Dosis de color rojo.


6. Intentar guardar la prescripción. *Resultado:* El sistema impide el guardado y muestra un mensaje de error indicando que la dosis debe ser positiva.





Caso de Prueba 42: Verificar restricción de acceso del Cuidador al Historial Clínico 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Cuidador.


* **Pasos y Resultados:**
1. Iniciar sesión como Cuidador e intentar acceder a la ruta de historiales o al módulo clínico (`/vet`). *Resultado:* Se redirige a la página principal.


2. Navegar al perfil de un animal. *Resultado:* El sistema no muestra la pestaña de historial clínico o deniega el acceso, protegiendo la confidencialidad médica.





Caso de Prueba 43 y 44: Verificar la denegación de acceso al Panel Veterinario para Visitantes 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Visitante.


* **Pasos y Resultados:**
1. Intentar acceder a la opción "Panel Veterinario" desde el icono de perfil. *Resultado:* No se muestra la opción en el menú.


2. Intentar ingresar manualmente a la ruta `/vet/`. *Resultado:* El sistema redirige al inicio.





(Nota del documento: El Caso de Prueba 44 se encuentra fusionado u omite texto directo en la estructura nativa del PDF, pasando a detallar la ejecución automática de eventos clínicos en la sección inferior bajo el mismo bloque regulador).

Caso de Prueba de Ejecución de Alimentación: Verificar que la ejecución de alimentación registra un evento médico automático 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Tener cuentas activas con rol Cuidador y que el cuidador tenga una tarea de alimentación pendiente.


* **Pasos y Resultados:**
1. Iniciar sesión como Cuidador. Hacer clic en el icono de perfil en el header y seleccionar la opción "Panel Cuidador". *Resultado:* Se muestran las tareas pendientes para el día.


2. Ejecutar una tarea de alimentación sugerida por el sistema. *Resultado:* La tarea se muestra como completada.


3. Como Administrador, hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


4. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Tareas'. *Resultado:* Se muestra la lista de tareas completadas y aparece un nuevo registro de alimentación con fecha y cantidades descontadas de inventario.





Caso de Prueba 45: Verificar el cierre del ciclo clínico 

* **Módulo:** Gestión Clínica.


* **Pre-Condiciones:** Estar autenticado como Veterinario e historial clínico en estado "Abierto".


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel Veterinario". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha de la foto de perfil de usuario y seleccionar 'Historiales Clínicos'. *Resultado:* Se muestra la lista de historiales clínicos por animal registrados en el sistema.


3. Dentro del historial de un animal, seleccionar la opción 'Finalizar'. *Resultado:* El registro cambia a estado "Finalizado", se bloquean ediciones y el animal se marca como dado de alta.





---

📦 MÓDULO 4: GESTIÓN DE INVENTARIO (Casos de Prueba 46 - 60) 

Caso de Prueba 46: Verificar que el Administrator puede agregar un nuevo producto al catálogo de inventario 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador, tener acceso al módulo de Gestión de Inventario y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados en el sistema.


3. Hacer clic en 'Nuevo Producto'. *Resultado:* Se abre el formulario con campos: nombre, proveedor, unidad de medida, tipo de salida y punto de reorden.


4. Completar todos los campos y presionar siguiente. *Resultado:* Se muestra una confirmación de información guardada y aparece la pantalla para cargar imágenes.


5. Seleccionar imágenes válidas sobre los productos y subirlas. *Resultado:* El producto queda registrado en el catálogo y disponible para registrar entradas de stock.





Caso de Prueba 47: Verificar el registro de una entrada de abastecimiento con número de lote 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir al menos un producto y un proveedor en el catálogo de inventario.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. En el menú de navegación lateral seleccionar 'Historial de Movimientos'. *Resultado:* El sistema redirige a la página de historial de movimientos.


4. Seleccionar 'Nueva Entrada'. *Resultado:* Se abre el formulario de entrada de abastecimiento.


5. Seleccionar el producto, ingresar la cantidad y especificar la fecha de caducidad del lote. *Resultado:* El formulario acepta los datos con la fecha de caducidad.


6. Guardar la entrada. *Resultado:* El sistema genera un lote de inventario identificado por fecha de caducidad y actualiza el stock del producto.





Caso de Prueba 48: Verificar la creación de un nuevo 'Tipo de Producto' 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. En el menú de navegación lateral seleccionar 'Lista de tipos'. *Resultado:* El sistema redirige a la lista de tipos de productos registrados.


4. Hacer clic en 'Nuevo Tipo' e ingresar una categoría (ej: "Suplementos Médicos"). *Resultado:* Se muestra el formulario para agregar nuevos tipos de producto.


5. Presionar 'Guardar'. *Resultado:* La nueva categoría aparece en la lista y queda disponible en el formulario de creación de productos.





Caso de Prueba 49: Verificar que el sistema genera alertas automáticas para productos con stock bajo el punto de reorden 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir un producto con punto de reorden configurado y stock por debajo de ese punto.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados en el sistema.


3. Hacer clic en el botón 'Alertas'. *Resultado:* Se muestran solo los registros de productos con alerta de stock.





Caso de Prueba 50: Verificar que el Administrador puede editar los datos de un producto del catálogo 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir al menos un producto en el catálogo.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados en el sistema.


3. Seleccionar un producto y hacer clic en 'Editar' (botón con icono de lápiz azul). *Resultado:* Se abre el formulario de edición con los datos actuales del producto.


4. Modificar el punto de reorden y guardar. *Resultado:* El sistema actualiza el punto de reorden del producto y lo refleja en el catálogo.





Caso de Prueba 51: Verificar que se puede consultar el historial de movimientos de un producto 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir un producto con entradas y salidas registradas.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. En el menú de navegación lateral seleccionar 'Historial de movimientos'. *Resultado:* El sistema redirige al historial de movimientos por producto en el sistema.


4. Acceder al historial de movimientos del producto. *Resultado:* Se muestra la lista de entradas y salidas registradas con fecha, cantidad y tipo de movimiento.





Caso de Prueba 52: Verificar que el sistema impide registrar una salida mayor al stock disponible 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir un producto con cantidad limitada en stock.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. En el menú de navegación lateral seleccionar 'Historial de movimientos'. *Resultado:* El sistema redirige al historial de movimientos.


4. Navegar a 'Nueva Salida' en el módulo de Inventario. *Resultado:* Se muestra el formulario de salida.


5. Seleccionar un producto e ingresar una cantidad mayor al stock disponible. *Resultado:* El formulario acepta inicialmente el valor.


6. Intentar confirmar la salida. *Resultado:* El sistema muestra un mensaje de error indicando que no hay stock suficiente y no procesa la salida.





Caso de Prueba 53: Verificar que se puede agregar un proveedor al catálogo maestro 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y tener acceso al módulo de proveedores en el catálogo.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. En el menú de navegación lateral seleccionar 'Lista de Proveedores'. *Resultado:* El sistema muestra la lista de proveedores registrados en el sistema.


4. Hacer clic en 'Nuevo Proveedor' y completar los datos: nombre, contacto y correo electrónico. *Resultado:* El formulario acepta los datos sin errores de validación.


5. Guardar el proveedor. *Resultado:* El proveedor queda registrado en el catálogo y disponible para asociar a productos.





Caso de Prueba 54: Verificar la creación de una nueva Unidad de Medida 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. En el menú de navegación lateral seleccionar 'Lista de Unidades'. *Resultado:* Se visualiza la lista de unidades configuradas.


4. Hacer clic en 'Nueva Unidad' y completar: Nombre Completo y Símbolo/Abreviatura. Presionar el botón 'Guardar'. *Resultado:* La unidad queda registrada y habilitada para su uso en el catálogo.





Caso de Prueba 55: Verificar que el sistema genera un reporte de productos con bajo stock 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir al menos un producto con stock bajo el punto de reorden.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. Seleccionar 'Generar Reporte'. *Resultado:* El sistema genera y muestra el reporte de productos con stock por debajo del punto de reorden.


4. Verificar que el reporte incluye nombre del producto, stock actual y punto de reorden. *Resultado:* Cada producto en el reporte muestra la información requerida para tomar decisiones de reabastecimiento.





Caso de Prueba 56: Verificar que el stock se actualiza correctamente tras registrar una entrada de abastecimiento 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y conocer el stock actual de un producto específico.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. Anotar el stock actual de un producto antes del registro de entrada. *Resultado:* Se tiene el valor de stock previo a la entrada.


4. Registrar una entrada de 50 unidades del producto con fecha de caducidad futura. *Resultado:* La entrada es registrada exitosamente.


5. Verificar el nuevo stock del producto en el catálogo. *Resultado:* El stock del producto se incrementó en 50 unidades respecto al valor inicial.





Caso de Prueba 57: Verificar que se puede configurar la unidad de medida de un producto 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y tener acceso al catálogo maestro de productos.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. En el menú de navegación lateral seleccionar la opción Lista de unidades y seleccionar Crear unidad. *Resultado:* Se muestra el formulario de creación de unidades.


4. Seleccionar o ingresar la unidad de medida deseada (ej. kg, litros, unidades). *Resultado:* La unidad de medida queda configurada para el producto.


5. Guardar el producto y verificar que la unidad de medida aparece en las entradas y salidas. *Resultado:* La unidad de medida es visible en los registros de movimiento del producto.





Caso de Prueba 58: Verificar que la transacción de tarea de alimentación descuenta el inventario automáticamente 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Cuidador y Administrador, existir una tarea de alimentación pendiente con dieta configurada y haber stock disponible de los productos de la dieta.


* **Pasos y Resultados:**
1. Como administrador, hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos.


3. Anotar el stock actual de los productos de la dieta del animal. *Resultado:* Se tienen los valores de stock previos a la tarea.


4. Iniciar sesión como Cuidador, clic en la imagen de perfil en el header, seleccionar la opción de Panel de Cuidador. *Resultado:* Se muestra la pantalla de tareas asignadas al cuidador.


5. Ejecutar la tarea de alimentación desde el módulo de Gestión de Tareas. *Resultado:* La tarea es ejecutada y marcada como completada.


6. Verificar el stock de los productos de la dieta en el módulo de Inventario. *Resultado:* El stock de cada producto disminuyó en la cantidad correcta según la dieta configurada, de forma atómica.





Caso de Prueba 59: Verificar la restricción de nombres duplicados en el catálogo de productos 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y que exista un producto registrado con el nombre "Alimento Felino Premium".


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos.


3. Hacer clic en el botón 'Nuevo Producto'. *Resultado:* Se abre el formulario de registro de producto.


4. Ingresar el nombre "Alimento Felino Premium" (exactamente igual al existente) y completar los demás campos obligatorios. *Resultado:* El formulario acepta la entrada inicial de datos.


5. Presionar el botón 'Guardar'. *Resultado:* El sistema detecta el duplicado, impide el registro y muestra un mensaje de advertencia indicando que el nombre del producto ya existe.





Caso de Prueba 60: Verificar que el sistema permite eliminar un producto del catálogo que no tiene stock activo 

* **Módulo:** Gestión de Inventario.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir un producto sin stock activo ni lotes vigentes.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


3. Seleccionar un producto sin stock activo y hacer clic en 'Eliminar' (botón con el icono de papelera roja). *Resultado:* El sistema solicita confirmación para la eliminación.


4. Confirmar la eliminación. *Resultado:* El producto es eliminado del catálogo y ya no aparece en la lista ni en los selectores de movimientos.





---

📅 MÓDULO 5: GESTIÓN DE TAREAS / PORTAL DEL VISITANTE (Casos de Prueba 61 - 75) 

Caso de Prueba 61: Verificar que el Administrador puede crear una plantilla de tarea recurrente 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador, tener acceso al módulo de Gestión de Tareas y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Tareas'. *Resultado:* Se muestra la lista de tareas registradas.


3. Navegar al menú lateral y seleccionar 'Planificador de rutinas'. *Resultado:* Se muestra el formulario de creación de plantilla de tarea.


4. Seleccionar 'Nueva Plantilla' y completar: nombre, tipo de tarea, destino (Animal o Hábitat) y la frecuencia de repetición (ej: Diariamente a las 08:00). *Resultado:* El formulario acepta los datos.


5. Guardar la plantilla. *Resultado:* La plantilla queda activa y el sistema procesa internamente la programación para generar tareas futuras.





Caso de Prueba 62: Verificar que el sistema genera tareas diarias automáticamente basadas en las plantillas activas 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador, existir al menos una plantilla activa configurada y esperar a que el scheduler ejecute la generación diaria.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Tareas'. *Resultado:* Se muestra la lista de tareas registradas.


3. Navegar al menú lateral y seleccionar 'Planificador de rutinas'. *Resultado:* Se muestra el formulario de creación de plantilla de tarea.


4. Verificar que existe una plantilla de tarea activa configurada. *Resultado:* La plantilla activa es visible en el módulo de plantillas.


5. Esperar la hora programada de generación o forzar la ejecución del scheduler. *Resultado:* El scheduler se ejecuta a la hora programada.


6. Navegar al módulo de tareas y verificar que se generaron las tareas diarias. *Resultado:* Las tareas se generaron automáticamente basadas en las plantillas activas, sin duplicados.





Caso de Prueba 63: Verificar que el Administrador puede crear una tarea manual puntual y asignarla a un cuidador 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador, existir al menos un usuario con rol Cuidador y conexión a internet estable.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Tareas'. *Resultado:* Se muestra la lista de tareas registradas.


3. Hacer clic en 'Crear Tarea Manual'. *Resultado:* Se abre el formulario de tarea puntual no recurrente.


4. Completar los datos: nombre, tipo de tarea, destino (animal o hábitat), fecha y asignar a un cuidador. *Resultado:* El formulario acepta todos los datos y permite seleccionar el cuidador.


5. Guardar la tarea. *Resultado:* La tarea manual queda creada, asignada al cuidador seleccionado y visible en la lista de tareas pendientes.





Caso de Prueba 64: Verificar que el Administrador puede visualizar y asignar tareas pendientes huérfanas 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador y que existan tareas generadas automáticamente sin cuidador asignado (huérfanas).


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Tareas'. *Resultado:* Se muestra la lista de tareas registradas.


3. Seleccionar una tarea sin asignar y hacer clic en 'Asignar'. *Resultado:* Se muestra el selector de cuidadores disponibles con validación de rol.


4. Seleccionar un cuidador con el rol adecuado y confirmar la asignación. *Resultado:* La tarea queda asignada al cuidador seleccionado y desaparece de la lista de tareas huérfanas.





Caso de Prueba 65: Verificar que el Cuidador puede marcar como completada una tarea de mantenimiento general 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Cuidador y tener al menos una tarea de mantenimiento asignada y pendiente.


* **Pasos y Resultados:**
1. Iniciar sesión como Cuidador y acceder a 'Mis Tareas'. *Resultado:* Se muestra la lista de tareas asignadas al Cuidador.


2. Seleccionar una tarea de mantenimiento pendiente y hacer clic en 'Marcar como completada'. *Resultado:* Se abre un formulario o campo para registrar notas de observación y confirmar la ejecución.


3. Ingresar notas de observación y confirmar la completación. *Resultado:* La tarea queda marcada como completada con la fecha de ejecución y las notas registradas.





Caso de Prueba 66: Verificar que el Cuidador puede ejecutar una tarea de alimentación con descuento atómico de inventario 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Cuidador, tener una tarea de alimentación asignada con dieta configurada y haber stock suficiente de los alimentos de la dieta.


* **Pasos y Resultados:**
1. Seleccionar la tarea de alimentación pendiente desde la lista de tareas del Cuidador. *Resultado:* Se muestra el detalle de la tarea con los alimentos sugeridos por la dieta.


2. Confirmar los productos y cantidades y hacer clic en 'Ejecutar tarea'. *Resultado:* El sistema procesa la transacción atómica de descuento de inventario y generación de registro médico; la tarea está completada.


3. Verificar que la tarea quedó como completada, el inventario fue descontado y el historial clínico tiene el nuevo registro. *Resultado:* (Verificación visual en la UI del cuidador).


4. Como administrador, hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


5. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Inventario'. *Resultado:* Se muestra la lista de productos registrados.


6. Anotar el stock actual de los productos de la dieta del animal y verificar el descuento de inventario. *Resultado:* Se tienen los valores de stock previos a la tarea (comprobando la reducción del inventario).





Caso de Prueba 67: Validación de Unicidad en la Generación de Tareas 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador y que existan plantillas activas de tareas diarias.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable y seleccionar 'Gestión de Tareas'. *Resultado:* Se visualiza la lista de tareas generadas para el día actual.


3. Refrescar la página (F5) o navegar entre módulos y volver a la lista de tareas. *Resultado:* El sistema mantiene la lista íntegra; no aparecen tareas duplicadas para el mismo animal, hábitat o tipo de labor tras el refresco o navegación.





Caso de Prueba 68: Verificar que el Administrador puede editar o desactivar una plantilla de tarea recurrente 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador y existir al menos una plantilla de tarea activa.


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Pulsar el botón de menú desplegable a la derecha del nombre de usuario y seleccionar 'Gestión de Tareas'. *Resultado:* Se muestra la lista de tareas registradas.


3. Navegar al menú lateral y seleccionar 'Planificador de rutinas'. *Resultado:* Se muestra la lista de plantillas de tareas.


4. Seleccionar una plantilla y hacer clic en 'Editar'. *Resultado:* Se abre el formulario de edición con los datos actuales.


5. Modificar la frecuencia de repetición o el horario. *Resultado:* La plantilla es actualizada con la nueva configuración y no generará más tareas si fue desactivada.





Caso de Prueba 69: Verificar que el sistema valida el rol del cuidador al asignar una tarea 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador y que existan usuarios con roles distintos en el sistema.


* **Pasos y Resultados:**
1. Seguir el protocolo de navegación hasta 'Gestión de Tareas' y seleccionar 'Nueva Tarea Manual'. *Resultado:* Se abre el formulario de creación de tarea puntual.


2. En el selector de responsable, elegir a un usuario con rol de Veterinario o Administrador. *Resultado:* El sistema permite la selección del usuario sin restricciones de rol, mostrando su disponibilidad en la lista.


3. Completar los datos de la tarea y presionar 'Guardar'. *Resultado:* La tarea es creada y asignada exitosamente al usuario seleccionado, independientemente de su rol jerárquico.





Caso de Prueba 70: Verificar que las tareas completadas no vuelven a aparecer como pendientes 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Cuidador y haber completado al menos una tarea.


* **Pasos y Resultados:**
1. Navegar a 'Mis Tareas' y completar una tarea pendiente. *Resultado:* La tarea queda marcada como completada.


2. Recargar la página o navegar y volver a la lista de tareas pendientes. *Resultado:* La tarea completada no aparece en la lista de pendientes.


3. Verificar en la sección de tareas completadas o historial que la tarea aparece correctamente. *Resultado:* La tarea está en el historial de completadas con la fecha y notas de ejecución.





Caso de Prueba 71: Verificar que el Administrador puede ver el estado general de cumplimiento de tareas diarias en el Dashboard 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Administrador y que existan tareas generadas para el día actual (algunas completadas y otras pendientes).


* **Pasos y Resultados:**
1. Hacer clic en el icono de perfil en el header y seleccionar "Panel de Administración". *Resultado:* El sistema redirige a la pantalla principal del Dashboard administrativo.


2. Localizar el indicador de cumplimiento de tareas diarias. *Resultado:* Se muestra el porcentaje o número de tareas completadas vs pendientes del día.


3. Verificar que los números son coherentes con el estado real de las tareas. *Resultado:* El indicador refleja con precisión el estado de cumplimiento de las tareas diarias.





Caso de Prueba 72: Verificar que el Cuidador solo puede ver las tareas que le han sido asignadas 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Tener dos cuentas activas con rol Cuidador y que existan tareas asignadas a cada uno de ellos por separado.


* **Pasos y Resultados:**
1. Iniciar sesión con el Cuidador A y navegar a 'Mis Tareas'. *Resultado:* Se muestra la lista de tareas del Cuidador A.


2. Verificar que no aparecen las tareas asignadas al Cuidador B. *Resultado:* La lista solo contiene las tareas asignadas específicamente al Cuidador A.


3. Cerrar sesión e iniciar como Cuidador B. Verificar sus tareas. *Resultado:* El Cuidador B solo ve sus propias tareas, no las del Cuidador A.





Caso de Prueba 73: Verificar que el sistema muestra la tarea fallida si el descuento de inventario no es posible 

* **Módulo:** Gestión de Tareas.


* **Pre-Condiciones:** Estar autenticado como Cuidador y que exista una tarea de alimentación pendiente cuyo producto no tiene stock suficiente.


* **Pasos y Resultados:**
1. Navegar a la tarea de alimentación cuyo inventario tiene stock insuficiente. *Resultado:* Se muestra el detalle de la tarea con la dieta configurada.


2. Intentar ejecutar la tarea de alimentación. *Resultado:* El sistema detecta que no hay stock suficiente para completar la tarea.


3. Verificar que el sistema muestra un mensaje de error y NO descuenta el inventario ni crea el registro médico. *Resultado:* La transacción atómica falla completamente: no se descuenta inventario ni se crea registro clínico, y se muestra el mensaje de error apropiado.





Caso de Prueba 74: Verificar la participación en una Trivia y validación de puntaje 

* **Módulo:** Portal del Visitante.


* **Pre-Condiciones:** Acceso al portal público y que haya una Trivia activa en el sistema.


* **Pasos y Resultados:**
1. Navegar a la sección de 'Quiz' o 'Trivias' desde el menú principal del portal. *Resultado:* Se visualiza la interfaz de configuración del servicio con selectores para dificultad y volumen de preguntas.


2. Seleccionar dificultad y cantidad de preguntas, generar y responder las preguntas. *Resultado:* El sistema captura las entradas del usuario y permite avanzar secuencialmente por el cuestionario.


3. Finalizar la participación. *Resultado:* El sistema calcula el puntaje obtenido y muestra los aciertos y errores al usuario en tiempo real.





Caso de Prueba 75: Verificar que el Portal del Visitante muestra las fichas públicas de los animales con galería multimedia 

* **Módulo:** Portal del Visitante.


* **Pre-Condiciones:** Acceso a la aplicación Zoo Connect Web como usuario no autenticado o con rol Visitante, que existan animales con fichas públicas y fotos registradas, y conexión a internet estable.


* **Pasos y Resultados:**
1. Navegar a la página de inicio pública. *Resultado:* Se muestra la página de bienvenida pública con información del zoológico.


2. Navegar a la sección de animales del portal público "Animales". *Resultado:* Se muestra la lista de fichas públicas de los animales del zoológico.


3. Hacer clic en la ficha de un animal. *Resultado:* Se muestra el perfil público del animal con información educativa (nombre, especie, hábitat, descripción) y la galería de fotos.


4. Verificar que no hay opciones de edición ni acceso a módulos administrativos desde el portal público. *Resultado:* El portal del visitante es de solo lectura; no muestra botones de administración ni enlaces a módulos internos.