import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { DynamicDialogConfig, DynamicDialogRef } from "primeng/dynamicdialog";
import { VetExamenes } from "../../../../services/historiales/vet-examenes";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { ShowToast } from "@app/shared/services";
import { ButtonModule } from "primeng/button";
import { FileUploadModule, FileSelectEvent } from "primeng/fileupload";
import { TextareaModule } from "primeng/textarea";
import { InputTextModule } from "primeng/inputtext";
import { ProgressBarModule } from "primeng/progressbar";

@Component({
  selector: "app-subir-resultado",
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FileUploadModule,
    TextareaModule,
    InputTextModule,
    ProgressBarModule,
  ],
  templateUrl: "./subir-resultado.html",
  styleUrl: "./subir-resultado.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubirResultado {
  private fb = inject(FormBuilder);
  private service = inject(VetExamenes);
  private store = inject(DetalleClinicoStore);
  private dialogRef = inject(DynamicDialogRef);
  private config = inject(DynamicDialogConfig);
  private toast = inject(ShowToast);

  ordenId: number = this.config.data?.ordenId;

  loading = signal(false);
  selectedFile = signal<File | null>(null);

  form = this.fb.group({
    conclusiones: ["", [Validators.required, Validators.minLength(10)]],
  });

  onFileSelect(event: FileSelectEvent) {
    if (event.files && event.files.length > 0) {
      this.selectedFile.set(event.files[0]);
    }
  }

  onClearFile() {
    this.selectedFile.set(null);
  }

  subir() {
    if (this.form.invalid || !this.selectedFile()) return;

    this.loading.set(true);

    const payload = {
      conclusiones: this.form.value.conclusiones!,
      archivo: this.selectedFile()!,
    };

    this.service.uploadResultado(this.ordenId, payload).subscribe({
      next: (resultado) => {
        this.toast.showSuccess(
          "Resultado Subido",
          "El archivo se ha guardado correctamente.",
        );

        this.store.cargarHistorialCompleto(this.store.historialId());

        this.dialogRef.close(resultado);
      },
      error: (err) => {
        this.loading.set(false);
        this.toast.showError("Error", "No se pudo subir el archivo.");
        console.error(err);
      },
    });
  }

  cancelar() {
    this.dialogRef.close();
  }
}
