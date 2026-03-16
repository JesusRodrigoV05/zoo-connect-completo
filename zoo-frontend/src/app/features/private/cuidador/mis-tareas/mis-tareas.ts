import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { DialogModule } from "primeng/dialog";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
import { SelectButtonModule } from "primeng/selectbutton";
import { MisTareasStore } from "@app/shared/stores/ejecucion-tarea.store";
import { Tarea } from "../../admin/models/tareas/tarea.model";
import { InputNumberModule } from "primeng/inputnumber";
import { DatePipe } from "@angular/common";
import { VetRecetas } from "../../veterinario/services/historiales/vet-recetas";
import { Receta } from "../../veterinario/models/historiales/receta.model";

interface DetalleFormulario {
  productoId: number;
  nombreProducto: string;
  unidad: string;
  cantidadSugerida: number;
  cantidadEntregada: number | null;
  cantidadConsumida: number | null;
}

@Component({
  selector: "app-mis-tareas",
  imports: [
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DialogModule,
    TextareaModule,
    TooltipModule,
    SelectButtonModule,
    InputNumberModule,
    DatePipe,
  ],
  templateUrl: "./mis-tareas.html",
  styleUrl: "./mis-tareas.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MisTareas {
  readonly store = inject(MisTareasStore);
  readonly vetRecetasService = inject(VetRecetas);

  displayDialog = signal(false);
  tareaSeleccionada = signal<Tarea | null>(null);
  observaciones = signal("");
  displayRecetaDialog = signal(false);
  recetaSeleccionada = signal<Receta | null>(null);
  loadingReceta = signal(false);
  errorReceta = signal<string | null>(null);

  formDetalles = signal<DetalleFormulario[]>([]);

  esTareaAlimentacion = computed(() => {
    const tarea = this.tareaSeleccionada();
    return tarea?.tipoTarea?.nombre?.toLowerCase().includes("aliment") || false;
  });
  mostrarCompletadas = signal(false);

  estadoOptions = [
    { label: "Pendientes", value: false },
    { label: "Historial", value: true },
  ];
  constructor() {
    effect(() => {
      const sugerencia = this.store.sugerenciaDieta();

      if (sugerencia && this.displayDialog()) {
        const nuevosDetalles: DetalleFormulario[] =
          sugerencia.detalles_dieta.map((d) => ({
            productoId: d.producto_id,
            nombreProducto: d.producto.nombre_producto,
            unidad: d.producto.unidad_medida.abreviatura,
            cantidadSugerida: parseFloat(d.cantidad),
            cantidadEntregada: parseFloat(d.cantidad),
            cantidadConsumida: null,
          }));

        this.formDetalles.set(nuevosDetalles);
      }
    });
  }

  ngOnInit() {
    this.cargarTareas();
  }

  cargarTareas() {
    this.store.loadMisTareas({ completadas: this.mostrarCompletadas() });
  }

  onFilterChange(event: any) {
    this.mostrarCompletadas.set(event.value);
    this.cargarTareas();
  }

  abrirCompletar(tarea: Tarea) {
    this.tareaSeleccionada.set(tarea);
    this.observaciones.set("");

    this.formDetalles.set([]);
    this.store.resetSugerencia();

    if (tarea.tipoTarea?.nombre?.toLowerCase().includes("aliment")) {
      this.store.loadSugerenciaDieta(tarea.id);
    }

    this.displayDialog.set(true);
  }

  confirmarCompletar() {
    const tarea = this.tareaSeleccionada();
    if (!tarea) return;

    if (this.esTareaAlimentacion()) {
      this.procesarTareaAlimentacion(tarea);
    } else {
      this.procesarTareaSimple(tarea);
    }
  }

  private procesarTareaAlimentacion(tarea: Tarea) {
    const detalles = this.formDetalles();
    if (detalles.length === 0) return;

    const detallesPayload = detalles.map((item) => ({
      productoId: item.productoId,
      cantidadEntregada: item.cantidadEntregada || 0,
      cantidadConsumida: item.cantidadConsumida || 0,
    }));

    const dataPayload = {
      notasObservaciones: this.observaciones(),
      detalles: detallesPayload,
    };

    this.store.completarTareaAlimentacion({
      id: tarea.id,
      data: dataPayload,
    });
    this.displayDialog.set(false);
  }

  private procesarTareaSimple(tarea: Tarea) {
    const dataPayload = {
      notasCompletacion: this.observaciones(),
    };

    this.store.completarTareaSimple({
      id: tarea.id,
      data: dataPayload,
    });
    this.cerrarDialog();
  }

  private cerrarDialog() {
    this.displayDialog.set(false);
  }

  getSeverity(
    estado: string,
  ):
    | "success"
    | "secondary"
    | "info"
    | "warn"
    | "danger"
    | "contrast"
    | null
    | undefined {
    if (estado) {
      return "success";
    } else {
      return "info";
    }
  }

  esTareaDeVerReceta(tarea: Tarea): boolean {
    const descripcion = tarea.descripcion?.toLowerCase();
    const contieneId = descripcion?.includes("receta id");

    const esTipoReceta = tarea.tipoTarea?.id === 2;

    return esTipoReceta && contieneId;
  }
  private extraerRecetaId(descripcion: string): number | null {
    const match = descripcion.match(/receta\s*id\s*(\d+)/i);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  verReceta(tarea: Tarea) {
    this.recetaSeleccionada.set(null);
    this.errorReceta.set(null);
    this.loadingReceta.set(true);
    this.displayRecetaDialog.set(true);

    const recetaId = this.extraerRecetaId(tarea.descripcion);

    if (recetaId === null) {
      this.errorReceta.set(
        "No se pudo extraer el ID de la receta de la descripción.",
      );
      this.loadingReceta.set(false);
      return;
    }

    this.vetRecetasService.getRecetaById(recetaId).subscribe({
      next: (receta) => {
        this.recetaSeleccionada.set(receta);
        this.loadingReceta.set(false);
      },
      error: (err) => {
        console.error("Error al cargar la receta:", err);
        this.errorReceta.set("Error al cargar la receta. Intente más tarde.");
        this.loadingReceta.set(false);
      },
    });
  }
}
