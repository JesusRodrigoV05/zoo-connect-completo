import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from "@angular/core";
import { Validators, FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { TextareaModule } from "primeng/textarea";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { SelectModule } from "primeng/select";
import { CheckboxModule } from "primeng/checkbox";
import { ShowToast } from "@app/shared/services";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { AnimalMediaApiResponse } from "@adapters/animales";
import { catchError, finalize } from "rxjs/operators";
import { MainContainer } from "@app/shared/components/main-container";
import { MessageModule } from "primeng/message";
import { ImageModule } from "primeng/image";
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import { StepperModule } from "primeng/stepper";
import { Loader } from "@app/shared/components";
import { NgTemplateOutlet } from "@angular/common";
import {
  AdminAnimalesMultimedia,
  AnimalMediaMetadata,
} from "@app/features/private/admin/services/media";
import { CreateAnimal, EstadoOperativo, MediaAnimal } from "@models/animales";
import { forkJoin, Observable, of } from "rxjs";
import { EspecieStore } from "@stores/especies.store";
import { HabitatStore } from "@stores/habitat.store";

@Component({
  selector: "zoo-crear-animal",
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    StepperModule,
    FileUploadModule,
    ImageModule,
    InputTextModule,
    FloatLabel,
    CheckboxModule,
    DatePickerModule,
    SelectModule,
    TextareaModule,
    MessageModule,
  ],
  templateUrl: "./crear-animal.html",
  styleUrl: "./crear-animal.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearAnimal implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly showToast = inject(ShowToast);
  private readonly adminAnimales = inject(AdminAnimales);
  private readonly adminAnimalesMedia = inject(AdminAnimalesMultimedia);
  protected readonly especieStore = inject(EspecieStore);
  protected readonly habitatStore = inject(HabitatStore);

  protected readonly formSubmitted = signal(false);
  protected readonly isProcessing = signal(false);
  protected readonly activeStep = signal(1);
  protected readonly isEditMode = signal(false);
  protected readonly createdAnimalId = signal<number | null>(null);
  protected readonly especies = this.especieStore.activeEspecies;
  protected readonly habitats = this.habitatStore.activeHabitats;
  protected readonly isLoadingDropdowns = computed(
    () => this.especieStore.isLoading() || this.habitatStore.isLoading(),
  );
  protected readonly selectedFiles = signal<File[]>([]);
  protected readonly existingMedia = signal<MediaAnimal[]>([]);
  protected fileUploader = viewChild<FileUpload>("fileUploader");

  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? "Editar Animal" : "Crear Nuevo Animal",
  );
  protected readonly submitLabel = computed(() =>
    this.isProcessing()
      ? "Procesando..."
      : this.isEditMode()
        ? "Guardar y Continuar"
        : "Crear y Continuar",
  );
  protected readonly finalizarLabel = computed(() =>
    this.isProcessing() ? "Procesando..." : "Finalizar",
  );
  protected readonly finalizarIcon = computed(() =>
    this.isProcessing() ? "pi pi-spin pi-spinner" : "pi pi-check",
  );

  protected readonly estadosOperativos = Object.values(EstadoOperativo).map(
    (estado) => ({ label: estado, value: estado }),
  );

  protected readonly animalForm = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(2)]],
    genero: [true, [Validators.required]],
    fecha_nacimiento: ["", [Validators.required]],
    fecha_ingreso: ["", [Validators.required]],
    procedencia: ["", [Validators.required]],
    estado_operativo: [EstadoOperativo.SALUDABLE, [Validators.required]],
    es_publico: [true],
    descripcion: ["", [Validators.required, Validators.minLength(10)]],
    especie_id: [null as number | null, [Validators.required]],
    habitat_id: [null as number | null, [Validators.required]],
  });

  ngOnInit(): void {
    this.especieStore.loadEspecies();
    this.habitatStore.loadHabitats();
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      const animalId = +id;
      this.isEditMode.set(true);
      this.createdAnimalId.set(animalId);
      this.loadAnimalData(animalId);
      this.loadAnimalMedia(animalId);
    }
  }

  private loadAnimalData(id: number): void {
    this.isProcessing.set(true);
    this.adminAnimales
      .getAnimalById(id)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: (animal) => {
          this.animalForm.patchValue({
            ...animal,
            fecha_nacimiento: animal.fecha_nacimiento,
            fecha_ingreso: animal.fecha_ingreso,
          });
        },
        error: (err) => {
          this.showToast.showError("Error", "No se pudo cargar el animal.");
          this.router.navigate(["/admin/animales/lista"]);
        },
      });
  }

  private loadAnimalMedia(id: number): void {
    this.adminAnimalesMedia.getAllMediaForAnimal(id, 1, 50).subscribe({
      next: (response) => {
        this.existingMedia.set(response.items);
      },
      error: (err) => {
        this.showToast.showError("Error", "No se pudo cargar la galería.");
      },
    });
  }

  private formatDate(date: string | Date): string {
    if (!date) return "";

    const d = new Date(date);

    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);
    if (this.animalForm.invalid) {
      this.showToast.showError(
        "Formulario inválido",
        "Revise los campos requeridos.",
      );
      return;
    }

    this.isProcessing.set(true);
    const formValue = this.animalForm.value;

    const animalData: CreateAnimal = {
      nombre: formValue.nombre!,
      genero: formValue.genero!,
      fecha_nacimiento: this.formatDate(formValue.fecha_nacimiento!),
      fecha_ingreso: this.formatDate(formValue.fecha_ingreso!),
      procedencia: formValue.procedencia!,
      estado_operativo: formValue.estado_operativo as EstadoOperativo,
      es_publico: formValue.es_publico!,
      descripcion: formValue.descripcion!,
      especie_id: formValue.especie_id!,
      habitat_id: formValue.habitat_id!,
    };

    if (this.isEditMode()) {
      this.updateAnimal(animalData);
    } else {
      this.createAnimal(animalData);
    }
  }

  private createAnimal(animalData: CreateAnimal): void {
    this.adminAnimales
      .createAnimal(animalData)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: (newAnimal) => {
          this.showToast.showSuccess("Éxito", "Animal creado exitosamente.");
          this.createdAnimalId.set(newAnimal.id_animal);
          this.isEditMode.set(true);
          this.activeStep.set(2);
        },
        error: (err) => this.handleError(err),
      });
  }

  private updateAnimal(animalData: CreateAnimal): void {
    const animalId = this.createdAnimalId()!;
    this.adminAnimales
      .updateAnimal(animalId, animalData)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: () => {
          this.showToast.showSuccess("Éxito", "Animal actualizado.");
          this.activeStep.set(2);
        },
        error: (err) => this.handleError(err),
      });
  }

  protected onDeleteMedia(mediaId: number): void {
    this.isProcessing.set(true);
    this.adminAnimalesMedia
      .deleteAnimalMedia(mediaId)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: () => {
          this.showToast.showSuccess("Éxito", "Imagen eliminada.");
          this.existingMedia.update((mediaList) =>
            mediaList.filter((media) => media.id_media !== mediaId),
          );
        },
        error: (err) => {
          this.showToast.showError("Error", "No se pudo eliminar la imagen.");
        },
      });
  }

  protected updateSelectedFiles() {
    const currentFiles = this.fileUploader()?.files || [];
    this.selectedFiles.set(currentFiles);
  }

  protected finishCreation(): void {
    const filesToUpload = this.selectedFiles();
    if (filesToUpload.length === 0) {
      this.router.navigate(["/admin/animales/lista"]);
      return;
    }

    this.isProcessing.set(true);
    const animalId = this.createdAnimalId();
    if (!animalId) {
      this.showToast.showError("Error", "ID de Animal no encontrado.");
      this.isProcessing.set(false);
      return;
    }

    const uploadTasks: Observable<MediaAnimal | null>[] = [];
    for (const file of filesToUpload) {
      const metadata: AnimalMediaMetadata = {
        animalId: animalId,
        titulo: "",
        descripcion: "",
      };

      uploadTasks.push(
        this.adminAnimalesMedia.uploadAnimalMedia(metadata, file).pipe(
          catchError((err) => {
            this.showToast.showError("Error", `No se pudo subir ${file.name}`);
            return of(null);
          }),
        ),
      );
    }

    forkJoin(uploadTasks)
      .pipe(
        finalize(() => {
          this.isProcessing.set(false);
          this.router.navigate(["/admin/animales/lista"]);
        }),
      )
      .subscribe((results) => {
        const successfulUploads = results.filter((res) => res !== null).length;
        if (successfulUploads > 0) {
          this.showToast.showSuccess(
            "Éxito",
            `Se subieron ${successfulUploads} imágenes.`,
          );
        }
      });
  }

  protected onCancel(): void {
    this.router.navigate(["/admin/animales/lista"]);
  }

  private handleError(error: any): void {
    this.showToast.showError("Error", "Ocurrió un error: " + error.message);
  }

  protected isInvalid(fieldName: string): boolean {
    const field = this.animalForm.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(fieldName: string): string {
    return "Campo requerido o inválido";
  }
}
