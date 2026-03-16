import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { FloatLabel } from "primeng/floatlabel";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import {
  CreateTipoTarea,
  TipoTarea,
  UpdateTipoTarea,
} from "@app/features/private/admin/models/tareas/tarea.model";
import { TiposTareaStore } from "@app/features/private/admin/stores/tareas/admin-tipo-tares.store";

@Component({
  selector: "zoo-crear-tipo-tarea",
  imports: [
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    FloatLabel,
    ToggleSwitchModule,
  ],
  templateUrl: "./crear-tipo-tarea.html",
  styleUrl: "./crear-tipo-tarea.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearTipoTarea {
  visible = input.required<boolean>();
  editingItem = input<TipoTarea | null>(null);

  onClose = output<void>();
  onSave = output<void>();

  private fb = inject(FormBuilder);
  readonly store = inject(TiposTareaStore);

  protected pageTitle = computed(() =>
    this.editingItem() ? "Editar Tipo" : "Nuevo Tipo de Tarea",
  );
  protected isProcessing = computed(() => this.store.isSaving());

  protected form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    descripcion: ["", [Validators.required]],
    isActive: [true],
  });

  constructor() {
    effect(() => {
      if (this.visible()) {
        const item = this.editingItem();
        if (item) {
          this.form.patchValue({
            nombre: item.nombre,
            descripcion: item.descripcion,
            isActive: item.isActive,
          });
        } else {
          this.form.reset({ isActive: true });
        }
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    const val = this.form.value;

    if (this.editingItem()) {
      const updateData: UpdateTipoTarea = {
        nombre: val.nombre!,
        descripcion: val.descripcion!,
        isActive: val.isActive!,
      };
      this.store.updateItem({ id: this.editingItem()!.id, data: updateData });
    } else {
      const createData: CreateTipoTarea = {
        nombre: val.nombre!,
        descripcion: val.descripcion!,
      };
      this.store.createItem(createData);
    }

    this.onSave.emit();
    this.close();
  }

  close() {
    this.onClose.emit();
  }
}
