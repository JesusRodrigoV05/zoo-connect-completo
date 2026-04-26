import { HttpClient } from "@angular/common/http";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { environment } from "@env";
import { DriveStep, driver } from "driver.js";
import { take } from "rxjs";

export type AdminTourKey =
  | "admin-dashboard"
  | "admin-animales-lista"
  | "admin-especies-lista"
  | "admin-especies-crear"
  | "admin-habitat-lista"
  | "admin-habitat-crear"
  | "admin-animales-crear"
  | "admin-tareas-operaciones"
  | "admin-tareas-planificador"
  | "admin-tareas-configuracion"
  | "admin-tareas-crear-manual"
  | "admin-tareas-rutina-crear"
  | "admin-tareas-tipo-crear";

interface TourStatusResponse {
  tour_key: string;
  completed: boolean;
  completed_at: string | null;
}

@Injectable({
  providedIn: "root",
})
export class OnboardingService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly onboardingApi = `${environment.apiUrl}/onboarding/tours`;

  private driverRef: ReturnType<typeof driver> | null = null;
  private completedThroughDone = false;
  private currentTourKey: AdminTourKey | null = null;

  startTour(tourKey?: AdminTourKey): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const key = this.resolveTourKey(tourKey);
    if (!key) {
      return;
    }

    this.destroyTour();

    const steps = this.getTourSteps(key);
    if (steps.length === 0) {
      return;
    }

    this.currentTourKey = key;
    this.completedThroughDone = false;

    const lastStepIndex = steps.length - 1;
    const stepsWithDoneHook = steps.map((step, index) => {
      if (index !== lastStepIndex) {
        return step;
      }

      return {
        ...step,
        popover: {
          ...step.popover,
          onNextClick: () => {
            this.completedThroughDone = true;
            this.driverRef?.moveNext();
          },
        },
      };
    });

    this.driverRef = driver({
      animate: true,
      smoothScroll: true,
      overlayOpacity: 0.6,
      stageRadius: 14,
      stagePadding: 10,
      showProgress: true,
      popoverClass: "driverjs-theme-green",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",
      allowClose: true,
      showButtons: ["previous", "next", "close"],
      steps: stepsWithDoneHook,
      onDestroyed: () => {
        const completed = this.completedThroughDone;
        const tourKeyToMark = this.currentTourKey;

        this.driverRef = null;
        this.currentTourKey = null;
        this.completedThroughDone = false;

        if (completed && tourKeyToMark) {
          this.markTourCompleted(tourKeyToMark).pipe(take(1)).subscribe();
        }
      },
    });

    this.driverRef.drive();
  }

  startTourFromStep(index: number, tourKey?: AdminTourKey): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const key = this.resolveTourKey(tourKey);
    if (!key) {
      return;
    }

    this.destroyTour();

    const steps = this.getTourSteps(key);
    if (steps.length === 0) {
      return;
    }

    this.currentTourKey = key;
    this.completedThroughDone = false;

    const lastStepIndex = steps.length - 1;
    const safeIndex = Math.min(Math.max(index, 0), lastStepIndex);

    const stepsWithDoneHook = steps.map((step, i) => {
      if (i !== lastStepIndex) {
        return step;
      }

      return {
        ...step,
        popover: {
          ...step.popover,
          onNextClick: () => {
            this.completedThroughDone = true;
            this.driverRef?.moveNext();
          },
        },
      };
    });

    this.driverRef = driver({
      animate: true,
      smoothScroll: true,
      overlayOpacity: 0.6,
      stageRadius: 14,
      stagePadding: 10,
      showProgress: true,
      popoverClass: "driverjs-theme-green",
      nextBtnText: "Siguiente",
      prevBtnText: "Anterior",
      doneBtnText: "Finalizar",
      allowClose: true,
      showButtons: ["previous", "next", "close"],
      steps: stepsWithDoneHook,
      onDestroyed: () => {
        const completed = this.completedThroughDone;
        const tourKeyToMark = this.currentTourKey;

        this.driverRef = null;
        this.currentTourKey = null;
        this.completedThroughDone = false;

        if (completed && tourKeyToMark) {
          this.markTourCompleted(tourKeyToMark).pipe(take(1)).subscribe();
        }
      },
    });

    this.driverRef.drive(safeIndex);
  }

  destroyTour(): void {
    if (this.driverRef) {
      this.driverRef.destroy();
      this.driverRef = null;
      this.currentTourKey = null;
      this.completedThroughDone = false;
    }
  }

  startTourIfFirstVisit(tourKey?: AdminTourKey): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const key = this.resolveTourKey(tourKey);
    if (!key) {
      return;
    }

    this.getTourStatus(key)
      .pipe(take(1))
      .subscribe({
        next: (status) => {
          if (!status.completed) {
            setTimeout(() => this.startTour(key), 220);
          }
        },
      });
  }

  private getTourStatus(tourKey: AdminTourKey) {
    return this.http.get<TourStatusResponse>(`${this.onboardingApi}/${tourKey}`);
  }

  private markTourCompleted(tourKey: AdminTourKey) {
    return this.http.post<TourStatusResponse>(
      `${this.onboardingApi}/${tourKey}/complete`,
      {},
    );
  }

  private resolveTourKey(explicitKey?: AdminTourKey): AdminTourKey | null {
    if (explicitKey) {
      return explicitKey;
    }

    const url = this.router.url;

    if (url.startsWith("/admin/dashboard")) {
      return "admin-dashboard";
    }
    if (url.startsWith("/admin/animales/especies/lista")) {
      return "admin-especies-lista";
    }
    if (url.startsWith("/admin/animales/especies/crear")) {
      return "admin-especies-crear";
    }
    if (url.startsWith("/admin/animales/habitat/lista")) {
      return "admin-habitat-lista";
    }
    if (url.startsWith("/admin/animales/habitat/crear")) {
      return "admin-habitat-crear";
    }
    if (url.startsWith("/admin/animales/lista")) {
      return "admin-animales-lista";
    }
    if (url.startsWith("/admin/animales/crear")) {
      return "admin-animales-crear";
    }
    if (url.startsWith("/admin/tareas/operaciones")) {
      return "admin-tareas-operaciones";
    }
    if (url.startsWith("/admin/tareas/planificador/crear")) {
      return "admin-tareas-rutina-crear";
    }
    if (url.startsWith("/admin/tareas/planificador")) {
      return "admin-tareas-planificador";
    }
    if (url.startsWith("/admin/tareas/configuracion")) {
      return "admin-tareas-configuracion";
    }

    return null;
  }

  private getTourSteps(tourKey: AdminTourKey): DriveStep[] {
    switch (tourKey) {
      case "admin-dashboard":
        return [
          {
            element: ".admin-menu-list",
            popover: {
              title: "Menú lateral",
              description:
                "Aquí navegas a todos los módulos administrativos del sistema.",
              side: "right",
              align: "start",
            },
          },
          {
            element: ".tour-dashboard-new-user",
            popover: {
              title: "Nuevo Usuario",
              description: "Crea rápidamente una nueva cuenta del personal.",
            },
          },
          {
            element: ".tour-dashboard-register-animal",
            popover: {
              title: "Registrar animal",
              description:
                "Abre el formulario completo para registrar un nuevo animal.",
            },
          },
          {
            element: ".tour-dashboard-new-task",
            popover: {
              title: "Nueva tarea",
              description:
                "Crea una tarea operativa para el equipo del zoológico.",
            },
          },
          {
            element: ".tour-dashboard-inventory",
            popover: {
              title: "Gestionar inventario",
              description:
                "Accede al módulo de inventario, entradas, salidas y stock.",
            },
          },
          {
            element: ".tour-dashboard-daily-report",
            popover: {
              title: "Descargar reporte diario",
              description:
                "Genera y descarga el reporte diario consolidado en un clic.",
            },
          },
          {
            element: ".tour-kpi-total-animales",
            popover: {
              title: "Total Animales",
              description: "Métrica global de animales registrados.",
            },
          },
          {
            element: ".tour-kpi-total-usuarios",
            popover: {
              title: "Total Usuarios",
              description: "Cantidad de usuarios activos del portal admin.",
            },
          },
          {
            element: ".tour-kpi-alertas-stock",
            popover: {
              title: "Alertas Stock",
              description:
                "Productos con niveles críticos o por debajo del umbral mínimo.",
            },
          },
          {
            element: ".tour-kpi-tareas-pendientes",
            popover: {
              title: "Tareas Pendientes",
              description:
                "Tareas operativas aún pendientes para el día actual.",
            },
          },
          {
            element: ".tour-chart-fauna",
            popover: {
              title: "Distribución de Fauna",
              description:
                "Visualiza la distribución por clase, familia u orden.",
            },
          },
          {
            element: ".tour-chart-rendimiento",
            popover: {
              title: "Rendimiento Operativo",
              description:
                "Monitorea el estado de tareas de hoy para control operativo.",
            },
          },
        ];

      case "admin-especies-lista":
        return [
          {
            element: ".tour-especies-header",
            popover: {
              title: "Lista de especies",
              description:
                "Aquí administras todas las especies registradas en el sistema.",
            },
          },
          {
            element: ".tour-especies-register-btn",
            popover: {
              title: "Registrar Especie",
              description: "Crea una nueva especie en el catálogo.",
            },
          },
          {
            element: ".tour-especies-reload-btn",
            popover: {
              title: "Recargar",
              description: "Actualiza la lista con los datos más recientes.",
            },
          },
          {
            element: ".tour-especies-table",
            popover: {
              title: "Tabla de especies",
              description:
                "Este listado muestra las especies disponibles para gestión.",
            },
          },
          {
            element: ".tour-especies-column-name",
            popover: {
              title: "Columna principal",
              description:
                "Muestra nombre común, nombre científico y taxonomía resumida.",
            },
          },
          {
            element: ".tour-especies-column-actions",
            popover: {
              title: "Columna de acciones",
              description:
                "Permite ver detalle, editar y activar/desactivar especies.",
            },
          },
          {
            element: ".tour-especies-view-type",
            popover: {
              title: "Tipo de vista",
              description:
                "Cambia entre vista de lista y vista en cuadrícula.",
            },
          },
          {
            element: ".tour-especies-table .p-paginator",
            popover: {
              title: "Paginación",
              description:
                "Navega entre páginas para consultar más registros.",
            },
          },
        ];

      case "admin-especies-crear":
        return [
          {
            element: ".tour-especie-page-header",
            popover: {
              title: "Registrar Especie",
              description:
                "Completa este formulario para crear una nueva especie en el catálogo.",
            },
          },
          {
            element: "#nombreCientifico",
            popover: {
              title: "Nombre Científico",
              description:
                "Ejemplo: Panthera leo. Usa nomenclatura taxonómica estándar.",
            },
          },
          {
            element: "#nombreComun",
            popover: {
              title: "Nombre Común",
              description:
                "Ejemplo: León. Es el nombre visible para usuarios internos.",
            },
          },
          {
            element: "#filo",
            popover: {
              title: "Filo",
              description: "Ejemplo: Chordata.",
            },
          },
          {
            element: "#clase",
            popover: {
              title: "Clase",
              description: "Ejemplo: Mammalia.",
            },
          },
          {
            element: "#orden",
            popover: {
              title: "Orden",
              description: "Ejemplo: Carnivora.",
            },
          },
          {
            element: "#familia",
            popover: {
              title: "Familia",
              description: "Ejemplo: Felidae.",
            },
          },
          {
            element: "#descripcion",
            popover: {
              title: "Descripción",
              description:
                "Ejemplo: Mamífero carnívoro social de gran tamaño, originario de África.",
            },
          },
        ];

      case "admin-habitat-lista":
        return [
          {
            element: ".tour-habitat-header",
            popover: {
              title: "Lista de hábitats",
              description:
                "Gestiona y consulta todos los hábitats registrados.",
            },
          },
          {
            element: ".tour-habitat-register-btn",
            popover: {
              title: "Registrar Hábitat",
              description: "Abre el flujo para crear un nuevo hábitat.",
            },
          },
          {
            element: ".tour-habitat-reload-btn",
            popover: {
              title: "Recargar",
              description: "Actualiza la información de la lista.",
            },
          },
          {
            element: ".tour-habitat-table",
            popover: {
              title: "Tabla de hábitats",
              description: "Listado principal de hábitats del sistema.",
            },
          },
          {
            element: ".tour-habitat-column-name",
            popover: {
              title: "Columna principal",
              description: "Muestra nombre y tipo de hábitat.",
            },
          },
          {
            element: ".tour-habitat-column-actions",
            popover: {
              title: "Columna de acciones",
              description: "Editar o desactivar cada hábitat desde aquí.",
            },
          },
          {
            element: ".tour-habitat-view-type",
            popover: {
              title: "Tipo de vista",
              description: "Alterna entre lista y cuadrícula.",
            },
          },
          {
            element: ".tour-habitat-table .p-paginator",
            popover: {
              title: "Paginación",
              description: "Navega por páginas y ajusta registros por página.",
            },
          },
        ];

      case "admin-habitat-crear":
        return [
          {
            element: ".tour-habitat-step1-header",
            popover: {
              title: "Crear Nuevo Hábitat",
              description:
                "Este paso define los datos base del hábitat antes de guardar imágenes.",
            },
          },
          {
            element: ".tour-habitat-step1-section",
            popover: {
              title: "Paso 1: Datos del hábitat",
              description:
                "Completa nombre, tipo, descripción y condiciones climáticas.",
            },
          },
          {
            element: "#nombre",
            popover: {
              title: "Nombre del Hábitat",
              description: "Ejemplo: Sabana Africana.",
            },
          },
          {
            element: "#tipo",
            popover: {
              title: "Tipo de Hábitat",
              description: "Ejemplo: Pradera tropical.",
            },
          },
          {
            element: "#descripcion",
            popover: {
              title: "Descripción",
              description:
                "Ejemplo: Zona amplia con pastizales, árboles dispersos y bebederos.",
            },
          },
          {
            element: "#condicionesClimaticas",
            popover: {
              title: "Condiciones Climáticas",
              description:
                "Ejemplo: 24-32 C, humedad media y lluvias estacionales.",
            },
          },
          {
            element: ".tour-habitat-step2-header",
            popover: {
              title: "Subir Imágenes",
              description:
                "En el paso 2 agregas la galería visual del hábitat.",
            },
          },
          {
            element: ".tour-habitat-step2-section",
            popover: {
              title: "Carga de imágenes",
              description:
                "Sube fotografías referenciales del hábitat para documentación.",
            },
          },
        ];

      case "admin-animales-lista":
        return [
          {
            element: ".tour-animales-header",
            popover: {
              title: "Lista de animales",
              description:
                "Gestiona el inventario de animales desde esta vista.",
            },
          },
          {
            element: ".tour-animales-register-btn",
            popover: {
              title: "Registrar Animal",
              description: "Inicia el registro de un nuevo animal.",
            },
          },
          {
            element: ".tour-animales-reload-btn",
            popover: {
              title: "Recargar",
              description: "Refresca el listado con la información más reciente.",
            },
          },
          {
            element: ".tour-animales-table",
            popover: {
              title: "Tabla de animales",
              description: "Listado principal de animales en el sistema.",
            },
          },
          {
            element: ".tour-animales-column-name",
            popover: {
              title: "Columna principal",
              description:
                "Muestra nombre del animal, especie y estado operativo.",
            },
          },
          {
            element: ".tour-animales-column-actions",
            popover: {
              title: "Columna de acciones",
              description:
                "Desde aquí puedes ver ficha, editar y dar de baja.",
            },
          },
          {
            element: ".tour-animales-view-type",
            popover: {
              title: "Tipo de vista",
              description: "Cambia entre vista de lista y vista de tarjetas.",
            },
          },
          {
            element: ".tour-animales-table .p-paginator",
            popover: {
              title: "Paginación",
              description: "Permite avanzar y retroceder entre páginas.",
            },
          },
        ];

      case "admin-animales-crear":
        return [
          {
            element: ".tour-animal-step1-header",
            popover: {
              title: "Crear Nuevo Animal",
              description:
                "Formulario administrativo para registrar un animal en dos pasos.",
            },
          },
          {
            element: ".tour-animal-section-basica",
            popover: {
              title: "Sección: Información básica",
              description:
                "Incluye identificación general y fechas clave del animal.",
            },
          },
          {
            element: "#nombre",
            popover: {
              title: "Nombre del Animal",
              description: "Ejemplo: Kira.",
            },
          },
          {
            element: "#fechaNac",
            popover: {
              title: "Fecha de Nacimiento",
              description: "Ejemplo: 2019-05-14.",
            },
          },
          {
            element: "#fechaIng",
            popover: {
              title: "Fecha de Ingreso",
              description: "Ejemplo: 2022-01-10.",
            },
          },
          {
            element: "#procedencia",
            popover: {
              title: "Procedencia",
              description: "Ejemplo: Centro de conservación regional.",
            },
          },
          {
            element: ".tour-animal-section-clasificacion",
            popover: {
              title: "Sección: Estado y clasificación",
              description:
                "Configura estado operativo, especie y hábitat asignado.",
            },
          },
          {
            element: "#estado",
            popover: {
              title: "Estado Operativo",
              description: "Ejemplo: SALUDABLE.",
            },
          },
          {
            element: "#especieId",
            popover: {
              title: "Especie",
              description: "Selecciona la especie correspondiente del catálogo.",
            },
          },
          {
            element: "#habitatId",
            popover: {
              title: "Hábitat",
              description: "Selecciona el hábitat donde vivirá el animal.",
            },
          },
          {
            element: ".tour-animal-section-descripcion",
            popover: {
              title: "Sección: Descripción",
              description:
                "Agrega detalles relevantes de comportamiento y observaciones.",
            },
          },
          {
            element: "#descripcion",
            popover: {
              title: "Descripción del Animal",
              description:
                "Ejemplo: Hembra activa, dieta controlada y buena respuesta al entrenamiento.",
            },
          },
          {
            element: ".tour-animal-step2-header",
            popover: {
              title: "Subir Imágenes",
              description:
                "Segundo paso para documentar visualmente al animal.",
            },
          },
          {
            element: ".tour-animal-step2-section",
            popover: {
              title: "Carga de imágenes",
              description:
                "Sube fotos del animal para ficha y seguimiento.",
            },
          },
        ];

      case "admin-tareas-operaciones":
        return [
          {
            element: ".tour-operaciones-header",
            popover: {
              title: "Tablero de Operaciones",
              description:
                "Vista principal para coordinar tareas operativas en tiempo real.",
            },
          },
          {
            element: ".tour-operaciones-inbox",
            popover: {
              title: "Bandeja de Entrada",
              description:
                "Aquí llegan tareas sin responsable para ser asignadas al equipo.",
            },
          },
          {
            element: ".tour-operaciones-assigned",
            popover: {
              title: "Asignadas Hoy",
              description:
                "Muestra las tareas ya asignadas para el día y su distribución por cuidador.",
            },
          },
          {
            element: ".tour-operaciones-refresh-btn",
            popover: {
              title: "Actualizar",
              description:
                "Recarga el tablero para obtener el estado más reciente de tareas y asignaciones.",
            },
          },
          {
            element: ".tour-operaciones-create-btn",
            popover: {
              title: "Crear Tarea Manual",
              description:
                "Abre el formulario para registrar una tarea puntual sin depender de una rutina.",
            },
          },
        ];

      case "admin-tareas-planificador":
        return [
          {
            element: ".tour-planificador-page",
            popover: {
              title: "Vista completa de la página",
              description:
                "Desde aquí administras las rutinas automáticas que generan tareas recurrentes.",
            },
          },
          {
            element: ".tour-planificador-table",
            popover: {
              title: "Tabla",
              description:
                "Listado de rutinas configuradas con su frecuencia, estado y acciones.",
            },
          },
          {
            element: ".tour-planificador-col-titulo",
            popover: {
              title: "Columna: Título",
              description:
                "Identifica rápidamente el nombre de cada rutina programada.",
            },
          },
          {
            element: ".tour-planificador-col-tipo",
            popover: {
              title: "Columna: Tipo",
              description:
                "Indica la categoría de actividad que ejecutará la rutina.",
            },
          },
          {
            element: ".tour-planificador-col-lugar",
            popover: {
              title: "Columna: Lugar",
              description:
                "Muestra si la rutina aplica a un hábitat, un animal o a nivel general.",
            },
          },
          {
            element: ".tour-planificador-col-frecuencia",
            popover: {
              title: "Columna: Frecuencia",
              description:
                "Resume la periodicidad con la que se ejecutará la rutina.",
            },
          },
          {
            element: ".tour-planificador-col-estado",
            popover: {
              title: "Columna: Estado",
              description:
                "Permite verificar si la rutina está activa o pausada.",
            },
          },
          {
            element: ".tour-planificador-new-btn",
            popover: {
              title: "Nueva Rutina",
              description:
                "Accede al formulario para crear una rutina recurrente nueva.",
            },
          },
        ];

      case "admin-tareas-configuracion":
        return [
          {
            element: ".tour-config-tipos-header",
            popover: {
              title: "Diccionario de actividades",
              description:
                "Define y administra los tipos de tarea que se reutilizan en operaciones y rutinas.",
            },
          },
          {
            element: ".tour-config-tipos-list",
            popover: {
              title: "Lista de tipos",
              description:
                "Muestra todos los tipos registrados con su descripción y acciones disponibles.",
            },
          },
          {
            element: ".tour-config-tipos-delete-btn",
            popover: {
              title: "Botón Eliminar",
              description:
                "Cambia el estado del tipo seleccionado cuando ya no debe utilizarse.",
            },
          },
          {
            element: ".tour-config-tipos-new-btn",
            popover: {
              title: "Nuevo Tipo",
              description:
                "Abre el modal para crear un nuevo tipo de tarea.",
            },
          },
          {
            element: ".tour-config-tipos-refresh-btn",
            popover: {
              title: "Actualizar",
              description:
                "Recarga el catálogo para reflejar los cambios más recientes.",
            },
          },
        ];

      case "admin-tareas-crear-manual":
        return [
          {
            element: ".tour-crear-tarea-header",
            popover: {
              title: "Crear Tarea Manual",
              description:
                "Formulario para registrar una tarea operativa puntual. <br><strong>Ejemplo:</strong> Revisión de cerraduras del recinto felino.",
            },
          },
          {
            element: "#titulo",
            popover: {
              title: "Título de la Tarea",
              description:
                "Define un nombre corto y claro para identificar la tarea. <br><strong>Ejemplo:</strong> Limpieza profunda de zona de aves.",
            },
          },
          {
            element: "#desc",
            popover: {
              title: "Instrucciones",
              description:
                "Describe el procedimiento o alcance esperado de la actividad. <br><strong>Ejemplo:</strong> Retirar desechos, desinfectar perchas y cambiar agua.",
            },
          },
          {
            element: "#tipo",
            popover: {
              title: "Tipo de Tarea",
              description:
                "Selecciona la categoría operativa para clasificar correctamente la tarea. <br><strong>Ejemplo:</strong> Limpieza y Mantenimiento.",
            },
          },
          {
            element: "#fecha",
            popover: {
              title: "Fecha de Ejecución",
              description:
                "Indica el día en que la tarea debe completarse. <br><strong>Ejemplo:</strong> 2026-04-28.",
            },
          },
          {
            element: "#lugar",
            popover: {
              title: "Lugar o Animal Afectado",
              description:
                "Asocia la tarea a una ubicación o animal para dar contexto operativo. <br><strong>Ejemplo:</strong> Hábitat: Sabana Africana.",
            },
          },
          {
            element: "#asignado",
            popover: {
              title: "Asignar a (Opcional)",
              description:
                "Puedes asignar un responsable ahora o dejar la tarea en bandeja de entrada. <br><strong>Ejemplo:</strong> Juan Perez (Cuidador).",
            },
          },
        ];

      case "admin-tareas-rutina-crear":
        return [
          {
            element: ".tour-rutina-crear-header",
            popover: {
              title: "Nueva Rutina",
              description:
                "Aquí configuras una rutina para generar tareas automáticamente. <br><strong>Ejemplo:</strong> Alimentación matutina de primates.",
            },
          },
          {
            element: "#titulo",
            popover: {
              title: "Título de la Rutina",
              description:
                "Nombre identificador de la rutina recurrente. <br><strong>Ejemplo:</strong> Limpieza diaria de estanque central.",
            },
          },
          {
            element: "#tipo",
            popover: {
              title: "Tipo de Actividad",
              description:
                "Define la categoría de tarea que se generará en cada ejecución. <br><strong>Ejemplo:</strong> Alimentación.",
            },
          },
          {
            element: "#lugar",
            popover: {
              title: "Ubicación/Animal (Opcional)",
              description:
                "Delimita el alcance de la rutina a una zona o animal específico. <br><strong>Ejemplo:</strong> Animal: Kira.",
            },
          },
          {
            element: "#freqType",
            popover: {
              title: "Frecuencia de Repetición",
              description:
                "Selecciona cada cuánto se ejecutará la rutina. <br><strong>Ejemplo:</strong> Semanalmente.",
            },
          },
          {
            element: "#timepicker",
            popover: {
              title: "Hora de ejecución",
              description:
                "Especifica la hora exacta para generar la tarea automática. <br><strong>Ejemplo:</strong> 07:30.",
            },
          },
          {
            element: "#desc",
            popover: {
              title: "Instrucciones",
              description:
                "Detalla las acciones que debe realizar el responsable al ejecutar la tarea. <br><strong>Ejemplo:</strong> Verificar ración, registrar observaciones y confirmar cierre.",
            },
          },
        ];

      case "admin-tareas-tipo-crear":
        return [
          {
            element: ".tour-tipo-crear-header",
            popover: {
              title: "Nuevo Tipo de Tarea",
              description:
                "Modal para definir una nueva categoría reutilizable de tareas. <br><strong>Ejemplo:</strong> Inspección Preventiva.",
            },
          },
          {
            element: "#nombre",
            popover: {
              title: "Nombre",
              description:
                "Campo para registrar el nombre del tipo de tarea. <br><strong>Ejemplo:</strong> Control Sanitario.",
            },
          },
          {
            element: "#desc",
            popover: {
              title: "Descripción",
              description:
                "Describe cuándo y cómo se debe usar este tipo en operaciones. <br><strong>Ejemplo:</strong> Actividades de verificación clínica y seguimiento de signos vitales.",
            },
          },
        ];

      default:
        return [];
    }
  }
}
