import { HttpClient } from "@angular/common/http";
import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Router } from "@angular/router";
import { environment } from "@env";
import { DriveStep, driver } from "driver.js";
import { take } from "rxjs";

export type AdminTourKey =
  | "public-inicio"
  | "public-animales"
  | "public-quizzes"
  | "public-encuestas"
  | "public-acerca-de"
  | "profile"
  | "settings-perfil"
  | "settings-seguridad"
  | "settings-notificaciones"
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
  | "admin-inventario-salida-crear"
  | "admin-encuestas-lista"
  | "admin-encuestas-crear"
  | "admin-auditoria-lista"
  | "vet-historiales-lista"
  | "vet-historiales-crear"
  | "vet-tipos-atencion-lista"
  | "vet-tipos-atencion-crear"
  | "vet-tipos-examen-lista"
  | "vet-tipos-examen-crear"
  | "vet-dietas-lista"
  | "vet-dietas-crear"
  | "vet-mis-tareas"
  | "cuidador-mis-tareas";

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

    if (url === "/inicio" || url === "/") {
      return "public-inicio";
    }
    if (url.startsWith("/animales")) {
      return "public-animales";
    }
    if (url.startsWith("/quizzes")) {
      return "public-quizzes";
    }
    if (url.startsWith("/encuestas")) {
      return "public-encuestas";
    }
    if (url.startsWith("/acerca-de")) {
      return "public-acerca-de";
    }
    if (url.startsWith("/perfil")) {
      return "profile";
    }
    if (url.startsWith("/ajustes/perfil")) {
      return "settings-perfil";
    }
    if (url.startsWith("/ajustes/seguridad")) {
      return "settings-seguridad";
    }
    if (url.startsWith("/ajustes/notificaciones")) {
      return "settings-notificaciones";
    }

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
    if (url.startsWith("/admin/encuestas/crear")) {
      return "admin-encuestas-crear";
    }
    if (url.startsWith("/admin/encuestas/lista") || url === "/admin/encuestas" || url.startsWith("/admin/encuestas")) {
      return "admin-encuestas-lista";
    }
    if (url.startsWith("/admin/audit") || url.startsWith("/admin/auditoria")) {
      return "admin-auditoria-lista";
    }
    if (url.startsWith("/vet/historiales/crear")) {
      return "vet-historiales-crear";
    }
    if (url.startsWith("/vet/historiales/configuracion/tipos-atencion")) {
      return "vet-tipos-atencion-lista";
    }
    if (url.startsWith("/vet/historiales/configuracion/tipos-examen")) {
      return "vet-tipos-examen-lista";
    }
    if (url.startsWith("/vet/historiales/lista") || url.startsWith("/vet/historiales")) {
      return "vet-historiales-lista";
    }
    if (url.startsWith("/vet/dietas/crear")) {
      return "vet-dietas-crear";
    }
    if (url.startsWith("/vet/dietas/lista") || url.startsWith("/vet/dietas")) {
      return "vet-dietas-lista";
    }
    if (url.startsWith("/cuidador/mis-tareas")) {
      return "cuidador-mis-tareas";
    }
    if (url.startsWith("/vet/mis-tareas")) {
      return "vet-mis-tareas";
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
      case "public-inicio":
        return [
          {
            element: ".tour-public-home-badge-row",
            popover: {
              title: "Inicio del recorrido",
              description:
                "Desde aqui puedes iniciar el tour cuando quieras para conocer cada bloque de la pagina principal.",
            },
          },
          {
            element: ".tour-public-home-hero-title",
            popover: {
              title: "Presentacion principal",
              description:
                "Este mensaje introduce la propuesta del refugio y su enfoque de conservacion.",
            },
          },
          {
            element: ".tour-public-home-gallery",
            popover: {
              title: "Galeria visual",
              description:
                "Muestra imagenes destacadas para explorar el entorno y especies del zoologico.",
            },
          },
          {
            element: ".tour-public-home-about-title",
            popover: {
              title: "Sobre nosotros",
              description:
                "Seccion para conocer la identidad del refugio y su historia de conservacion.",
            },
          },
          {
            element: ".tour-public-home-programs",
            popover: {
              title: "Programas",
              description:
                "Aqui se detallan los bloques de actividades, educacion y conservacion disponibles.",
            },
          },
          {
            element: ".tour-public-home-cta",
            popover: {
              title: "Llamado a la accion",
              description:
                "Acceso rapido para planificar una visita y apoyar los programas del refugio.",
            },
          },
          {
            element: ".tour-public-home-news",
            popover: {
              title: "Noticias",
              description:
                "Panel de actualizaciones sobre rescates, eventos y novedades institucionales.",
            },
          },
          {
            element: ".tour-public-home-weather",
            popover: {
              title: "Clima",
              description:
                "Resumen meteorologico para planificar una visita con mejores condiciones.",
            },
          },
          {
            element: ".tour-public-home-contact",
            popover: {
              title: "Contacto",
              description:
                "Bloque para enviar consultas directas al equipo del zoologico.",
            },
          },
          {
            element: ".tour-public-home-contact-name",
            popover: {
              title: "Campo Nombre Completo",
              description:
                "Escribe el nombre de quien realiza la consulta. <br><strong>Ejemplo:</strong> Maria Perez.",
            },
          },
          {
            element: ".tour-public-home-contact-email",
            popover: {
              title: "Campo Correo Electronico",
              description:
                "Ingresa un correo valido para recibir respuesta. <br><strong>Ejemplo:</strong> maria.perez@gmail.com.",
            },
          },
          {
            element: ".tour-public-home-contact-subject",
            popover: {
              title: "Campo Asunto",
              description:
                "Resume el motivo del mensaje. <br><strong>Ejemplo:</strong> Consulta sobre horarios de visita.",
            },
          },
          {
            element: ".tour-public-home-contact-message",
            popover: {
              title: "Campo Mensaje",
              description:
                "Describe tu solicitud con detalle. <br><strong>Ejemplo:</strong> Deseo agendar una visita guiada para 20 estudiantes.",
            },
          },
          {
            element: ".tour-public-home-social",
            popover: {
              title: "Redes sociales",
              description:
                "Accesos a nuestros canales oficiales para seguir noticias y contenido educativo.",
            },
          },
        ];

      case "public-animales":
        return [
          {
            element: ".tour-public-animales-header",
            popover: {
              title: "Conoce a nuestros Amigos",
              description:
                "Encabezado principal con acceso al tour y resumen de la experiencia.",
            },
          },
          {
            element: ".tour-public-animales-grid",
            popover: {
              title: "Catalogo de animales",
              description:
                "Aqui se muestran las fichas con informacion de cada especie y ejemplar disponible.",
            },
          },
          {
            element: ".tour-public-animales-infinite",
            popover: {
              title: "Carga progresiva",
              description:
                "Al desplazarte, se cargan mas animales automaticamente para explorar sin interrupciones.",
            },
          },
          {
            element: ".tour-public-animales-end-message",
            popover: {
              title: "Fin del listado",
              description:
                "Mensaje que confirma que ya conociste todos los animales disponibles por ahora.",
            },
          },
        ];

      case "public-quizzes":
        return [
          {
            element: ".tour-public-quizzes-header",
            popover: {
              title: "Centro de Trivias",
              description:
                "Desde este encabezado puedes iniciar el tour y entender como armar tu desafio.",
            },
          },
          {
            element: ".tour-public-quizzes-difficulty",
            popover: {
              title: "Dificultad",
              description:
                "Selecciona el nivel del reto. <br><strong>Ejemplo:</strong> Facil para principiantes.",
            },
          },
          {
            element: ".tour-public-quizzes-questions",
            popover: {
              title: "Preguntas",
              description:
                "Define la cantidad de preguntas del juego. <br><strong>Ejemplo:</strong> 5 preguntas para una ronda rapida.",
            },
          },
          {
            element: ".tour-public-quizzes-generate",
            popover: {
              title: "Generar desafio",
              description:
                "Crea una trivia personalizada segun la configuracion seleccionada.",
            },
          },
        ];

      case "public-encuestas":
        return [
          {
            element: ".tour-public-encuestas-header",
            popover: {
              title: "Centro de Encuestas",
              description:
                "Aqui puedes iniciar el tour y descubrir las encuestas activas del refugio.",
            },
          },
          {
            element: ".tour-public-encuestas-grid",
            popover: {
              title: "Listado de encuestas",
              description:
                "Seccion donde se muestran todas las encuestas disponibles para responder.",
            },
          },
          {
            element: ".tour-public-encuestas-card",
            popover: {
              title: "Tarjeta de encuesta",
              description:
                "Cada tarjeta incluye titulo, descripcion, estado y vigencia de la encuesta.",
            },
          },
          {
            element: ".tour-public-encuestas-action",
            popover: {
              title: "Boton de accion",
              description:
                "Permite iniciar o revisar una encuesta segun su disponibilidad actual.",
            },
          },
        ];

      case "public-acerca-de":
        return [
          {
            element: ".tour-public-about-legacy-row",
            popover: {
              title: "El Legado de Elias Thorne",
              description:
                "Desde este encabezado puedes iniciar el tour y conocer la historia fundacional.",
            },
          },
          {
            element: ".tour-public-about-refugio",
            popover: {
              title: "Mas que un zoologico, un Refugio",
              description:
                "Bloque principal que resume el proposito etico y de conservacion del proyecto.",
            },
          },
          {
            element: ".tour-public-about-origen",
            popover: {
              title: "Nuestro Origen",
              description:
                "Relata el inicio de la iniciativa y su evolucion como santuario.",
            },
          },
          {
            element: ".tour-public-about-mision",
            popover: {
              title: "Nuestra Mision",
              description:
                "Describe como se combina innovacion y bienestar animal en el trabajo diario.",
            },
          },
          {
            element: ".tour-public-about-vision",
            popover: {
              title: "Nuestra Vision",
              description:
                "Explica el objetivo de conectar sociedad y naturaleza a largo plazo.",
            },
          },
          {
            element: ".tour-public-about-features",
            popover: {
              title: "Features Strip",
              description:
                "Indicadores clave de la filosofia del refugio: bienestar, transparencia, educacion e innovacion.",
            },
          },
          {
            element: ".tour-public-about-story",
            popover: {
              title: "El Hombre que Escuchaba la Selva",
              description:
                "Introduccion narrativa del legado de Elias y el contexto historico.",
            },
          },
          {
            element: ".tour-public-about-timeline",
            popover: {
              title: "Linea de tiempo",
              description:
                "Recorrido cronologico de hitos desde los origenes hasta la era ZooConnect.",
            },
          },
        ];

      case "settings-perfil":
        return [
          {
            element: ".tour-settings-perfil-header",
            popover: {
              title: "Perfil y Apariencia",
              description:
                "Sección principal para personalizar tu identidad visual y la estética de la aplicación.",
            },
          },
          {
            element: ".tour-settings-photo-section",
            popover: {
              title: "Foto de Perfil",
              description:
                "Configura la imagen que te representará en toda la plataforma. <br><strong>Ejemplo:</strong> Cambia tu avatar por uno que refleje tu personalidad.",
            },
          },
          {
            element: ".tour-settings-avatar-current",
            popover: {
              title: "Avatar Actual",
              description:
                "Visualiza la imagen que tienes seleccionada actualmente como perfil. <br><strong>Ejemplo:</strong> Tu icono actual de usuario.",
            },
          },
          {
            element: ".tour-settings-avatar-gallery",
            popover: {
              title: "Avatares Disponibles",
              description:
                "Explora y selecciona un nuevo diseño entre nuestra colección de iconos exclusivos. <br><strong>Ejemplo:</strong> Elige un animal diferente para tu perfil.",
            },
          },
          {
            element: ".tour-settings-appearance-section",
            popover: {
              title: "Apariencia",
              description:
                "Personaliza los ajustes visuales para mejorar tu comodidad al navegar.",
            },
          },
          {
            element: ".tour-settings-dark-mode",
            popover: {
              title: "Modo Oscuro",
              description:
                "Activa o desactiva el tema oscuro para reducir la fatiga visual en entornos de poca luz. <br><strong>Ejemplo:</strong> Actívalo por la noche para una mejor experiencia.",
            },
          },
        ];

      case "settings-seguridad":
        return [
          {
            element: ".tour-settings-seguridad-header",
            popover: {
              title: "Seguridad de la Cuenta",
              description:
                "Administra las capas de protección y acceso de tu cuenta.",
            },
          },
          {
            element: ".tour-settings-auth-section",
            popover: {
              title: "Autenticación",
              description:
                "Configura los métodos de verificación para iniciar sesión de forma segura. <br><strong>Ejemplo:</strong> Gestión de contraseñas y doble factor.",
            },
          },
          {
            element: ".tour-settings-2fa",
            popover: {
              title: "Autenticación de Dos Factores (2FA)",
              description:
                "Protege tu cuenta exigiendo un código adicional al entrar. <br><strong>Ejemplo:</strong> Escanea el código QR con Google Authenticator.",
            },
          },
        ];

      case "settings-notificaciones":
        return [
          {
            element: ".tour-settings-notifications-header",
            popover: {
              title: "Preferencias de Notificación",
              description:
                "Elige cómo y de qué temas deseas recibir alertas del zoológico.",
            },
          },
          {
            element: ".tour-settings-channels-section",
            popover: {
              title: "Canales de Notificación",
              description:
                "Configura las plataformas a través de las cuales te enviaremos mensajes. <br><strong>Ejemplo:</strong> Correo, Push o Mensajería instantánea.",
            },
          },
          {
            element: ".tour-settings-push",
            popover: {
              title: "Notificaciones Push",
              description:
                "Recibe alertas directas en tu navegador o dispositivo móvil al instante. <br><strong>Ejemplo:</strong> Un aviso flotante sobre un nuevo evento.",
            },
          },
          {
            element: ".tour-settings-email",
            popover: {
              title: "Notificaciones por Correo",
              description:
                "Recibe resúmenes y noticias importantes en tu bandeja de entrada. <br><strong>Ejemplo:</strong> Reporte semanal de tus participaciones.",
            },
          },
          {
            element: ".tour-settings-telegram",
            popover: {
              title: "Notificaciones por Telegram",
              description:
                "Conecta tu cuenta para recibir alertas rápidas vía bot de Telegram. <br><strong>Ejemplo:</strong> Un mensaje directo con noticias del Zoo.",
            },
          },
          {
            element: ".tour-settings-whatsapp",
            popover: {
              title: "Notificaciones por WhatsApp",
              description:
                "Alertas críticas y recordatorios directamente a tu WhatsApp personal. <br><strong>Ejemplo:</strong> Recordatorio de una encuesta pendiente.",
            },
          },
          {
            element: ".tour-settings-types-section",
            popover: {
              title: "Tipos de Notificación",
              description:
                "Filtra los contenidos de interés para no perderte lo que más te importa. <br><strong>Ejemplo:</strong> Eventos, noticias o animales.",
            },
          },
          {
            element: ".tour-settings-new-events",
            popover: {
              title: "Nuevos Eventos",
              description:
                "Infórmate sobre las próximas actividades y calendarios del refugio. <br><strong>Ejemplo:</strong> Apertura de nueva zona de hábitat.",
            },
          },
          {
            element: ".tour-settings-animal-updates",
            popover: {
              title: "Actualizaciones de Animales",
              description:
                "Sigue el estado y novedades de tus animales favoritos. <br><strong>Ejemplo:</strong> Nacimiento de un nuevo ejemplar.",
            },
          },
          {
            element: ".tour-settings-quiz-surveys",
            popover: {
              title: "Quizzes y Encuestas",
              description:
                "Entérate cuando haya nuevos desafíos o consultas para participar. <br><strong>Ejemplo:</strong> Trivia mensual sobre fauna silvestre.",
            },
          },
          {
            element: ".tour-settings-zoo-news",
            popover: {
              title: "Noticias del Zoo",
              description:
                "Mantente al día con el blog y las noticias institucionales. <br><strong>Ejemplo:</strong> Avances en proyectos de conservación.",
            },
          },
        ];

      case "profile":
        return [
          {
            element: ".tour-profile-avatar-card",
            popover: {
              title: "Avatar y Nombre",
              description:
                "Aquí puedes ver tu foto de perfil actual y tu nombre de usuario identificador. <br><strong>Ejemplo:</strong> Maria Perez.",
            },
          },
          {
            element: ".tour-profile-edit-btn",
            popover: {
              title: "Botón Editar",
              description:
                "Accede directamente a los ajustes para modificar tu información o apariencia. <br><strong>Ejemplo:</strong> Pulsa para cambiar tu foto.",
            },
          },
          {
            element: ".tour-profile-share-btn",
            popover: {
              title: "Botón Compartir",
              description:
                "Permite generar un enlace para que otros vean tu progreso y perfil. <br><strong>Ejemplo:</strong> Copia el enlace para enviarlo por redes sociales.",
            },
          },
          {
            element: ".tour-profile-participations",
            popover: {
              title: "Mis Participaciones",
              description:
                "Revisa el historial de todas las encuestas y trivias en las que has colaborado. <br><strong>Ejemplo:</strong> Mira cuántos puntos has ganado en trivias.",
            },
          },
          {
            element: ".tour-profile-logout",
            popover: {
              title: "Cerrar Sesión",
              description:
                "Finaliza tu sesión de forma segura en este dispositivo. <br><strong>Ejemplo:</strong> Pulsa antes de salir de un ordenador público.",
            },
          },
        ];

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

      case "admin-encuestas-lista":
        return [
          {
            element: ".tour-encuestas-header",
            popover: {
              title: "Gestión de Encuestas",
              description:
                "Sección principal para administrar todas las encuestas creadas. <br><strong>Ejemplo:</strong> revisar encuestas activas del mes.",
            },
          },
          {
            element: ".tour-encuestas-main-create-btn",
            popover: {
              title: "Botón Crear Encuesta",
              description:
                "Abre el formulario para registrar una nueva encuesta. <br><strong>Ejemplo:</strong> crear encuesta de satisfacción para visitantes.",
            },
          },
          {
            element: ".tour-encuestas-total",
            popover: {
              title: "Total de encuestas",
              description:
                "Muestra cuántas encuestas hay en el listado actual. <br><strong>Ejemplo:</strong> Total: 12 encuestas.",
            },
          },
          {
            element: ".tour-encuestas-dataview",
            popover: {
              title: "Lista de encuestas",
              description:
                "Aquí se visualizan las encuestas con sus acciones disponibles. <br><strong>Ejemplo:</strong> ver, editar o desactivar una encuesta.",
            },
          },
          {
            element:
              ".tour-encuestas-empty-create-btn, .tour-encuestas-main-create-btn",
            popover: {
              title: "Crear primera encuesta",
              description:
                "Este botón aparece cuando no hay registros para iniciar la primera encuesta. <br><strong>Ejemplo:</strong> crear encuesta inicial del sistema.",
            },
          },
          {
            element: ".tour-encuestas-item-edit-btn",
            popover: {
              title: "Editar encuesta",
              description:
                "Permite modificar una encuesta existente desde la lista. <br><strong>Ejemplo:</strong> cambiar fechas o preguntas de una encuesta activa.",
            },
          },
        ];

      case "admin-encuestas-crear":
        return [
          {
            element: ".tour-encuesta-create-header",
            popover: {
              title: "Crear Nueva Encuesta",
              description:
                "Encabezado del formulario de creación de encuesta. <br><strong>Ejemplo:</strong> alta de encuesta para control de calidad.",
            },
          },
          {
            element: ".tour-encuesta-campo-titulo",
            popover: {
              title: "Título (campo)",
              description:
                "Define el nombre principal de la encuesta para identificarla rápidamente. <br><strong>Ejemplo:</strong> Encuesta de bienestar animal.",
            },
          },
          {
            element: ".tour-encuesta-campo-descripcion",
            popover: {
              title: "Descripción (campo)",
              description:
                "Explica el objetivo o alcance de la encuesta. <br><strong>Ejemplo:</strong> Evaluar percepción de limpieza y orden en recintos.",
            },
          },
          {
            element: ".tour-encuesta-campo-fecha-inicio",
            popover: {
              title: "Fecha inicio (campo)",
              description:
                "Indica desde cuándo estará disponible la encuesta. <br><strong>Ejemplo:</strong> 01-05-2026.",
            },
          },
          {
            element: ".tour-encuesta-campo-fecha-fin",
            popover: {
              title: "Fecha fin (campo)",
              description:
                "Define la fecha límite para responder la encuesta. <br><strong>Ejemplo:</strong> 31-05-2026.",
            },
          },
          {
            element: ".tour-encuesta-seccion-preguntas",
            popover: {
              title: "Preguntas",
              description:
                "Bloque donde se administran las preguntas de la encuesta. <br><strong>Ejemplo:</strong> agregar 5 preguntas de opción única.",
            },
          },
          {
            element: ".tour-encuesta-add-question-btn",
            popover: {
              title: "Botón para agregar pregunta",
              description:
                "Añade una nueva pregunta al cuestionario. <br><strong>Ejemplo:</strong> ¿Cómo califica el servicio de guía?.",
            },
          },
          {
            element: ".tour-encuesta-cancel-btn",
            popover: {
              title: "Botón cancelar",
              description:
                "Cancela la operación y regresa al listado sin guardar cambios. <br><strong>Ejemplo:</strong> salir del formulario por datos incompletos.",
            },
          },
          {
            element: ".tour-encuesta-submit-btn",
            popover: {
              title: "Botón crear encuesta",
              description:
                "Guarda la encuesta con sus preguntas y fechas configuradas. <br><strong>Ejemplo:</strong> publicar nueva encuesta institucional.",
            },
          },
        ];

      case "admin-auditoria-lista":
        return [
          {
            element: ".tour-audit-first-row",
            popover: {
              title: "Primera fila de auditoría",
              description:
                "Registro más reciente donde puedes ver evento, usuario y fecha. <br><strong>Ejemplo:</strong> LOGIN_SUCCESS del administrador.",
            },
          },
          {
            element: ".tour-audit-user",
            popover: {
              title: "Usuario",
              description:
                "Identifica qué usuario ejecutó la acción registrada. <br><strong>Ejemplo:</strong> admin@zooconnect.com.",
            },
          },
          {
            element: ".tour-audit-description",
            popover: {
              title: "Descripción",
              description:
                "Muestra el tipo de evento auditado. <br><strong>Ejemplo:</strong> LOGIN_SUCCESS, LOGIN_FAILED o CREATE_USER.",
            },
          },
          {
            element: ".tour-audit-date",
            popover: {
              title: "Fecha",
              description:
                "Fecha y hora en que ocurrió el evento. <br><strong>Ejemplo:</strong> 26 abr 2026, 09:45.",
            },
          },
          {
            element: ".tour-audit-dataview .p-paginator",
            popover: {
              title: "Paginación",
              description:
                "Permite navegar entre páginas del historial de auditoría. <br><strong>Ejemplo:</strong> pasar de página 1 a página 2.",
            },
          },
        ];

      case "vet-historiales-lista":
        return [
          {
            element: ".tour-vet-historiales-header",
            popover: {
              title: "Historiales Clínicos",
              description:
                "Vista principal para consultar el historial clínico de los pacientes. <br><strong>Ejemplo:</strong> revisar el historial abierto de un animal.",
            },
          },
          {
            element: ".tour-vet-historiales-estado-select",
            popover: {
              title: "Estados",
              description:
                "Filtra los historiales por estado clínico. <br><strong>Ejemplo:</strong> mostrar solo historiales en curso.",
            },
          },
          {
            element: ".tour-vet-historiales-refresh-btn",
            popover: {
              title: "Actualizar",
              description:
                "Recarga la información de la lista. <br><strong>Ejemplo:</strong> refrescar los historiales recién creados.",
            },
          },
          {
            element: ".tour-vet-historiales-new-btn",
            popover: {
              title: "Nuevo Historial",
              description:
                "Abre el formulario para iniciar un nuevo historial clínico. <br><strong>Ejemplo:</strong> registrar una consulta de urgencia.",
            },
          },
          {
            element: ".tour-vet-historiales-table",
            popover: {
              title: "Tabla de historiales",
              description:
                "Agrupa los registros clínicos con sus columnas principales.",
            },
          },
          {
            element: ".tour-vet-historiales-col-paciente",
            popover: {
              title: "Paciente",
              description:
                "Identifica al animal atendido. <br><strong>Ejemplo:</strong> Kira, leona adulta.",
            },
          },
          {
            element: ".tour-vet-historiales-col-fecha-tipo",
            popover: {
              title: "Fecha / Tipo",
              description:
                "Muestra cuándo se registró la atención y qué tipo de atención fue. <br><strong>Ejemplo:</strong> 26 abr 2026 • consulta general.",
            },
          },
          {
            element: ".tour-vet-historiales-col-motivo",
            popover: {
              title: "Motivo (Anamnesis)",
              description:
                "Resume el motivo clínico o la anamnesis registrada. <br><strong>Ejemplo:</strong> falta de apetito y letargo.",
            },
          },
          {
            element: ".tour-vet-historiales-col-estado",
            popover: {
              title: "Estado",
              description:
                "Indica si el historial continúa abierto o ya fue cerrado. <br><strong>Ejemplo:</strong> En Curso.",
            },
          },
          {
            element: ".tour-vet-historiales-col-acciones",
            popover: {
              title: "Acciones",
              description:
                "Permite abrir el expediente o descargar la ficha clínica. <br><strong>Ejemplo:</strong> ver detalle completo.",
            },
          },
          {
            element: ".tour-vet-historiales-paginator",
            popover: {
              title: "Paginación",
              description:
                "Navega entre páginas del listado. <br><strong>Ejemplo:</strong> pasar de página 1 a página 2.",
            },
          },
        ];

      case "vet-historiales-crear":
        return [
          {
            element: ".tour-vet-historial-create-header",
            popover: {
              title: "Nuevo Historial Clínico",
              description:
                "Formulario para registrar una consulta clínica nueva. <br><strong>Ejemplo:</strong> apertura de un caso por revisión general.",
            },
          },
          {
            element: ".tour-vet-historial-paciente",
            popover: {
              title: "Paciente (animal)",
              description:
                "Selecciona el animal atendido. <br><strong>Ejemplo:</strong> Kira.",
            },
          },
          {
            element: ".tour-vet-historial-motivo-consulta",
            popover: {
              title: "Motivo de Consulta",
              description:
                "Define el motivo principal de la atención. <br><strong>Ejemplo:</strong> control por pérdida de peso.",
            },
          },
          {
            element: ".tour-vet-historial-peso-actual",
            popover: {
              title: "Peso Actual",
              description:
                "Registra el peso actual del paciente. <br><strong>Ejemplo:</strong> 85.3 kg.",
            },
          },
          {
            element: ".tour-vet-historial-temperatura",
            popover: {
              title: "Temperatura",
              description:
                "Registra la temperatura corporal. <br><strong>Ejemplo:</strong> 38.4 °C.",
            },
          },
          {
            element: ".tour-vet-historial-vitales-section",
            popover: {
              title: "Constantes Vitales",
              description:
                "Sección para registrar signos vitales y anamnesis. <br><strong>Ejemplo:</strong> frecuencia cardíaca y respiratoria.",
            },
          },
          {
            element: ".tour-vet-historial-frecuencia-cardiaca",
            popover: {
              title: "Frecuencia Cardíaca",
              description:
                "Cantidad de latidos por minuto. <br><strong>Ejemplo:</strong> 72 lpm.",
            },
          },
          {
            element: ".tour-vet-historial-frecuencia-respiratoria",
            popover: {
              title: "Frecuencia Respiratoria",
              description:
                "Cantidad de respiraciones por minuto. <br><strong>Ejemplo:</strong> 18 rpm.",
            },
          },
          {
            element: ".tour-vet-historial-anamnesis",
            popover: {
              title: "Anamnesis",
              description:
                "Describe antecedentes y síntomas referidos. <br><strong>Ejemplo:</strong> tos leve desde hace dos días.",
            },
          },
          {
            element: ".tour-vet-historial-examen-section",
            popover: {
              title: "Examen Físico",
              description:
                "Sección para observaciones físicas del paciente. <br><strong>Ejemplo:</strong> mucosas rosadas y buena hidratación.",
            },
          },
          {
            element: ".tour-vet-historial-observaciones",
            popover: {
              title: "Observaciones",
              description:
                "Registra hallazgos del examen físico. <br><strong>Ejemplo:</strong> abdomen blando, sin dolor a la palpación.",
            },
          },
          {
            element: ".tour-vet-historial-diagnosticos-section",
            popover: {
              title: "Diagnósticos Iniciales",
              description:
                "Bloque para registrar hipótesis diagnósticas iniciales. <br><strong>Ejemplo:</strong> gastroenteritis leve.",
            },
          },
          {
            element: ".tour-vet-historial-diagnostico-presuntivo",
            popover: {
              title: "Diagnóstico Presuntivo",
              description:
                "Primer diagnóstico basado en la evaluación inicial. <br><strong>Ejemplo:</strong> infección respiratoria.",
            },
          },
          {
            element: ".tour-vet-historial-diagnostico-definitivo",
            popover: {
              title: "Diagnóstico Definitivo (opcional)",
              description:
                "Resultado final confirmado tras pruebas o evolución clínica. <br><strong>Ejemplo:</strong> bronquitis leve confirmada.",
            },
          },
        ];

      case "vet-tipos-atencion-lista":
        return [
          {
            element: ".tour-vet-tipos-atencion-header",
            popover: {
              title: "Tipos de Atención",
              description:
                "Catálogo para administrar los tipos de atención clínica. <br><strong>Ejemplo:</strong> consulta general o urgencia.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-refresh-btn",
            popover: {
              title: "Actualizar",
              description:
                "Recarga la lista de tipos de atención. <br><strong>Ejemplo:</strong> ver un nuevo tipo recién creado.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-new-btn",
            popover: {
              title: "Nuevo",
              description:
                "Abre el modal para crear un nuevo tipo de atención. <br><strong>Ejemplo:</strong> consulta preventiva.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-table",
            popover: {
              title: "Tabla de tipos de atención",
              description:
                "Agrupa los registros del catálogo con sus acciones disponibles.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-col-nombre",
            popover: {
              title: "Nombre",
              description:
                "Nombre breve del tipo de atención. <br><strong>Ejemplo:</strong> Consulta General.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-col-descripcion",
            popover: {
              title: "Descripción",
              description:
                "Explicación detallada del uso del tipo. <br><strong>Ejemplo:</strong> atención rutinaria sin urgencia.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-col-acciones",
            popover: {
              title: "Acciones",
              description:
                "Permite editar o eliminar el registro seleccionado. <br><strong>Ejemplo:</strong> corregir un nombre incorrecto.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-paginator",
            popover: {
              title: "Paginación",
              description:
                "Navega entre páginas del catálogo. <br><strong>Ejemplo:</strong> pasar a la segunda página.",
            },
          },
        ];

      case "vet-tipos-atencion-crear":
        return [
          {
            element: ".tour-vet-tipos-atencion-dialog-header",
            popover: {
              title: "Nuevo Tipo de Atención",
              description:
                "Modal para registrar o editar un tipo de atención. <br><strong>Ejemplo:</strong> nuevo tipo para chequeo general.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-campo-nombre",
            popover: {
              title: "Nombre",
              description:
                "Nombre del tipo de atención. <br><strong>Ejemplo:</strong> Vacunación.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-campo-descripcion",
            popover: {
              title: "Descripción",
              description:
                "Detalle del tipo de atención. <br><strong>Ejemplo:</strong> Atención preventiva con revisión completa.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-cancel-btn",
            popover: {
              title: "Cancelar",
              description:
                "Cierra el modal sin guardar cambios. <br><strong>Ejemplo:</strong> descartar un formulario incompleto.",
            },
          },
          {
            element: ".tour-vet-tipos-atencion-save-btn",
            popover: {
              title: "Guardar",
              description:
                "Guarda el tipo de atención. <br><strong>Ejemplo:</strong> registrar una nueva consulta especializada.",
            },
          },
        ];

      case "vet-tipos-examen-lista":
        return [
          {
            element: ".tour-vet-tipos-examen-header",
            popover: {
              title: "Tipos de Examen",
              description:
                "Catálogo para administrar los tipos de exámenes clínicos. <br><strong>Ejemplo:</strong> hemograma o coproanálisis.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-refresh-btn",
            popover: {
              title: "Actualizar",
              description:
                "Recarga la lista de tipos de examen. <br><strong>Ejemplo:</strong> ver cambios recientes del catálogo.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-new-btn",
            popover: {
              title: "Nuevo",
              description:
                "Abre el modal para crear un nuevo tipo de examen. <br><strong>Ejemplo:</strong> radiografía torácica.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-table",
            popover: {
              title: "Tabla de tipos de examen",
              description:
                "Agrupa los registros del catálogo y sus acciones.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-col-nombre",
            popover: {
              title: "Nombre",
              description:
                "Nombre corto del examen. <br><strong>Ejemplo:</strong> Hemograma completo.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-col-descripcion",
            popover: {
              title: "Descripción",
              description:
                "Explicación del examen. <br><strong>Ejemplo:</strong> estudio de glóbulos rojos y blancos.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-col-acciones",
            popover: {
              title: "Acciones",
              description:
                "Permite editar o eliminar el registro. <br><strong>Ejemplo:</strong> corregir un nombre duplicado.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-paginator",
            popover: {
              title: "Paginación",
              description:
                "Navega entre páginas del catálogo. <br><strong>Ejemplo:</strong> avanzar a la siguiente página.",
            },
          },
        ];

      case "vet-tipos-examen-crear":
        return [
          {
            element: ".tour-vet-tipos-examen-dialog-header",
            popover: {
              title: "Nuevo Tipo de Examen",
              description:
                "Modal para registrar o editar un tipo de examen. <br><strong>Ejemplo:</strong> nuevo examen de laboratorio.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-campo-nombre",
            popover: {
              title: "Nombre",
              description:
                "Nombre del tipo de examen. <br><strong>Ejemplo:</strong> Uroanálisis.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-campo-descripcion",
            popover: {
              title: "Descripción",
              description:
                "Detalle del examen. <br><strong>Ejemplo:</strong> evaluación de sedimento urinario.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-cancel-btn",
            popover: {
              title: "Cancelar",
              description:
                "Cierra el modal sin guardar cambios. <br><strong>Ejemplo:</strong> abandonar un formulario incompleto.",
            },
          },
          {
            element: ".tour-vet-tipos-examen-save-btn",
            popover: {
              title: "Guardar",
              description:
                "Guarda el tipo de examen. <br><strong>Ejemplo:</strong> registrar análisis de sangre.",
            },
          },
        ];

      case "vet-dietas-lista":
        return [
          {
            element: ".tour-vet-dietas-header",
            popover: {
              title: "Gestión de Dietas",
              description:
                "Vista principal para administrar las dietas nutricionales. <br><strong>Ejemplo:</strong> revisar dietas activas por especie.",
            },
          },
          {
            element: ".tour-vet-dietas-search",
            popover: {
              title: "Buscador de Dieta",
              description:
                "Permite filtrar dietas por nombre. <br><strong>Ejemplo:</strong> escribir dieta felinos.",
            },
          },
          {
            element: ".tour-vet-dietas-refresh-btn",
            popover: {
              title: "Recargar",
              description:
                "Actualiza el listado. <br><strong>Ejemplo:</strong> ver una dieta recién creada.",
            },
          },
          {
            element: ".tour-vet-dietas-new-btn",
            popover: {
              title: "Nueva Dieta",
              description:
                "Abre el formulario para crear una dieta. <br><strong>Ejemplo:</strong> diseñar una dieta para primates.",
            },
          },
          {
            element: ".tour-vet-dietas-total",
            popover: {
              title: "Total Dietas",
              description:
                "Muestra la cantidad de dietas registradas. <br><strong>Ejemplo:</strong> Total: 8 dietas registradas.",
            },
          },
          {
            element: ".tour-vet-dietas-paginator",
            popover: {
              title: "Paginación",
              description:
                "Navega entre páginas del listado. <br><strong>Ejemplo:</strong> pasar de página 1 a 2.",
            },
          },
          {
            element: ".tour-vet-dietas-layout",
            popover: {
              title: "Cambiar la vista",
              description:
                "Alterna entre vista de lista y tarjetas. <br><strong>Ejemplo:</strong> pasar a vista de tarjetas.",
            },
          },
        ];

      case "vet-dietas-crear":
        return [
          {
            element: ".tour-vet-dietas-create-header",
            popover: {
              title: "Nueva Dieta",
              description:
                "Formulario para crear una dieta nutricional. <br><strong>Ejemplo:</strong> dieta balanceada para felinos.",
            },
          },
          {
            element: ".tour-vet-dieta-datos-generales",
            popover: {
              title: "Datos Generales",
              description:
                "Sección con el nombre y asignación principal de la dieta. <br><strong>Ejemplo:</strong> dieta para especie o animal específico.",
            },
          },
          {
            element: ".tour-vet-dieta-nombre",
            popover: {
              title: "Nombre",
              description:
                "Nombre de la dieta. <br><strong>Ejemplo:</strong> Dieta Felinos Standard.",
            },
          },
          {
            element: ".tour-vet-dieta-asignar-a",
            popover: {
              title: "Asignar a",
              description:
                "Define si la dieta será para una especie o un animal. <br><strong>Ejemplo:</strong> asignar a especie.",
            },
          },
          {
            element: ".tour-vet-dieta-especie",
            popover: {
              title: "Seleccionar especie",
              description:
                "Elige la especie objetivo si la dieta es general. <br><strong>Ejemplo:</strong> León africano.",
            },
          },
          {
            element: ".tour-vet-dieta-animal",
            popover: {
              title: "Seleccionar animal",
              description:
                "Elige el animal si la dieta es específica. <br><strong>Ejemplo:</strong> Kira.",
            },
          },
          {
            element: ".tour-vet-dieta-ingredientes-section",
            popover: {
              title: "Ingredientes y Raciones",
              description:
                "Sección para construir la composición de la dieta. <br><strong>Ejemplo:</strong> 3 ingredientes con raciones definidas.",
            },
          },
          {
            element: ".tour-vet-dieta-add-ingredient-btn",
            popover: {
              title: "Agregar Ingrediente",
              description:
                "Añade una nueva fila de ingrediente. <br><strong>Ejemplo:</strong> sumar una segunda proteína.",
            },
          },
          {
            element: ".tour-vet-dieta-producto",
            popover: {
              title: "Producto (Alimento)",
              description:
                "Selecciona el alimento que componen la dieta. <br><strong>Ejemplo:</strong> concentrado premium.",
            },
          },
          {
            element: ".tour-vet-dieta-cantidad",
            popover: {
              title: "Cantidad",
              description:
                "Define la cantidad del ingrediente. <br><strong>Ejemplo:</strong> 2.5 kg.",
            },
          },
          {
            element: ".tour-vet-dieta-unidad",
            popover: {
              title: "Unidad",
              description:
                "Selecciona la unidad de medida del ingrediente. <br><strong>Ejemplo:</strong> kg.",
            },
          },
          {
            element: ".tour-vet-dieta-frecuencia",
            popover: {
              title: "Frecuencia/Notas",
              description:
                "Especifica la frecuencia o notas de entrega. <br><strong>Ejemplo:</strong> diario en la mañana.",
            },
          },
          {
            element: ".tour-vet-dieta-remove-btn",
            popover: {
              title: "Quitar",
              description:
                "Elimina un ingrediente de la tabla. <br><strong>Ejemplo:</strong> quitar una fila duplicada.",
            },
          },
          {
            element: ".tour-vet-dieta-cancel-btn",
            popover: {
              title: "Cancelar",
              description:
                "Descarta los cambios y vuelve a la lista. <br><strong>Ejemplo:</strong> salir sin guardar la dieta.",
            },
          },
          {
            element: ".tour-vet-dieta-save-btn",
            popover: {
              title: "Guardar Dieta",
              description:
                "Guarda la dieta nutricional. <br><strong>Ejemplo:</strong> registrar una nueva dieta para primates.",
            },
          },
        ];

      case "vet-mis-tareas":
      case "cuidador-mis-tareas":
        return [
          {
            element: ".tour-cuidador-mis-tareas-title-row",
            popover: {
              title: "Gestión de Tareas",
              description:
                "Vista principal para revisar tus tareas asignadas. <br><strong>Ejemplo:</strong> completar un control de alimentación.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-filtro",
            popover: {
              title: "Pendientes / Historial",
              description:
                "Permite alternar entre tareas pendientes y tareas completadas. <br><strong>Ejemplo:</strong> revisar el historial de acciones terminadas.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-table",
            popover: {
              title: "Tabla de tareas",
              description:
                "Listado con columnas relevantes para ejecutar y revisar tareas.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-col-numero",
            popover: {
              title: "#",
              description:
                "Número de fila para ubicar rápidamente la tarea. <br><strong>Ejemplo:</strong> 1, 2, 3.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-col-tarea",
            popover: {
              title: "Tarea / Actividad",
              description:
                "Nombre de la actividad clínica u operativa. <br><strong>Ejemplo:</strong> cambio de vendaje.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-col-descripcion",
            popover: {
              title: "Descripción",
              description:
                "Detalle adicional para ejecutar la tarea. <br><strong>Ejemplo:</strong> aplicar antisepsia previa.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-col-fecha",
            popover: {
              title: "Fecha Límite",
              description:
                "Fecha máxima para realizar la tarea. <br><strong>Ejemplo:</strong> 26 abr 2026.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-col-estado",
            popover: {
              title: "Estado",
              description:
                "Indica si la tarea está pendiente o completada. <br><strong>Ejemplo:</strong> Pendiente.",
            },
          },
          {
            element: ".tour-cuidador-mis-tareas-col-acciones",
            popover: {
              title: "Acciones",
              description:
                "Botones para ejecutar o revisar la tarea. <br><strong>Ejemplo:</strong> abrir el formulario de confirmación.",
            },
          },
        ];

      default:
        return [];
    }
  }
}
