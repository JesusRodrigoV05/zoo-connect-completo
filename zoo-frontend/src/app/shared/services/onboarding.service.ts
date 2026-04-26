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
  | "admin-tareas-tipo-crear"
  | "admin-usuarios-lista"
  | "admin-usuarios-crear"
  | "admin-usuarios-editar"
  | "admin-permisos-osi"
  | "admin-inventario-producto-crear"
  | "admin-inventario-producto-lista"
  | "admin-inventario-proveedor-crear"
  | "admin-inventario-proveedor-lista"
  | "admin-inventario-tipo-lista"
  | "admin-inventario-unidad-lista"
  | "admin-inventario-unidad-crear"
  | "admin-inventario-historial"
  | "admin-inventario-entrada-crear"
  | "admin-inventario-salida-crear";

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
    if (url.startsWith("/admin/usuarios/editar")) {
      return "admin-usuarios-editar";
    }
    if (url.startsWith("/admin/usuarios/crear")) {
      return "admin-usuarios-crear";
    }
    if (url.startsWith("/admin/usuarios/lista") || url === "/admin/usuarios") {
      return "admin-usuarios-lista";
    }
    if (url.startsWith("/admin/permisos")) {
      return "admin-permisos-osi";
    }
    if (url.startsWith("/admin/inventario/crear")) {
      return "admin-inventario-producto-crear";
    }
    if (url.startsWith("/admin/inventario/lista") || url === "/admin/inventario") {
      return "admin-inventario-producto-lista";
    }
    if (url.startsWith("/admin/inventario/proveedor/crear")) {
      return "admin-inventario-proveedor-crear";
    }
    if (url.startsWith("/admin/inventario/proveedor/lista") || url.startsWith("/admin/inventario/proveedor")) {
      return "admin-inventario-proveedor-lista";
    }
    if (url.startsWith("/admin/inventario/tipo/lista") || url.startsWith("/admin/inventario/tipo")) {
      return "admin-inventario-tipo-lista";
    }
    if (url.startsWith("/admin/inventario/unidades/crear")) {
      return "admin-inventario-unidad-crear";
    }
    if (url.startsWith("/admin/inventario/unidades/lista") || url.startsWith("/admin/inventario/unidades")) {
      return "admin-inventario-unidad-lista";
    }
    if (url.startsWith("/admin/inventario/transacciones/crear-entrada")) {
      return "admin-inventario-entrada-crear";
    }
    if (url.startsWith("/admin/inventario/transacciones/crear-salida")) {
      return "admin-inventario-salida-crear";
    }
    if (url.startsWith("/admin/inventario/transacciones/lista") || url.startsWith("/admin/inventario/transacciones")) {
      return "admin-inventario-historial";
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

      case "admin-usuarios-lista":
        return [
          {
            element: ".tour-users-header",
            popover: {
              title: "Gestión de Usuarios",
              description:
                "Sección principal para administrar la cuenta y el estado de los usuarios del sistema.",
            },
          },
          {
            element: ".tour-users-dataview",
            popover: {
              title: "Lista de los Usuarios",
              description:
                "Muestra el listado paginado de usuarios registrados con sus acciones disponibles.",
            },
          },
          {
            element: ".tour-users-total",
            popover: {
              title: "Total de usuarios",
              description:
                "Indica cuántos usuarios están cargados en la consulta actual.",
            },
          },
          {
            element: ".tour-users-dataview .p-paginator",
            popover: {
              title: "Paginación",
              description:
                "Permite navegar entre páginas y ajustar la cantidad de usuarios visibles.",
            },
          },
          {
            element: ".tour-users-refresh-btn",
            popover: {
              title: "Refrescar / Actualizar",
              description:
                "Vuelve a consultar la lista para traer los datos más recientes. <br><strong>Ejemplo:</strong> ver usuarios creados hace unos segundos.",
            },
          },
          {
            element: ".tour-users-create-btn",
            popover: {
              title: "Crear Usuario",
              description:
                "Abre el formulario para registrar una nueva cuenta. <br><strong>Ejemplo:</strong> crear un usuario para un nuevo colaborador.",
            },
          },
          {
            element: ".tour-users-edit-btn",
            popover: {
              title: "Botón de editar usuario",
              description:
                "Permite modificar los datos principales del usuario seleccionado. <br><strong>Ejemplo:</strong> cambiar su nombre de usuario.",
            },
          },
          {
            element: ".tour-users-disable-btn",
            popover: {
              title: "Botón de desactivar usuario",
              description:
                "Cambia el estado del usuario para impedir su acceso temporalmente. <br><strong>Ejemplo:</strong> desactivar una cuenta inactiva.",
            },
          },
        ];

      case "admin-usuarios-crear":
      case "admin-usuarios-editar":
        return [
          {
            element: ".tour-user-form-header",
            popover: {
              title:
                tourKey === "admin-usuarios-editar"
                  ? "Crear Actualizar Usuario"
                  : "Crear Nuevo Usuario",
              description:
                "Encabezado del formulario para registrar o modificar una cuenta de usuario.",
            },
          },
          {
            element: "#email",
            popover: {
              title: "Email",
              description:
                "Dirección de correo que identifica al usuario y se usa para acceso o notificaciones. <br><strong>Ejemplo:</strong> usuario@zoo.com.",
            },
          },
          {
            element: "#username",
            popover: {
              title: "Nombre de usuario",
              description:
                "Nombre corto con el que el usuario iniciará sesión o será reconocido en el sistema. <br><strong>Ejemplo:</strong> jlopez.",
            },
          },
          {
            element: "#rol",
            popover: {
              title: "Rol",
              description:
                "Define los permisos y el alcance de acciones del usuario dentro de la plataforma. <br><strong>Ejemplo:</strong> Veterinario.",
            },
          },
          {
            element: ".tour-user-cancel-btn",
            popover: {
              title: "Botón de cancelar",
              description:
                "Descarta los cambios y vuelve a la lista de usuarios. <br><strong>Ejemplo:</strong> salir sin guardar un registro incompleto.",
            },
          },
          {
            element: ".tour-user-submit-btn",
            popover: {
              title:
                tourKey === "admin-usuarios-editar"
                  ? "Crear Actualizar Usuario"
                  : "Crear Usuario",
              description:
                "Guarda los datos ingresados en el sistema. <br><strong>Ejemplo:</strong> registrar una nueva cuenta o actualizar una existente.",
            },
          },
        ];

      case "admin-permisos-osi":
        return [
          {
            element: ".tour-permissions-title",
            popover: {
              title: "Gestión de permisos por usuario",
              description:
                "Vista para revisar y ajustar los permisos asignados a cada usuario.",
            },
          },
          {
            element: ".tour-permissions-search",
            popover: {
              title: "Buscar por usuario correo",
              description:
                "Filtra la matriz por nombre de usuario, correo o rol. <br><strong>Ejemplo:</strong> escribir admin@zoo.com para ubicar una cuenta.",
            },
          },
          {
            element: ".tour-permissions-refresh-btn",
            popover: {
              title: "Botón de recargar",
              description:
                "Vuelve a cargar la matriz completa para ver cambios recientes. <br><strong>Ejemplo:</strong> refrescar después de modificar un permiso.",
            },
          },
          {
            element: ".tour-permissions-table",
            popover: {
              title: "Tabla",
              description:
                "Muestra los usuarios y sus permisos asociados en columnas comparables.",
            },
          },
          {
            element: ".tour-permissions-col-user",
            popover: {
              title: "Usuario",
              description:
                "Identifica a la persona a la que se le asignan o revisan permisos. <br><strong>Ejemplo:</strong> jlopez / usuario@zoo.com.",
            },
          },
          {
            element: ".tour-permissions-col-role",
            popover: {
              title: "Rol",
              description:
                "Muestra el rol base del usuario para entender su nivel de acceso. <br><strong>Ejemplo:</strong> OSI.",
            },
          },
          {
            element: ".tour-permissions-col-permission",
            popover: {
              title: "Columnas de permisos",
              description:
                "Cada columna representa un permiso del catálogo y permite activarlo o desactivarlo. <br><strong>Ejemplo:</strong> acceso a inventario, auditoría o usuarios.",
            },
          },
          {
            element: ".tour-permissions-col-actions",
            popover: {
              title: "Acciones",
              description:
                "Botón para guardar los cambios realizados en la fila. <br><strong>Ejemplo:</strong> confirmar permisos después de marcar casillas.",
            },
          },
        ];

      case "admin-inventario-producto-crear":
        return [
          {
            element: ".tour-product-step1-header",
            popover: {
              title: "Registrar Nuevo Producto",
              description:
                "Completa la información básica del producto antes de pasar a la imagen. <br><strong>Ejemplo:</strong> Concentrado premium 20 kg.",
            },
          },
          {
            element: "#nombre",
            popover: {
              title: "Nombre del Producto",
              description:
                "Identifica el producto con un nombre claro y único. <br><strong>Ejemplo:</strong> Vitaminas para felinos.",
            },
          },
          {
            element: "#desc",
            popover: {
              title: "Descripción",
              description:
                "Agrega detalles útiles sobre presentación, uso o composición. <br><strong>Ejemplo:</strong> Bolsa de 20 kg para alimentación diaria.",
            },
          },
          {
            element: "#tipo",
            popover: {
              title: "Tipo Producto",
              description:
                "Clasifica el producto dentro del catálogo de inventario. <br><strong>Ejemplo:</strong> Alimentos.",
            },
          },
          {
            element: "#unidad",
            popover: {
              title: "Unidad de Medida",
              description:
                "Selecciona la unidad con la que se controla el stock. <br><strong>Ejemplo:</strong> Kilogramo.",
            },
          },
          {
            element: "#stockMin",
            popover: {
              title: "Stock Mínimo (Alerta)",
              description:
                "Define el umbral mínimo para activar alertas de reposición. <br><strong>Ejemplo:</strong> 5 unidades.",
            },
          },
          {
            element: ".tour-product-step2-header",
            popover: {
              title: "Imagen del Producto",
              description:
                "Sube una imagen para identificar visualmente el producto en el inventario. <br><strong>Ejemplo:</strong> Foto del empaque frontal.",
            },
          },
          {
            element: ".tour-product-file-upload .p-fileupload-content",
            popover: {
              title: "Área para arrastrar imagen",
              description:
                "Arrastra y suelta aquí el archivo que quieras cargar. <br><strong>Ejemplo:</strong> arrastrar imagen PNG desde el escritorio.",
            },
          },
          {
            element: ".tour-product-file-upload .p-fileupload-choose-button",
            popover: {
              title: "Seleccionar Imagen",
              description:
                "Abre el explorador de archivos para elegir una imagen desde tu equipo. <br><strong>Ejemplo:</strong> seleccionar foto del producto.",
            },
          },
          {
            element: ".tour-product-file-upload .p-fileupload-cancel-button",
            popover: {
              title: "Cancelar",
              description:
                "Cancela la selección de imagen actual y limpia la cola de carga. <br><strong>Ejemplo:</strong> quitar un archivo equivocado.",
            },
          },
          {
            element: ".tour-product-back-btn",
            popover: {
              title: "Atrás",
              description:
                "Vuelve al paso anterior para corregir los datos del formulario. <br><strong>Ejemplo:</strong> regresar a la información básica.",
            },
          },
          {
            element: ".tour-product-save-btn",
            popover: {
              title: "Crear Producto",
              description:
                "Guarda el producto en el inventario una vez completada la información. <br><strong>Ejemplo:</strong> registrar un nuevo alimento.",
            },
          },
        ];

      case "admin-inventario-producto-lista":
        return [
          {
            element: ".tour-product-list-header",
            popover: {
              title: "Inventario General",
              description:
                "Vista general para administrar los productos del almacén.",
            },
          },
          {
            element: ".tour-product-report-btn",
            popover: {
              title: "Generar Reporte",
              description:
                "Descarga el reporte kardex o consolidado del inventario. <br><strong>Ejemplo:</strong> exportar resumen mensual.",
            },
          },
          {
            element: ".tour-product-alerts-btn",
            popover: {
              title: "Alertas",
              description:
                "Muestra productos con stock bajo o en estado de alerta. <br><strong>Ejemplo:</strong> identificar artículos críticos.",
            },
          },
          {
            element: ".tour-product-refresh-btn",
            popover: {
              title: "Actualizar / Refrescar",
              description:
                "Recarga la lista para reflejar los datos más recientes. <br><strong>Ejemplo:</strong> volver a consultar el stock.",
            },
          },
          {
            element: ".tour-product-new-btn",
            popover: {
              title: "Nuevo Producto",
              description:
                "Abre el formulario para registrar un nuevo producto. <br><strong>Ejemplo:</strong> crear un insumo faltante.",
            },
          },
          {
            element: ".tour-product-dataview",
            popover: {
              title: "Lista de productos",
              description:
                "Listado principal con tarjetas o lista de productos registrados.",
            },
          },
          {
            element: ".tour-product-layout",
            popover: {
              title: "Cambio de vista",
              description:
                "Alterna entre vista de lista y de tarjetas. <br><strong>Ejemplo:</strong> cambiar a cuadrícula para revisión visual.",
            },
          },
          {
            element: ".tour-product-dataview .p-paginator",
            popover: {
              title: "Paginación",
              description:
                "Navega entre páginas para consultar más productos.",
            },
          },
        ];

      case "admin-inventario-proveedor-crear":
        return [
          {
            element: ".tour-provider-create-header",
            popover: {
              title: "Registrar Nuevo Proveedor",
              description:
                "Completa los datos de contacto del nuevo proveedor. <br><strong>Ejemplo:</strong> Distribuidora Andina S.A.",
            },
          },
          {
            element: "#nombre",
            popover: {
              title: "Nombre de la Empresa o Proveedor",
              description:
                "Nombre comercial o razón social del proveedor. <br><strong>Ejemplo:</strong> Agroinsumos del Sur.",
            },
          },
          {
            element: "#email",
            popover: {
              title: "Correo electrónico",
              description:
                "Dirección de correo para contacto y pedidos. <br><strong>Ejemplo:</strong> ventas@agroinsumos.com.",
            },
          },
          {
            element: "#telefono",
            popover: {
              title: "Teléfono de contacto",
              description:
                "Número principal para comunicación comercial. <br><strong>Ejemplo:</strong> +593 99 123 4567.",
            },
          },
          {
            element: ".tour-provider-cancel-btn",
            popover: {
              title: "Botón Cancelar",
              description:
                "Descarta los cambios y regresa a la lista de proveedores.",
            },
          },
          {
            element: ".tour-provider-save-btn",
            popover: {
              title: "Guardar",
              description:
                "Registra el proveedor en el sistema. <br><strong>Ejemplo:</strong> guardar el nuevo distribuidor.",
            },
          },
        ];

      case "admin-inventario-proveedor-lista":
        return [
          {
            element: ".tour-provider-list-header",
            popover: {
              title: "Gestión de Proveedores",
              description:
                "Lista central para administrar los proveedores del inventario.",
            },
          },
          {
            element: ".tour-provider-total",
            popover: {
              title: "Total de proveedores",
              description:
                "Indica cuántos proveedores están registrados actualmente.",
            },
          },
          {
            element: ".tour-provider-dataview",
            popover: {
              title: "Lista de los proveedores",
              description:
                "Visualiza el detalle y acciones disponibles de cada proveedor.",
            },
          },
          {
            element: ".tour-provider-layout",
            popover: {
              title: "Cambio de vista",
              description:
                "Alterna entre vista de lista y tarjetas para revisar proveedores.",
            },
          },
          {
            element: ".tour-provider-dataview .p-paginator",
            popover: {
              title: "Paginación",
              description:
                "Permite navegar por páginas de resultados.",
            },
          },
          {
            element: ".tour-provider-refresh-btn",
            popover: {
              title: "Botón Actualizar",
              description:
                "Recarga la lista de proveedores. <br><strong>Ejemplo:</strong> ver nuevos registros.",
            },
          },
          {
            element: ".tour-provider-new-btn",
            popover: {
              title: "Nuevo proveedor",
              description:
                "Abre el formulario para crear un nuevo proveedor.",
            },
          },
        ];

      case "admin-inventario-tipo-lista":
        return [
          {
            element: ".tour-type-list-header",
            popover: {
              title: "Tipos de Producto",
              description:
                "Catálogo para administrar los tipos/categorías de productos.",
            },
          },
          {
            element: ".tour-type-total",
            popover: {
              title: "Total de tipos",
              description:
                "Cantidad total de tipos disponibles en el catálogo.",
            },
          },
          {
            element: ".tour-type-dataview",
            popover: {
              title: "Lista de los tipos",
              description:
                "Muestra todos los tipos con acciones de edición y eliminación.",
            },
          },
          {
            element: ".tour-type-layout",
            popover: {
              title: "Parte para cambiar la vista",
              description:
                "Permite alternar entre lista y tarjetas para revisar los tipos.",
            },
          },
          {
            element: ".tour-type-dataview .p-paginator",
            popover: {
              title: "Paginación",
              description:
                "Navega entre páginas del catálogo.",
            },
          },
          {
            element: ".tour-type-refresh-btn",
            popover: {
              title: "Botón Actualizar",
              description:
                "Recarga la lista para ver cambios recientes.",
            },
          },
          {
            element: ".tour-type-new-btn",
            popover: {
              title: "Nuevo tipo",
              description:
                "Abre el formulario para crear un nuevo tipo de producto.",
            },
          },
        ];

      case "admin-inventario-unidad-lista":
        return [
          {
            element: ".tour-unit-list-header",
            popover: {
              title: "Unidades de Medida",
              description:
                "Catálogo de unidades utilizadas para controlar inventario y stock.",
            },
          },
          {
            element: ".tour-unit-total",
            popover: {
              title: "Total de unidades",
              description:
                "Número total de unidades registradas.",
            },
          },
          {
            element: ".tour-unit-dataview",
            popover: {
              title: "Lista de las unidades",
              description:
                "Muestra nombre, abreviatura y acciones de cada unidad.",
            },
          },
          {
            element: ".tour-unit-layout",
            popover: {
              title: "Parte para cambiar la vista",
              description:
                "Alterna el formato visual de la lista.",
            },
          },
          {
            element: ".tour-unit-dataview .p-paginator",
            popover: {
              title: "Paginación",
              description:
                "Permite recorrer páginas de unidades.",
            },
          },
          {
            element: ".tour-unit-refresh-btn",
            popover: {
              title: "Botón Actualizar",
              description:
                "Recarga la información mostrada.",
            },
          },
          {
            element: ".tour-unit-new-btn",
            popover: {
              title: "Nueva unidad",
              description:
                "Abre el formulario para crear una nueva unidad de medida.",
            },
          },
        ];

      case "admin-inventario-unidad-crear":
        return [
          {
            element: ".tour-unit-create-header",
            popover: {
              title: "Nueva Unidad de Medida",
              description:
                "Formulario para registrar una unidad nueva. <br><strong>Ejemplo:</strong> Kilogramo.",
            },
          },
          {
            element: "#nombre",
            popover: {
              title: "Nombre completo",
              description:
                "Nombre formal de la unidad. <br><strong>Ejemplo:</strong> Litro.",
            },
          },
          {
            element: "#abreviatura",
            popover: {
              title: "Símbolo/Abreviatura",
              description:
                "Abreviatura usada en reportes y stock. <br><strong>Ejemplo:</strong> Kg.",
            },
          },
          {
            element: ".tour-unit-cancel-btn",
            popover: {
              title: "Botón Cancelar",
              description:
                "Descarta la edición y vuelve a la lista.",
            },
          },
          {
            element: ".tour-unit-save-btn",
            popover: {
              title: "Botón Guardar",
              description:
                "Guarda la nueva unidad de medida en el catálogo.",
            },
          },
        ];

      case "admin-inventario-historial":
        return [
          {
            element: ".tour-historial-header",
            popover: {
              title: "Movimientos de Inventario",
              description:
                "Consulta los movimientos de entrada y salida del almacén.",
            },
          },
          {
            element: ".tour-historial-new-entry-btn",
            popover: {
              title: "Nueva entrada",
              description:
                "Abre el formulario para registrar compras o ingresos al inventario.",
            },
          },
          {
            element: ".tour-historial-new-exit-btn",
            popover: {
              title: "Nueva salida",
              description:
                "Abre el formulario para registrar consumos o egresos.",
            },
          },
          {
            element: ".tour-historial-tabs",
            popover: {
              title: "Entradas y Salidas",
              description:
                "Cambia entre movimientos de compras y de consumo.",
            },
          },
          {
            element: ".tour-historial-page",
            popover: {
              title: "Vista completa de la página",
              description:
                "Contenido principal del historial con sus tablas y filtros.",
            },
          },
          {
            element: ".tour-historial-entradas-table",
            popover: {
              title: "Tabla de Entradas",
              description:
                "Listado de compras/ingresos del inventario.",
            },
          },
          {
            element: ".tour-historial-entradas-id",
            popover: {
              title: "Columna: Id",
              description: "Identificador único del movimiento.",
            },
          },
          {
            element: ".tour-historial-entradas-fecha",
            popover: {
              title: "Columna: Fecha",
              description: "Fecha y hora del registro.",
            },
          },
          {
            element: ".tour-historial-entradas-proveedor",
            popover: {
              title: "Columna: Proveedor",
              description: "Proveedor asociado a la entrada.",
            },
          },
          {
            element: ".tour-historial-entradas-registrado",
            popover: {
              title: "Columna: Registrado por",
              description: "Usuario que hizo el registro.",
            },
          },
          {
            element: ".tour-historial-entradas-total",
            popover: {
              title: "Columna: Total Items",
              description: "Cantidad total de productos en la entrada.",
            },
          },
          {
            element: ".tour-historial-entradas-acciones",
            popover: {
              title: "Columna: Acciones",
              description: "Acciones disponibles sobre cada movimiento.",
            },
          },
          {
            element: ".tour-historial-tab-salidas",
            popover: {
              title: "Salidas (Consumo)",
              description:
                "Selecciona esta pestaña para ver los egresos de inventario.",
              onNextClick: () => {
                const el = document.querySelector(
                  ".tour-historial-tab-salidas button, .tour-historial-tab-salidas",
                ) as HTMLElement | null;
                el?.click();
                setTimeout(() => this.driverRef?.moveNext(), 250);
              },
            },
          },
          {
            element: ".tour-historial-salidas-table",
            popover: {
              title: "Tabla de Salidas",
              description:
                "Listado de consumos o egresos del almacén.",
            },
          },
          {
            element: ".tour-historial-salidas-id",
            popover: {
              title: "Columna: Id",
              description: "Identificador único del movimiento.",
            },
          },
          {
            element: ".tour-historial-salidas-fecha",
            popover: {
              title: "Columna: Fecha",
              description: "Fecha y hora del registro.",
            },
          },
          {
            element: ".tour-historial-salidas-motivo",
            popover: {
              title: "Columna: Motivo",
              description: "Tipo o razón de la salida.",
            },
          },
          {
            element: ".tour-historial-salidas-registrado",
            popover: {
              title: "Columna: Registrado por",
              description: "Usuario que realizó la salida.",
            },
          },
          {
            element: ".tour-historial-salidas-total",
            popover: {
              title: "Columna: Total Items",
              description: "Cantidad total de artículos egresados.",
            },
          },
          {
            element: ".tour-historial-salidas-acciones",
            popover: {
              title: "Columna: Acciones",
              description: "Acciones disponibles sobre la salida.",
            },
          },
        ];

      case "admin-inventario-entrada-crear":
        return [
          {
            element: ".tour-entrada-header",
            popover: {
              title: "Registrar Entrada",
              description:
                "Formulario para ingresar productos al almacén. <br><strong>Ejemplo:</strong> compra de alimento para animales.",
            },
          },
          {
            element: ".tour-entrada-proveedor-section",
            popover: {
              title: "Datos del Proveedor",
              description:
                "Selecciona el proveedor responsable del ingreso. <br><strong>Ejemplo:</strong> Agroinsumos del Sur.",
            },
          },
          {
            element: "p-select[inputid='proveedor']",
            popover: {
              title: "Proveedor",
              description:
                "Asocia la entrada con el proveedor correcto. <br><strong>Ejemplo:</strong> Distribuidora Andina.",
            },
          },
          {
            element: ".tour-entrada-products-section",
            popover: {
              title: "Productos a Ingresar",
              description:
                "Tabla con las filas que componen la entrada.",
            },
          },
          {
            element: ".tour-entrada-add-row-btn",
            popover: {
              title: "Agregar fila",
              description:
                "Añade otra línea de producto a la entrada. <br><strong>Ejemplo:</strong> registrar dos productos distintos.",
            },
          },
          {
            element: "p-select[formcontrolname='productoId']",
            popover: {
              title: "Producto",
              description:
                "Selecciona el producto que ingresará al inventario. <br><strong>Ejemplo:</strong> alimento balanceado.",
            },
          },
          {
            element: "p-inputnumber[formcontrolname='cantidad']",
            popover: {
              title: "Cantidad",
              description:
                "Indica cuántas unidades o kilos ingresan. <br><strong>Ejemplo:</strong> 25.",
            },
          },
          {
            element: "input[formcontrolname='lote']",
            popover: {
              title: "Lote",
              description:
                "Referencia de trazabilidad del lote recibido. <br><strong>Ejemplo:</strong> LOTE-2026-04.",
            },
          },
          {
            element: "p-datepicker[formcontrolname='fechaCaducidad']",
            popover: {
              title: "Vencimiento",
              description:
                "Fecha de caducidad del producto recibido. <br><strong>Ejemplo:</strong> 2026-12-31.",
            },
          },
          {
            element: ".tour-entrada-cancel-btn",
            popover: {
              title: "Cancelar",
              description:
                "Cancela la operación y vuelve al historial.",
            },
          },
          {
            element: ".tour-entrada-submit-btn",
            popover: {
              title: "Registrar Entrada",
              description:
                "Guarda la entrada y actualiza el inventario.",
            },
          },
        ];

      case "admin-inventario-salida-crear":
        return [
          {
            element: ".tour-salida-header",
            popover: {
              title: "Registrar Salida",
              description:
                "Formulario para registrar consumos o egresos del almacén. <br><strong>Ejemplo:</strong> entrega de insumos al área de nutrición.",
            },
          },
          {
            element: ".tour-salida-general-section",
            popover: {
              title: "Datos Generales",
              description:
                "Selecciona el motivo o tipo de la salida y añade observaciones si aplica.",
            },
          },
          {
            element: "p-select[inputid='tipo']",
            popover: {
              title: "Motivo de Salida",
              description:
                "Define por qué se realiza el egreso. <br><strong>Ejemplo:</strong> Consumo interno.",
            },
          },
          {
            element: "textarea[id='obs']",
            popover: {
              title: "Observaciones (opcional)",
              description:
                "Agrega notas adicionales sobre la salida. <br><strong>Ejemplo:</strong> entrega parcial al área de alimentación.",
            },
          },
          {
            element: ".tour-salida-products-section",
            popover: {
              title: "Detalle de Productos",
              description:
                "Tabla con los productos y su destino específico.",
            },
          },
          {
            element: ".tour-salida-add-item-btn",
            popover: {
              title: "Agregar Item",
              description:
                "Añade otra fila al detalle de salida. <br><strong>Ejemplo:</strong> incluir otro producto.",
            },
          },
          {
            element: "p-select[formcontrolname='productoId']",
            popover: {
              title: "Producto",
              description:
                "Selecciona el producto que saldrá del inventario. <br><strong>Ejemplo:</strong> desinfectante.",
            },
          },
          {
            element: "p-inputnumber[formcontrolname='cantidad']",
            popover: {
              title: "Cantidad",
              description:
                "Indica la cantidad a descontar del stock. <br><strong>Ejemplo:</strong> 3 unidades.",
            },
          },
          {
            element: "p-select[formcontrolname='tipoDestino']",
            popover: {
              title: "Tipo destino",
              description:
                "Define si el consumo corresponde a un animal, un hábitat o uso general.",
            },
          },
          {
            element: "p-select[formcontrolname='destinoId']",
            popover: {
              title: "Destino Específico",
              description:
                "Selecciona el animal o hábitat afectado cuando aplique. <br><strong>Ejemplo:</strong> hábitat Sabana Africana.",
            },
          },
          {
            element: ".tour-salida-cancel-btn",
            popover: {
              title: "Cancelar",
              description:
                "Cancela la salida y regresa al historial.",
            },
          },
          {
            element: ".tour-salida-submit-btn",
            popover: {
              title: "Confirmar salida",
              description:
                "Guarda la salida y descuenta el inventario.",
            },
          },
        ];

      default:
        return [];
    }
  }
}
