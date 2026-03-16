import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from "@angular/core";
import { Validators, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { MessageModule } from "primeng/message";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { TextareaModule } from "primeng/textarea";
import { NgTemplateOutlet } from "@angular/common";
import { ShowToast } from "@app/shared/services";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminHabitat } from "@app/features/private/admin/services/admin-habitat";
import { catchError, finalize } from "rxjs/operators";
import { Habitat } from "@app/core/models/habitat";
import { CardModule } from "primeng/card";
import { MainContainer } from "@app/shared/components/main-container";
import { ButtonModule } from "primeng/button";
import { StepperModule } from "primeng/stepper";
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import {
  AdminHabitatsMedia,
  HabitatMediaMetadata,
} from "@app/features/private/admin/services/media";
import { forkJoin, Observable, of } from "rxjs";
import { HabitatMediaResponse } from "@adapters/habitat";
import { ImageModule } from "primeng/image";

@Component({
  selector: "app-crear-habitat",
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MessageModule,
    InputTextModule,
    TextareaModule,
    FloatLabel,
    CardModule,
    ButtonModule,
    StepperModule,
    FileUploadModule,
    ImageModule,
  ],
  templateUrl: "./crear-habitat.html",
  styleUrl: "./crear-habitat.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearHabitat {
  private readonly zooToast = inject(ShowToast);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly adminHabitat = inject(AdminHabitat);
  private readonly adminMedia = inject(AdminHabitatsMedia);
  private readonly route = inject(ActivatedRoute);

  protected readonly formSubmitted = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly activeStep = signal(1);
  protected readonly isEditMode = signal(false);
  protected readonly createdHabitatId = signal<number | null>(null);
  protected selectedFiles = signal<File[]>([]);
  fileUploader = viewChild<FileUpload>("fileUploader");
  activo: boolean | null = null;
  protected existingMedia = signal<HabitatMediaResponse[]>([]);

  protected readonly finalizarLabel = computed(() =>
    this.isProcessing() ? "Procesando..." : "Finalizar",
  );

  protected readonly finalizarIcon = computed(() =>
    this.isProcessing() ? "pi pi-spin pi-spinner" : "pi pi-check",
  );
  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? "Editar Hábitat" : "Crear Nuevo Hábitat",
  );
  protected readonly submitLabel = computed(() =>
    this.isProcessing()
      ? "Procesando..."
      : this.isEditMode()
        ? "Guardar Cambios"
        : "Crear y Continuar",
  );

  protected readonly habitatForm = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(2)]],
    tipo: ["", [Validators.required, Validators.minLength(2)]],
    descripcion: ["", [Validators.required, Validators.minLength(10)]],
    condicionesClimaticas: ["", [Validators.required, Validators.minLength(5)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      const habitatId = +id;
      this.isEditMode.set(true);
      this.createdHabitatId.set(habitatId);
      this.loadHabitatData(habitatId);
      this.loadHabitatMedia(habitatId);
    }
  }
  private loadHabitatMedia(id: number): void {
    this.adminMedia
      .getAllMediaForHabitat(id, 1, 50)
      .pipe()
      .subscribe({
        next: (response) => {
          this.existingMedia.set(response.items);
        },
        error: (err) => {
          this.zooToast.showError(
            "Error",
            "No se pudo cargar la galería existente.",
          );
        },
      });
  }

  protected onDeleteMedia(mediaId: number): void {
    this.isProcessing.set(true);
    this.adminMedia
      .deleteHabitatMedia(mediaId)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: () => {
          this.zooToast.showSuccess("Éxito", "Imagen eliminada.");
          this.existingMedia.update((mediaList) =>
            mediaList.filter((media) => media.id_media_habitat !== mediaId),
          );
        },
        error: (err) => {
          this.zooToast.showError("Error", "No se pudo eliminar la imagen.");
        },
      });
  }
  private loadHabitatData(id: number): void {
    this.isProcessing.set(true);
    this.adminHabitat
      .getHabitatById(id)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: (habitat) => {
          this.habitatForm.patchValue({
            nombre: habitat.nombre,
            tipo: habitat.tipo,
            descripcion: habitat.descripcion,
            condicionesClimaticas: habitat.condicionesClimaticas,
          });
          this.activo = habitat.isActive;
        },
        error: (err) => {
          this.zooToast.showError("Error", "No se pudo cargar el hábitat");
          this.router.navigate(["/admin/animales/habitat/lista"]);
        },
      });
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.habitatForm.invalid) {
      this.zooToast.showError(
        "Error",
        "Por favor, completa todos los campos requeridos",
      );
      return;
    }

    this.isProcessing.set(true);
    const habitatData: Omit<Habitat, "id"> = {
      ...(this.habitatForm.value as Omit<Habitat, "id" | "isActive">),
      isActive: this.activo!,
    };

    if (this.isEditMode()) {
      const habitatId = this.createdHabitatId()!;
      console.log(habitatData, this.activo);
      this.adminHabitat
        .updateHabitat(habitatId, habitatData)
        .pipe(finalize(() => this.isProcessing.set(false)))
        .subscribe({
          next: () => {
            this.zooToast.showSuccess("Éxito", "Hábitat actualizado");
            this.activeStep.set(2);
          },
          error: (error) => this.handleError(error),
        });
    } else {
      this.adminHabitat
        .createHabitat(habitatData)
        .pipe(finalize(() => this.isProcessing.set(false)))
        .subscribe({
          next: (newHabitat) => {
            this.zooToast.showSuccess("Éxito", "Hábitat creado exitosamente");
            this.createdHabitatId.set(newHabitat.id);
            this.isEditMode.set(true);
            this.activeStep.set(2);
          },
          error: (error) => this.handleError(error),
        });
    }
  }

  protected updateSelectedFiles() {
    const currentFiles = this.fileUploader()?.files || [];
    this.selectedFiles.set(currentFiles);
  }

  protected finishCreation(): void {
    const filesToUpload = this.selectedFiles();

    if (filesToUpload.length === 0) {
      this.router.navigate(["/admin/animales/habitat/lista"]);
      return;
    }

    this.isProcessing.set(true);

    const habitatId = this.createdHabitatId();
    if (!habitatId) {
      this.zooToast.showError(
        "Error",
        "ID de Hábitat no encontrado. Vuelve al paso 1.",
      );
      this.isProcessing.set(false);
      return;
    }

    const uploadTasks: Observable<HabitatMediaResponse | null>[] = [];
    for (const file of filesToUpload) {
      const metadata: HabitatMediaMetadata = {
        habitatId: habitatId,
        titulo: "",
        descripcion: "",
      };

      uploadTasks.push(
        this.adminMedia.uploadHabitatMedia(metadata, file).pipe(
          catchError((err) => {
            console.error(`Error subiendo ${file.name}:`, err);
            this.zooToast.showError("Error", `No se pudo subir ${file.name}`);
            return of(null);
          }),
        ),
      );
    }

    forkJoin(uploadTasks)
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
          this.router.navigate(["/admin/animales/habitat/lista"]);
        }),
      )
      .subscribe((results) => {
        const successfulUploads = results.filter((res) => res !== null).length;

        if (successfulUploads === filesToUpload.length) {
          this.zooToast.showSuccess(
            "Éxito",
            "Todas las imágenes se subieron correctamente",
          );
        } else if (successfulUploads > 0) {
          this.zooToast.showWarning(
            "Aviso",
            `Se subieron ${successfulUploads} de ${filesToUpload.length} imágenes.`,
          );
        } else {
          this.zooToast.showError("Error", "No se pudo subir ninguna imagen.");
        }
      });
  }

  protected onCancel(): void {
    this.router.navigate(["/admin/animales/habitat/lista"]);
  }

  private handleError(error: any): void {
    this.zooToast.showError("Error", "Ocurrió un error: " + error.message);
  }

  protected isInvalid(fieldName: string): boolean {
    const field = this.habitatForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(fieldName: string): string {
    const field = this.habitatForm.get(fieldName);
    if (field?.errors) {
      if (field.errors["required"]) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (field.errors["minlength"]) {
        const requiredLength = field.errors["minlength"].requiredLength;
        return `${this.getFieldDisplayName(
          fieldName,
        )} debe tener al menos ${requiredLength} caracteres`;
      }
    }
    return "";
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      nombre: "El nombre",
      tipo: "El tipo",
      descripcion: "La descripción",
      condicionesClimaticas: "Las condiciones climáticas",
    };
    return fieldNames[fieldName] || fieldName;
  }
}
