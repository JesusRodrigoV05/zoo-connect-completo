import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { SelectModule } from "primeng/select";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { TooltipModule } from "primeng/tooltip";
import { ChipModule } from "primeng/chip";
import { DatePickerModule } from "primeng/datepicker";
import { SelectButtonModule } from "primeng/selectbutton";
import { InputNumberModule } from "primeng/inputnumber";
import {
  CreateTareaRecurrente,
  TareaRecurrente,
} from "@app/features/private/admin/models/tareas/tarea.model";
import { RecurrentesStore } from "@app/features/private/admin/stores/tareas/admin-recurrentes.store";
import { TiposTareaStore } from "@app/features/private/admin/stores/tareas/admin-tipo-tares.store";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { AdminHabitat } from "@app/features/private/admin/services/admin-habitat";
import { Location } from "@angular/common";
import { FloatLabelModule } from "primeng/floatlabel";
import { CardModule } from "primeng/card";

interface LugarOption {
  label: string;
  value: number | null;
  tipo: "animal" | "habitat" | "general";
}

type FrecuenciaType = "diario" | "semanal" | "mensual" | "avanzado";

@Component({
  selector: "zoo-crear-rutina",
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    ToggleSwitchModule,
    TooltipModule,
    ChipModule,
    DatePickerModule,
    SelectButtonModule,
    InputNumberModule,
    FloatLabelModule,
    CardModule,
  ],
  templateUrl: "./crear-rutina.html",
  styleUrl: "./crear-rutina.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearRutina {
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  readonly store = inject(RecurrentesStore);
  readonly tiposStore = inject(TiposTareaStore);
  private animalesService = inject(AdminAnimales);
  private habitatService = inject(AdminHabitat);

  // Estados
  protected isLoadingData = signal(false);
  protected currentId = signal<number | null>(null);
  protected isEditMode = computed(() => !!this.currentId());

  protected animales = signal<{ label: string; value: number }[]>([]);
  protected habitats = signal<{ label: string; value: number }[]>([]);

  protected lugares = computed<LugarOption[]>(() => [
    { label: "Todas las áreas (General)", value: null, tipo: "general" },
    ...this.animales().map((a) => ({
      label: `Animal: ${a.label}`,
      value: a.value,
      tipo: "animal" as const,
    })),
    ...this.habitats().map((h) => ({
      label: `Hábitat: ${h.label}`,
      value: h.value,
      tipo: "habitat" as const,
    })),
  ]);

  protected pageTitle = computed(() =>
    this.isEditMode() ? "Editar Rutina" : "Nueva Rutina",
  );

  protected isProcessing = computed(() => this.store.isSaving());

  // Configuración UI Cron
  protected frequencyOptions = [
    /* ... tus opciones ... */
  ]; // Definirlas abajo en el constructor o como propiedad estática si prefieres
  protected frecuenciaOptions = [
    { label: "Diariamente", value: "diario", icon: "pi pi-clock" },
    { label: "Semanalmente", value: "semanal", icon: "pi pi-calendar" },
    { label: "Mensualmente", value: "mensual", icon: "pi pi-calendar-plus" },
    { label: "Avanzado (Cron)", value: "avanzado", icon: "pi pi-cog" },
  ];

  protected weekDaysOptions = [
    { label: "Lu", value: 1 },
    { label: "Ma", value: 2 },
    { label: "Mi", value: 3 },
    { label: "Ju", value: 4 },
    { label: "Vi", value: 5 },
    { label: "Sa", value: 6 },
    { label: "Do", value: 0 },
  ];
  protected monthDaysGrid = Array.from({ length: 31 }, (_, i) => i + 1);

  // Formulario
  protected form = this.fb.group({
    titulo: ["", [Validators.required, Validators.minLength(3)]],
    descripcion: [""],
    tipoTareaId: [null as number | null, [Validators.required]],
    lugarSeleccionado: [null as LugarOption | null],
    frecuenciaType: ["diario" as FrecuenciaType],
    horaProgramada: [new Date()],
    diasSemana: [[1, 2, 3, 4, 5] as number[]],
    diaMes: [1],
    frecuenciaCron: ["", [Validators.required]],
  });

  constructor() {
    // Sincronizar UI -> Cron string
    this.form.valueChanges.subscribe((val) => {
      if (val.frecuenciaType !== "avanzado") {
        this.updateCronStringFromUI();
      }
    });
  }

  ngOnInit(): void {
    // 1. Cargar datos necesarios
    this.loadCatalogos();

    // 2. Revisar URL para ver si es Edición
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      this.currentId.set(+idParam);
      this.loadItemData(+idParam);
    } else {
      this.initializeDefaultForm();
    }
  }

  // --- LOGICA DE CARGA ---

  private loadItemData(id: number) {
    // Intentamos buscar en el store primero
    const item = this.store.items().find((i) => i.id === id);

    if (item) {
      // Usamos un effect para esperar a que los dropdowns (lugares) se carguen
      // antes de hacer el patch, para que el objeto seleccionado coincida
      effect(
        () => {
          const opts = this.lugares();
          if (opts.length > 1) {
            // Ya cargó algo más que 'General'
            untracked(() => this.patchFormWithItem(item));
          }
        },
        { allowSignalWrites: true },
      );
    } else {
      // Si no está en el store (F5 directo en la url), recargamos la lista
      // En un caso real ideal, deberías llamar a un servicio getById(id)
      this.store.loadItems();
      // Hack simple: reaccionar cuando cargue
      effect(() => {
        const loadedItem = this.store.items().find((i) => i.id === id);
        const opts = this.lugares();
        if (loadedItem && opts.length > 1) {
          untracked(() => this.patchFormWithItem(loadedItem));
        }
      });
    }
  }

  private patchFormWithItem(item: TareaRecurrente) {
    const options = this.lugares();
    let seleccion: LugarOption | undefined;

    if (item.animalId)
      seleccion = options.find(
        (l) => l.value === item.animalId && l.tipo === "animal",
      );
    else if (item.habitatId)
      seleccion = options.find(
        (l) => l.value === item.habitatId && l.tipo === "habitat",
      );
    else seleccion = options.find((l) => l.tipo === "general");

    this.form.patchValue({
      titulo: item.titulo,
      descripcion: item.descripcion,
      tipoTareaId: item.tipoTareaId,
      lugarSeleccionado: seleccion || null,
      frecuenciaCron: item.frecuenciaCron,
    });

    this.parseCronToUI(item.frecuenciaCron);
  }

  private initializeDefaultForm() {
    this.form.patchValue({
      frecuenciaType: "diario",
      horaProgramada: new Date(),
      diasSemana: [1, 2, 3, 4, 5],
      diaMes: 1,
    });
    this.updateCronStringFromUI();
  }

  private loadCatalogos() {
    this.isLoadingData.set(true);
    this.tiposStore.loadItems();

    Promise.all([
      new Promise<void>((resolve) => {
        this.animalesService.getAllAnimals(1, 100).subscribe((res) => {
          this.animales.set(
            res.items.map((a) => ({ label: a.nombre, value: a.id_animal })),
          );
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        this.habitatService.getAllHabitats(1, 100).subscribe((res) => {
          this.habitats.set(
            res.items.map((h) => ({ label: h.nombre, value: h.id })),
          );
          resolve();
        });
      }),
    ]).finally(() => this.isLoadingData.set(false));
  }

  // --- LOGICA CRON ---

  private updateCronStringFromUI() {
    const type = this.form.get("frecuenciaType")?.value;
    const date = this.form.get("horaProgramada")?.value as Date;
    const weekDays = this.form.get("diasSemana")?.value as number[];
    const monthDay = this.form.get("diaMes")?.value;

    if (!date) return;
    const min = date.getMinutes();
    const hour = date.getHours();
    let cron = "";

    switch (type) {
      case "diario":
        cron = `${min} ${hour} * * *`;
        break;
      case "semanal":
        const daysStr = weekDays && weekDays.length ? weekDays.join(",") : "*";
        cron = `${min} ${hour} * * ${daysStr}`;
        break;
      case "mensual":
        cron = `${min} ${hour} ${monthDay} * *`;
        break;
    }
    this.form.patchValue({ frecuenciaCron: cron }, { emitEvent: false });
  }

  private parseCronToUI(cron: string) {
    if (!cron) return;
    const parts = cron.split(" ");
    if (parts.length < 5) {
      this.form.patchValue({ frecuenciaType: "avanzado" });
      return;
    }

    const [min, hour, dayOfMonth, month, dayOfWeek] = parts;
    const timeDate = new Date();
    timeDate.setHours(parseInt(hour) || 0);
    timeDate.setMinutes(parseInt(min) || 0);

    if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      this.form.patchValue({
        frecuenciaType: "diario",
        horaProgramada: timeDate,
      });
    } else if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
      const days = dayOfWeek.split(",").map((d) => parseInt(d));
      this.form.patchValue({
        frecuenciaType: "semanal",
        horaProgramada: timeDate,
        diasSemana: days,
      });
    } else if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
      this.form.patchValue({
        frecuenciaType: "mensual",
        horaProgramada: timeDate,
        diaMes: parseInt(dayOfMonth),
      });
    } else {
      this.form.patchValue({
        frecuenciaType: "avanzado",
        frecuenciaCron: cron,
      });
    }
  }

  toggleDay(day: number) {
    this.form.patchValue({ diaMes: day });
  }

  // --- ACCIONES ---

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;
    const seleccion = val.lugarSeleccionado;

    const data: CreateTareaRecurrente = {
      titulo: val.titulo!,
      descripcion: val.descripcion || "",
      tipoTareaId: val.tipoTareaId!,
      frecuenciaCron: val.frecuenciaCron!,
      isActive: true,
      animalId: seleccion?.tipo === "animal" ? seleccion.value! : undefined,
      habitatId: seleccion?.tipo === "habitat" ? seleccion.value! : undefined,
    };

    if (this.isEditMode() && this.currentId()) {
      this.store.updateItem({ id: this.currentId()!, data });
    } else {
      this.store.createItem(data);
    }

    // Volver atrás inmediatamente (o podrías esperar al success del store si lo prefieres)
    this.cancel();
  }

  cancel() {
    this.location.back();
  }
}
