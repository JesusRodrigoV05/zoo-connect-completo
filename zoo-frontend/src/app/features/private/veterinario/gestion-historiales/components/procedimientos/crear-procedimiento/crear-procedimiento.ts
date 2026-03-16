import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { DatePickerModule } from "primeng/datepicker";
import { SelectModule } from "primeng/select";

@Component({
  selector: "app-crear-procedimiento",
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DatePickerModule,
    SelectModule,
  ],
  templateUrl: "./crear-procedimiento.html",
  styleUrl: "./crear-procedimiento.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearProcedimiento {
  readonly store = inject(DetalleClinicoStore);
  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);

  minDate = new Date();
  isEditMode = false;
  currentId: number | null = null;

  estados = [
    { label: "Pendiente", value: "Pendiente" },
    { label: "Realizado", value: "Realizado" },
    { label: "Cancelado", value: "Cancelado" },
  ];

  form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    fechaProgramada: [null as Date | null, Validators.required],
    descripcion: ["", Validators.required],
    estado: ["Pendiente", Validators.required],
  });

  ngOnInit() {
    if (this.config.data?.item) {
      this.isEditMode = true;
      const item = this.config.data.item;
      this.currentId = item.id;

      this.form.patchValue({
        nombre: item.nombre,
        fechaProgramada: item.fechaProgramada
          ? new Date(item.fechaProgramada)
          : null,
        descripcion: item.descripcion,
        estado: item.estado || "Pendiente",
      });
    }
  }

  guardar() {
    if (this.form.invalid) return;

    const formValue = {
      nombre: this.form.value.nombre!,
      fechaProgramada: this.form.value.fechaProgramada!,
      descripcion: this.form.value.descripcion!,
      estado: this.form.value.estado!,
    };

    if (this.isEditMode && this.currentId) {
      this.store.actualizarProcedimiento({
        id: this.currentId,
        data: formValue,
      });
    } else {
      this.store.agregarProcedimiento(formValue);
    }

    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }
}
