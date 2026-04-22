**NOMBRE DEL DOCUMENTO**

Procedimiento: Procedimiento para Clasificar Información — ZOO-CONNECT-COMPLETO (BACKEND Y FRONTEND)

Proceso: Seguridad de la Información / Gestión documental

Versión: 1.0

Fecha: 20/04/2026

Aprobado por:

Fecha de vigencia:

Histórico de revisiones del Documento

| Versión | Fecha | Detalle de Revisión y Cambios |
|---|---:|---|
| 1.0 | 20/04/2026 | Creación del procedimiento para ZOO-CONNECT-COMPLETO |

La advertencia debe estar en la primera hoja preferentemente al pie de la misma.

| **ADVERTENCIA** |
|---|
| Este documento y su contenido se clasifica como **USO INTERNO**. Su distribución o divulgación fuera del proyecto requiere autorización. La reproducción no autorizada podrá ser sancionada conforme a normativa interna y legislación aplicable. |

**TABLA DE CONTENIDO / INDICE**

1. OBJETIVO
2. ALCANCE
3. GLOSARIO
4. DOCUMENTOS INTERNOS RELACIONADOS
5. DOCUMENTOS EXTERNOS RELACIONADOS
6. DESCRIPCIÓN DE ACTIVIDADES
7. APROBACIÓN
8. INCUMPLIMIENTOS
9. ANEXOS


1. **OBJETIVO**

Establecer el proceso y pasos operativos para clasificar la información generada, procesada y almacenada en el proyecto ZOO-CONNECT-COMPLETO (Backend y Frontend), garantizando una aplicación coherente de la `Norma de Clasificación de Información` y la adecuada protección de la confidencialidad, integridad y disponibilidad.

2. **ALCANCE**

Aplica a todo el personal, contratistas y terceros que participen en el desarrollo, operación, mantenimiento y soporte de ZOO-CONNECT-COMPLETO, así como a los activos informacionales: código fuente, documentación, bases de datos, backups, configuraciones, canales de comunicación y medios físicos asociados.

3. **GLOSARIO**

- Titular de la información: Persona/designada responsable de definir la clasificación de un conjunto de datos.
- Custodio: Equipo o persona responsable del resguardo operativo de la información.
- Etiquetado: Inserción de metadatos o marcas que indican el nivel de clasificación.
- Activo informacional: Archivo, repositorio, base de datos, documento o recurso digital que contiene información.

4. **DOCUMENTOS INTERNOS RELACIONADOS**

| DESCRIPCIÓN | CÓDIGO |
|---|---|
| Norma de Clasificación de Información — ZOO-CONNECT | NORMAS_CLASIFICACION_INFORMACION_XOO-CONNECT.md |
| Política de Seguridad de la Información | POL-SEG-001 |
| Procedimiento de Gestión de Incidentes | PRC-SEG-INC-001 |
| Política de Retención y Eliminación de Datos | POL-RET-001 |

5. **DOCUMENTOS EXTERNOS RELACIONADOS**

- Leyes y normativa de protección de datos personales vigentes.
- Estándares: ISO/IEC 27001, ISO/IEC 27002.
- Buenas prácticas OWASP para desarrollo seguro.

6. **DESCRIPCIÓN DE ACTIVIDADES**

La clasificación de información se ejecuta mediante las siguientes actividades y roles:

| No. | Actividad | Descripción | Plazo/Tiempo | Responsable |
|---:|---|---|---:|---|
| 1 | Solicitar clasificación | El creador o propietario del activo solicita la clasificación inicial mediante ticket o formulario estandarizado. | Al crear el activo | Creador / Solicitante |
| 2 | Evaluar activo | El Titular de la Información evalúa la sensibilidad del activo conforme a la Norma y guía de clasificación. | 2 días hábiles | Titular |
| 3 | Asignar nivel | Titular asigna nivel (Público / Interno / Confidencial / Secreto) y documenta la justificación. | Inmediato tras evaluación | Titular |
| 4 | Etiquetar y registrar | El Custodio añade etiqueta en metadata/README/encabezado y registra en inventario de activos. | 1 día hábil | Custodio / Equipo DevOps |
| 5 | Implementar controles | Se aplican controles técnicos y organizativos según el nivel (accesos, cifrado, backups). | Según plan de despliegue | Custodio / DevOps / Seguridad |
| 6 | Revisión y aprobación | Revisión por Seguridad de la Información y aprobación final si procede. Ver PR-1. | 3 días hábiles | Seguridad de la Información |
| 7 | Monitoreo y revisión periódica | Revisiones periódicas de clasificación (al menos anual o por cambios significativos). | Anual / Por cambio | Titular / Seguridad |
| 8 | Actualización y notificación | Cambios de clasificación deben notificarse y aplicarse en todos los sistemas y registros. | Inmediato tras decisión | Titular / Custodio |
| 9 | Registro de auditoría | Todas las acciones se registran en registros auditables. | Permanente | Custodio / Seguridad |

6.1 Formatos y evidencias

- Solicitud: formulario/ticket que incluya descripción del activo, ubicación, propietario y recomendación de nivel.
- Registro: entrada en inventario de activos con metadatos de clasificación, fecha, responsable y justificativo.
- Evidencias de control: capturas de configuración de accesos, políticas de repositorios, comprobantes de cifrado y backups.

6.2 PR-1: Revisión y Autorización (subprocedimiento)

| No. | Actividad | Descripción | Plazo | Responsable |
|---:|---|---|---:|---|
| 1 | Revisar clasificación | Seguridad revisa la propuesta de clasificación y verifica controles asociados. Si hay discrepancias devuelve para ajuste. | Por evento | Seguridad de la Información |
| 2 | Autorizar / Rechazar | Seguridad autoriza la clasificación o solicita correcciones; la autorización se documenta en el ticket. | Por evento | Seguridad de la Información |

7. **APROBACIÓN**

El procedimiento debe ser aprobado por el Responsable de Seguridad de la Información y la Dirección del Proyecto ZOO-CONNECT-COMPLETO. La aprobación queda registrada en el historial del documento.

8. **INCUMPLIMIENTOS**

El incumplimiento de este procedimiento será gestionado conforme al Reglamento Interno y podrá implicar medidas disciplinarias, contractuales o administrativas. Los incidentes de seguridad derivados de incumplimientos deben reportarse inmediatamente según el `Procedimiento de Gestión de Incidentes`.

9. **ANEXOS**

- Anexo 1: Formato de Solicitud de Clasificación (plantilla de ticket/formulario).
- Anexo 2: Matriz de Controles por Nivel (Público, Interno, Confidencial, Secreto) — referencia a `NORMAS_CLASIFICACION_INFORMACION_XOO-CONNECT.md` Anexo A.
- Anexo 3: Registro de Activos (ejemplo de campos y metadatos).

---

Fin del procedimiento.
