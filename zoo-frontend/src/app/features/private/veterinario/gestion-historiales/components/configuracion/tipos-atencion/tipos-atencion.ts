import {
  afterNextRender,
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
import { TipoAtencion } from "@app/features/private/veterinario/models/historiales/veterinario-config.model";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { TipoAtencionItem } from "../tipo-atencion-item";
import { OnboardingService } from "@app/shared/services/onboarding.service";

@Component({
  selector: "app-tipos-atencion",
  imports: [
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TooltipModule,
    ConfirmDialogModule,
    TipoAtencionItem,
  ],
  providers: [ConfirmationService],
  templateUrl: "./tipos-atencion.html",
  styleUrl: "./tipos-atencion.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TiposAtencion {
  readonly store = inject(ConfiguracionStore);
  private readonly onboarding = inject(OnboardingService);
  private fb = inject(FormBuilder);
  confirmation = inject(ZooConfirmationService);
  private tourPrompted = false;

  dialogVisible = signal(false);
  isEditing = signal(false);
  currentId = signal<number | null>(null);

  form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    descripcion: ["", [Validators.maxLength(255)]],
  });

  constructor() {
    afterNextRender(() => {
      if (this.tourPrompted) return;
      this.tourPrompted = true;
      this.onboarding.startTourIfFirstVisit("vet-tipos-atencion-lista");
    });
  }

  startGuidedTour() {
    this.onboarding.startTour("vet-tipos-atencion-lista");
  }

  startFormTour() {
    this.onboarding.startTour("vet-tipos-atencion-crear");
  }

  openCreate() {
    this.isEditing.set(false);
    this.currentId.set(null);
    this.form.reset();
    this.dialogVisible.set(true);
  }

  openEdit(item: TipoAtencion) {
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
      message: "¿Estás seguro de eliminar este tipo de atención?",
      accept: () => this.store.deleteTipoAtencion(id),
    });
  }

  save() {
    if (this.form.invalid) return;

    const formValue = this.form.value;

    if (this.isEditing() && this.currentId()) {
      this.store.updateTipoAtencion({
        id: this.currentId()!,
        data: {
          nombre: formValue.nombre!,
          descripcion: formValue.descripcion || "",
        },
      });
    } else {
      this.store.addTipoAtencion({
        nombre: formValue.nombre!,
        descripcion: formValue.descripcion || "",
      });
    }

    this.dialogVisible.set(false);
  }
}
