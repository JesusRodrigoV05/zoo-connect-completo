import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DynamicDialogRef } from "primeng/dynamicdialog";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { ConfiguracionStore } from "../../../../stores/historiales/configuracion.store";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { TextareaModule } from "primeng/textarea";

@Component({
  selector: "app-crear-orden-examen",
  imports: [ReactiveFormsModule, ButtonModule, SelectModule, TextareaModule],
  templateUrl: "./crear-orden-examen.html",
  styleUrl: "./crear-orden-examen.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CrearOrdenExamen {
  readonly detalleStore = inject(DetalleClinicoStore);
  readonly configStore = inject(ConfiguracionStore);

  private fb = inject(FormBuilder);
  private dialogRef = inject(DynamicDialogRef);

  form = this.fb.group({
    tipoExamenId: [null as number | null, Validators.required],
    instrucciones: ["", [Validators.required, Validators.minLength(5)]],
  });

  guardar() {
    if (this.form.invalid) return;

    this.detalleStore.crearOrdenExamen({
      tipoExamenId: this.form.value.tipoExamenId!,
      instrucciones: this.form.value.instrucciones!,
    });

    this.dialogRef.close();
  }

  cancelar() {
    this.dialogRef.close();
  }
}
