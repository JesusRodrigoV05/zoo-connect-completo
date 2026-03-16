import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { TextareaModule } from "primeng/textarea";
import { SelectModule } from "primeng/select";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TooltipModule } from "primeng/tooltip";
import { ProductStore } from "@app/features/private/admin/stores/admin-productos.store";
import { UnidadesMedidaStore } from "@app/features/private/admin/stores/admin-unidades-medida.store";
import { DatePickerModule } from "primeng/datepicker";
import { SelectButtonModule } from "primeng/selectbutton";
import { AuthStore } from "@stores/auth.store";

@Component({
  selector: "app-crear-receta",
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FormsModule,
    TextareaModule,
    SelectModule,
    ToggleSwitchModule,
    DatePickerModule,
    SelectButtonModule,
    TooltipModule,
  ],
  templateUrl: "./crear-receta.html",
  styleUrl: "./crear-receta.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearReceta {
  readonly store = inject(DetalleClinicoStore);
  readonly productStore = inject(ProductStore);
  readonly unidadesStore = inject(UnidadesMedidaStore);
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  authStore = inject(AuthStore);
  idUsuario = this.authStore.userId();

  frecuenciaOptions = [
    { label: "Cada X Horas", value: "hourly" },
    { label: "Diariamente", value: "daily" },
    { label: "Semanalmente", value: "weekly" },
  ];

  diasSemanaOptions = [
    { label: "Lun", value: "1" },
    { label: "Mar", value: "2" },
    { label: "Mié", value: "3" },
    { label: "Jue", value: "4" },
    { label: "Vie", value: "5" },
    { label: "Sáb", value: "6" },
    { label: "Dom", value: "0" },
  ];

  uiCronType = signal<"hourly" | "daily" | "weekly">("daily");

  uiIntervaloHoras = signal<number>(8);

  uiHoraSeleccionada = signal<Date>(new Date(new Date().setHours(8, 0, 0, 0)));

  uiDiasSeleccionados = signal<string[]>(["1", "3", "5"]);

  form = this.fb.group({
    productoId: [null as number | null, Validators.required],
    unidadMedidaId: [null as number | null, Validators.required],
    dosis: [null as number | null, [Validators.required, Validators.min(0.1)]],
    frecuencia: ["", Validators.required],
    duracionDias: [1, [Validators.required, Validators.min(1)]],
    instrucciones: ["", Validators.required],

    generarTarea: [false],
    frecuenciaCron: [""],
    usuarioAsignadoId: [null as number | null],
  });

  constructor() {
    this.form.controls.generarTarea.valueChanges.subscribe((checked) => {
      const cronControl = this.form.controls.frecuenciaCron;
      const asignadoControl = this.form.controls.usuarioAsignadoId;

      if (checked) {
        cronControl.setValidators([Validators.required]);
        asignadoControl.setValue(this.idUsuario);
        this.recalcularCron();
      } else {
        cronControl.clearValidators();
        cronControl.setValue("");
        asignadoControl.setValue(null);
      }
      cronControl.updateValueAndValidity();
      asignadoControl.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.productStore.setPage(1, 100);
    this.productStore.updateFilters({
      tipoProductoId: 4,
      nombre: null,
    });

    this.productStore.loadProducts();
    this.unidadesStore.setPage(1, 100);
    if (this.form.value.generarTarea) {
      this.recalcularCron();
    }
  }

  recalcularCron() {
    if (!this.form.value.generarTarea) return;

    const type = this.uiCronType();
    let cron = "";

    const date = this.uiHoraSeleccionada();
    const minutes = date ? date.getMinutes() : 0;
    const hours = date ? date.getHours() : 8;

    switch (type) {
      case "hourly":
        const interval = this.uiIntervaloHoras() || 8;
        cron = `0 */${interval} * * *`;
        break;

      case "daily":
        cron = `${minutes} ${hours} * * *`;
        break;

      case "weekly":
        const days = this.uiDiasSeleccionados();
        if (days.length === 0) {
          cron = "";
        } else {
          cron = `${minutes} ${hours} * * ${days.join(",")}`;
        }
        break;
    }

    this.form.patchValue({ frecuenciaCron: cron });
  }

  setType(val: any) {
    this.uiCronType.set(val);
    this.recalcularCron();
  }
  setInterval(val: number) {
    this.uiIntervaloHoras.set(val);
    this.recalcularCron();
  }
  setTime(val: Date) {
    this.uiHoraSeleccionada.set(val);
    this.recalcularCron();
  }
  setDays(val: string[]) {
    this.uiDiasSeleccionados.set(val);
    this.recalcularCron();
  }

  get cronPreview(): string {
    if (!this.form.value.frecuenciaCron) return "Configuración incompleta";

    const type = this.uiCronType();

    if (type === "hourly")
      return `Tarea cada ${this.uiIntervaloHoras()} horas.`;

    const timeStr = this.uiHoraSeleccionada()?.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (type === "daily") return `Tarea todos los días a las ${timeStr}.`;

    if (type === "weekly") {
      const daysCount = this.uiDiasSeleccionados().length;
      return `Tarea a las ${timeStr} los ${daysCount} días seleccionados.`;
    }

    return "Personalizado";
  }

  guardar() {
    if (this.form.value.generarTarea && !this.form.value.frecuenciaCron) {
      this.recalcularCron();
    }

    this.form.controls.usuarioAsignadoId.setValue(
      this.form.value.generarTarea ? this.idUsuario : null,
    );

    if (this.form.invalid) return;

    if (
      this.form.value.generarTarea &&
      this.uiCronType() === "weekly" &&
      this.uiDiasSeleccionados().length === 0
    ) {
      return;
    }

    const finalUsuarioAsignadoId = this.form.value.generarTarea
      ? this.idUsuario
      : null;

    this.store.agregarReceta({
      ...(this.form.value as any),
      productoId: this.form.value.productoId!,
      unidadMedidaId: this.form.value.unidadMedidaId!,
      generarTarea: this.form.value.generarTarea || false,
      frecuenciaCron: this.form.value.frecuenciaCron || "",
      usuarioAsignadoId: finalUsuarioAsignadoId,
    });

    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }
}
