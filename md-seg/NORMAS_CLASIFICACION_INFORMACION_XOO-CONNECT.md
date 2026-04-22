**NOMBRE DEL DOCUMENTO**

Norma de Clasificación de Información — XOO-CONNECT-COMPLETO (BACKEND Y FRONTEND)

Proceso: Seguridad de la Información / Gestión documental

Versión: 1.0

Fecha: 20/04/2026

Aprobado por:

Fecha de vigencia:

Histórico de revisiones del Documento

| Versión | Fecha | Detalle de Revisión y Cambios |
|---|---:|---|
| 1.0 | 20/04/2026 | Creación del documento para XOO-CONNECT-COMPLETO |

**ADVERTENCIA**

| **ADVERTENCIA** |
|---|
| Este documento y su contenido se clasifica como **USO INTERNO** y contiene pautas obligatorias para la clasificación y manejo de la información del proyecto XOO-CONNECT-COMPLETO (Backend y Frontend). Su distribución o divulgación no autorizada está prohibida y puede estar sujeta a sanciones internas y legales. |

**TABLA DE CONTENIDO / INDICE**

1. OBJETIVO GENERAL
2. OBJETIVOS ESPECÍFICOS
3. ALCANCE
4. GLOSARIO
5. DOCUMENTOS INTERNOS RELACIONADOS
6. DOCUMENTOS EXTERNOS RELACIONADOS
7. ABREVIATURAS
8. NORMAS
9. INCUMPLIMIENTOS
10. APROBACIÓN
11. ANEXOS


1. **OBJETIVO GENERAL**

Establecer las normas para la clasificación, etiquetado, manejo, almacenamiento, transmisión y eliminación de la información generada, procesada y almacenada en el proyecto XOO-CONNECT-COMPLETO (Backend y Frontend), con el fin de proteger la confidencialidad, integridad y disponibilidad de la información y cumplir con requisitos legales y contractuales.

2. **OBJETIVOS ESPECÍFICOS**

a) Definir niveles de clasificación de la información aplicables al proyecto.

b) Establecer responsabilidades sobre el etiquetado y manipulación de información.

c) Determinar controles mínimos técnicos y organizativos por nivel de clasificación.

d) Establecer procedimientos para el intercambio, almacenamiento y eliminación segura de información.

e) Garantizar el cumplimiento de esta norma por parte de empleados, contratistas y terceros involucrados en XOO-CONNECT-COMPLETO.

3. **ALCANCE**

Esta norma aplica a toda la información creada, recibida, almacenada o procesada por personal, sistemas, servicios y proveedores vinculados al proyecto XOO-CONNECT-COMPLETO, incluyendo:

- Código fuente, configuraciones, scripts y dependencias (Backend y Frontend).
- Bases de datos, respaldos y datos de producción y pruebas.
- Documentación técnica, comercial y operativa.
- Registros de usuarios, credenciales y datos personales.
- Canales de comunicación usados para intercambio de información del proyecto.

No quedan excluidos los dispositivos móviles, estaciones de trabajo, repositorios, entornos en la nube y medios físicos asociados.

4. **GLOSARIO**

- Clasificación: Proceso de asignar un nivel de sensibilidad a un activo o dato.
- Etiquetado: Marca o metadato que indica el nivel de clasificación.
- Titular de la información: Persona responsable de definir la clasificación de un conjunto de datos o recursos.
- Custodio: Persona o equipo responsable del almacenamiento y protección operativa de la información.
- Información sensible: Datos que requieren protección adicional por su naturaleza.

5. **DOCUMENTOS INTERNOS RELACIONADOS**

| DESCRIPCIÓN | CÓDIGO |
|---|---|
| Política de Seguridad de la Información | POL-SEG-001 |
| Procedimiento de Gestión de Incidentes | PRC-SEG-INC-001 |
| Manejo de Accesos y Privilegios | PRC-SEG-ACCESOS-001 |
| Política de Retención y Eliminación de Datos | POL-RET-001 |

6. **DOCUMENTOS EXTERNOS RELACIONADOS**

- Ley y normativa de protección de datos personales aplicable.
- Estándares internacionales: ISO/IEC 27001, ISO/IEC 27002, ISO 27701.
- Buenas prácticas OWASP (para desarrollo seguro en Backend y Frontend).

7. **ABREVIATURAS**

- DPI: Datos Personales Identificables
- PII: Personally Identifiable Information (equivalente a DPI)
- DB: Base de Datos
- API: Application Programming Interface
- DEV: Entorno de desarrollo
- PROD: Entorno de producción

8. **NORMAS**

8.1 Clasificación de la información

Se definen los siguientes niveles de clasificación aplicables a XOO-CONNECT-COMPLETO:

- Público: Información aprobada para difusión pública sin restricciones (por ejemplo, páginas públicas del producto, README públicos, material de marketing aprobado).

- Interno: Información destinada al uso dentro de la organización y colaboradores autorizados; su divulgación fuera del proyecto/organización no está permitida sin autorización (por ejemplo, documentación de procesos internos no sensibles).

- Confidencial: Información que, de divulgarse, podría afectar a la organización, clientes o usuarios; requiere controles técnicos y organizativos reforzados (por ejemplo, datos de clientes, credenciales en archivos de configuración, detalles de arquitectura no públicos).

- Secreto / Reservado: Información cuya divulgación puede causar daño significativo; acceso extremadamente restringido y registro estricto de accesos (por ejemplo, claves privadas de producción, secretos de integración, datos personales sensibles en escala).

8.2 Responsabilidades

- Dueño/Titular de la información: Define la clasificación inicial y aprueba excepciones.

- Custodios (equipos de backend/frontend, DevOps, administradores de base de datos): Implementan controles de almacenamiento, acceso y eliminación según la clasificación.

- Usuarios y desarrolladores: Etiquetar y manejar la información conforme a su clasificación; reportar incidentes.

- Seguridad de la Información: Supervisar cumplimiento, realizar revisiones y aprobar excepciones.

8.3 Etiquetado y marcado

- Todo activo informacional (archivos, repositorios, tickets, documentos, bases de datos) debe llevar una etiqueta de clasificación en su metadata o encabezado.

- En repositorios de código: añadir en el README y en archivos de configuración la clasificación aplicable, y evitar incluir secretos en texto plano.

- En documentación técnica y operativa: incorporar una línea de clasificación en la primera página o encabezado, siguiendo el formato de este documento.

8.4 Accesos y control de privilegios

- El acceso a información `Confidencial` o `Secreto` requiere autorización explícita y principio de mínimo privilegio.

- Revisiones periódicas de accesos deben realizarse por parte de los responsables de cada repositorio/servicio.

- Todas las operaciones administrativas sobre datos sensibles deben registrarse en logs auditables con retención definida.

8.5 Almacenamiento y cifrado

- Información `Confidencial` y `Secreto` debe almacenarse cifrada en reposo; claves gestionadas por un servicio de gestión de secretos aprobado (p. ej. HashiCorp Vault, Azure Key Vault, AWS KMS según infraestructura).

- Transferencia de información sensible entre sistemas o terceros debe realizarse sobre canales cifrados (TLS 1.2+ o superior) y con autenticación mutua cuando proceda.

8.6 Manejo de credenciales, secretos y claves

- Prohibido mantener credenciales en código fuente, archivos de configuración sin cifrar o repositorios públicos.

- Uso obligatorio de herramientas de secretos y rotación periódica de credenciales de producción.

8.7 Transmisión y compartición

- Para compartir información `Interna` o superior con terceros, se requiere un acuerdo contractual y autorización del titular.

- Los correos electrónicos con información `Confidencial` deberán enviarse con medidas de seguridad adicionales (adjuntos cifrados, control de acceso).

8.8 Copias de seguridad y retención

- Las copias de seguridad que contengan información `Confidencial` o `Secreto` deben ser cifradas y almacenadas en ubicaciones controladas.

- Aplicar política de retención conforme a `Política de Retención y Eliminación de Datos` (ver sección 5).

8.9 Eliminación segura

- Cuando la información alcance el fin de su periodo de retención o ya no sea requerida, se procederá a su eliminación segura (borrado seguro, destrucción de medios, eliminación de backups) acorde a la clasificación.

8.10 Terceros y proveedores

- Los proveedores que procesen información `Confidencial` o `Secreto` deben someterse a evaluaciones de seguridad y firmar cláusulas contractuales que garanticen medidas equivalentes de protección.

8.11 Gestión de excepciones

- Cualquier excepción a las normas de clasificación y manejo debe documentarse, justificarse y aprobarse por escrito por el Responsable de Seguridad de la Información y el Titular de la información.

8.12 Detección y respuesta a incidentes

- Los incidentes que afecten la confidencialidad, integridad o disponibilidad de información deben reportarse inmediatamente según el `Procedimiento de Gestión de Incidentes`.

- Se realizarán investigaciones, contención y notificación a las partes afectadas conforme a la legislación aplicable.

8.13 Formación y concientización

- Se impartirá formación periódica a desarrolladores, administradores y usuarios sobre clasificación, manejo de secretos y buenas prácticas de seguridad.

9. **INCUMPLIMIENTOS**

Cualquier incumplimiento de esta norma será gestionado conforme al Reglamento Interno y podrá conllevar sanciones administrativas, disciplinarias o contractuales, además de las acciones técnicas para mitigar el incidente.

10. **APROBACIÓN**

Este documento debe ser aprobado por las instancias correspondientes del proyecto XOO-CONNECT-COMPLETO (Responsable de Seguridad de la Información, Jefatura de Operaciones, Dirección del Proyecto). A partir de la fecha de aprobación, entra en vigencia y será de cumplimiento obligatorio.

11. **ANEXOS**

- Anexo A: Matriz de clasificación con ejemplos de activos para XOO-CONNECT (público, interno, confidencial, secreto).
- Anexo B: Procedimiento para manejo de secretos en repositorios y CI/CD.
- Anexo C: Formato de solicitud de excepción a la norma.

---

Fin del documento.
