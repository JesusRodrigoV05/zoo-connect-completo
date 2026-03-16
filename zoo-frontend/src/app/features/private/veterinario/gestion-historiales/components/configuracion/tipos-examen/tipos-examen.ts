import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { ConfiguracionStore } from "@app/features/private/veterinario/stores/historiales/configuracion.store";
import { TipoExamen } from "@app/features/private/veterinario/models/historiales/veterinario-config.model";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { TipoExamenItem } from "../tipo-examen-item";

@Component({
  selector: "app-tipos-examen",
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
    ConfirmDialogModule,
    TipoExamenItem,
  ],
  providers: [ConfirmationService],
  templateUrl: "./tipos-examen.html",
  styleUrl: "./tipos-examen.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TiposExamen {
  readonly store = inject(ConfiguracionStore);
  private fb = inject(FormBuilder);
  confirmation = inject(ZooConfirmationService);

  dialogVisible = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);

  form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    descripcion: ["", [Validators.maxLength(255)]],
  });

  openCreate() {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.form.reset();
    this.dialogVisible.set(true);
  }

  openEdit(item: TipoExamen) {
    this.isEditing.set(true);
    this.currentId.set(item.id);
    this.form.patchValue({
      nombre: item.nombre,
      descripcion: item.descripcion,
    });
    this.dialogVisible.set(true);
  }

  deleteItem(id: number) {
    this.confirmation.delete({
      message: "¿Estás seguro de eliminar este tipo de examen?",
      accept: () => this.store.deleteTipoExamen(id),
    });
  }

  save() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.isEditing() && this.currentId()) {
      this.store.updateTipoExamen({
        id: this.currentId()!,
        data: {
          nombre: formValue.nombre!,
          descripcion: formValue.descripcion || "",
        },
      });
    } else {
      this.store.addTipoExamen({
        nombre: formValue.nombre!,
        descripcion: formValue.descripcion || "",
      });
    }

    this.dialogVisible.set(false);
  }
}
