import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { SelectModule } from "primeng/select";
import { DatePickerModule } from "primeng/datepicker";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { AdminHabitat } from "@app/features/private/admin/services/admin-habitat";
import { RolId, Usuario } from "@models/usuario";
import { DialogModule } from "primeng/dialog";
import { TiposTareaStore } from "@app/features/private/admin/stores/tareas/admin-tipo-tares.store";
import { TareasPendientesStore } from "@app/features/private/admin/stores/tareas/admin-operaciones.store";
import { CreateTareaManual } from "@app/features/private/admin/models/tareas/tarea.model";
import { NgClass } from "@angular/common";
import { AdminUsuarios } from "@app/features/private/admin/services/admin-usuarios";

interface LugarOption {
  label: string;
  value: number | null;
  tipo: "animal" | "habitat" | "general";
}
@Component({
  selector: "zoo-crear-tarea",
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    DatePickerModule,
    NgClass,
  ],
  templateUrl: "./crear-tarea.html",
  styleUrl: "./crear-tarea.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearTarea {
  visible = input.required<boolean>();
  onClose = output<void>();

  private fb = inject(FormBuilder);
  private store = inject(TareasPendientesStore);
  protected tiposStore = inject(TiposTareaStore);
  private adminUsuarios = inject(AdminUsuarios);
  private animalesService = inject(AdminAnimales);
  private habitatService = inject(AdminHabitat);

  usuarios = signal<Usuario[]>([]);
  loadingUsuarios = signal(false);
  protected isLoadingData = signal(false);

  protected animales = signal<{ label: string; value: number }[]>([]);
  protected habitats = signal<{ label: string; value: number }[]>([]);
  protected isProcessing = computed(() => this.store.creatingManual());

  protected lugares = computed<LugarOption[]>(() => [
    {
      label: "General (Sin ubicación específica)",
      value: null,
      tipo: "general",
    },
    ...this.habitats().map((h) => ({
      label: `Hábitat: ${h.label}`,
      value: h.value,
      tipo: "habitat" as const,
    })),
    ...this.animales().map((a) => ({
      label: `Animal: ${a.label}`,
      value: a.value,
      tipo: "animal" as const,
    })),
  ]);

  protected form = this.fb.group({
    titulo: ["", [Validators.required, Validators.minLength(3)]],
    descripcion: ["", [Validators.required]],
    tipoTareaId: [null as number | null, [Validators.required]],
    fechaProgramada: [new Date(), [Validators.required]],
    usuarioAsignadoId: [null as number | null],
    lugarSeleccionado: [null as LugarOption | null],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.loadCatalogos();
          this.loadAllUsers();
          this.form.reset({
            fechaProgramada: new Date(),
            lugarSeleccionado: this.lugares()[0],
          });
        });
      }
    });
  }

  private loadCatalogos() {
    if (this.tiposStore.items().length === 0) this.tiposStore.loadItems();
    if (this.animales().length > 0) return;

    this.isLoadingData.set(true);
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

  private loadAllUsers() {
    if (this.usuarios().length > 0) return;
    this.loadingUsuarios.set(true);
    this.adminUsuarios.getAllUsers(1, 100).subscribe({
      next: (response) => {
        const users = response.items.filter(
          (u) => u.rol.id !== RolId.VISITANTE,
        );
        this.usuarios.set(users);
      },
      complete: () => this.loadingUsuarios.set(false),
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.value;

    const selectedLugar = val.lugarSeleccionado;

    const payload: CreateTareaManual = {
      titulo: val.titulo!,
      descripcion: val.descripcion!,
      fechaProgramada: this.formatDate(val.fechaProgramada!),
      tipoTareaId: val.tipoTareaId!,
      usuarioAsignadoId: val.usuarioAsignadoId
        ? Number(val.usuarioAsignadoId)
        : undefined,
      animalId:
        selectedLugar?.tipo === "animal" ? selectedLugar.value! : undefined,
      habitatId:
        selectedLugar?.tipo === "habitat" ? selectedLugar.value! : undefined,
    };

    this.store.createManualTask(payload);
    this.close();
  }

  close() {
    this.onClose.emit();
  }

  private formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
  }

  getUserRoleIconClass(roleId: RolId): string {
    switch (roleId) {
      case RolId.CUIDADOR:
        return "user-role-icon-cuidador";
      case RolId.VETERINARIO:
        return "user-role-icon-veterinario";
      default:
        return "user-role-icon-default";
    }
  }

  getUserRoleBadgeClass(roleId: RolId): string {
    switch (roleId) {
      case RolId.CUIDADOR:
        return "user-role-badge-cuidador";
      case RolId.VETERINARIO:
        return "user-role-badge-veterinario";
      default:
        return "user-role-badge-default";
    }
  }
}
