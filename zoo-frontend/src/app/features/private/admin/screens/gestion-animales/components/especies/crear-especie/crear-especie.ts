import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  Validators,
  FormBuilder,
  ReactiveFormsModule,
  ValidatorFn,
} from "@angular/forms";
import { MessageModule } from "primeng/message";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { TextareaModule } from "primeng/textarea";
import { NgTemplateOutlet } from "@angular/common";
import { CheckboxModule } from "primeng/checkbox";
import { ShowToast } from "@app/shared/services";
import { ActivatedRoute, Router } from "@angular/router";
import { AdminEspecies } from "@app/features/private/admin/services/admin-especies";
import { finalize } from "rxjs/operators";
import { ConfirmationService } from "primeng/api";
import { ConfirmPopupModule } from "primeng/confirmpopup";
import {
  CreateEspecie,
  UpdateEspecie,
} from "@app/core/models/animales/especie.model";
import { Loader } from "@app/shared/components";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-crear-especie",
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    MessageModule,
    InputTextModule,
    TextareaModule,
    FloatLabel,
    CheckboxModule,
    ConfirmPopupModule,
    Loader,
    CardModule,
    ButtonModule,
  ],
  providers: [ConfirmationService],
  templateUrl: "./crear-especie.html",
  styleUrl: "./crear-especie.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearEspecie implements OnInit {
  private readonly zooToast = inject(ShowToast);
  private readonly router = inject(Router);
  route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly adminEspecies = inject(AdminEspecies);

  protected readonly formSubmitted = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly isEditMode = signal(false);
  private readonly currentEspecieId = signal<number | null>(null);
  activo: boolean | null = null;

  protected readonly pageTitle = computed(() =>
    this.isEditMode() ? "Editar Especie" : "Crear Nueva Especie",
  );
  protected readonly pageSubtitle = computed(() =>
    this.isEditMode()
      ? "Actualiza los datos de la especie"
      : "Ingresa los datos de la nueva especie",
  );
  protected readonly buttonText = computed(() =>
    this.isEditMode() ? "Guardar Cambios" : "Crear Especie",
  );

  private basicValidator(length: number = 2): ValidatorFn[] {
    return [Validators.required, Validators.minLength(length)];
  }

  protected readonly especieForm = this.fb.group({
    nombreCientifico: ["", this.basicValidator(3)],
    nombreComun: ["", this.basicValidator()],
    filo: ["", this.basicValidator()],
    clase: ["", this.basicValidator()],
    orden: ["", this.basicValidator()],
    familia: ["", this.basicValidator()],
    descripcion: ["", this.basicValidator(10)],
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get("id");
    if (idParam) {
      const id = +idParam;
      this.isEditMode.set(true);
      this.currentEspecieId.set(id);
      this.loadEspecieData(id);
    }
  }

  private loadEspecieData(id: number): void {
    this.isLoading.set(true);
    this.adminEspecies
      .getSpeciesById(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (especie) => {
          this.especieForm.patchValue(especie);
          this.activo = especie.isActive;
        },
        error: (err) => {
          this.zooToast.showError("Error", "No se pudo cargar la especie.");
          this.router.navigate(["/admin/animales/especies"]);
        },
      });
  }

  protected readonly isFormValid = computed(() => this.especieForm.valid);

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (!this.especieForm.valid) {
      this.zooToast.showError(
        "Formulario inválido",
        "Por favor complete todos los campos requeridos",
      );
      return;
    }

    if (this.isEditMode()) {
      this.updateEspecie();
    } else {
      this.createEspecie();
    }
  }

  private createEspecie(): void {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    const formData = this.especieForm.value as CreateEspecie;

    this.adminEspecies
      .createSpecies(formData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (especie) => {
          this.zooToast.showSuccess(
            "Éxito",
            `Especie "${especie.nombreComun}" creada exitosamente`,
          );
          this.router.navigate(["/admin/animales/especies"]);
        },
        error: (error) => {
          console.error("Error creando especie:", error);
          let errorMessage = "Error al crear la especie";

          if (error.status === 400) {
            errorMessage =
              "Datos inválidos. Verifique la información ingresada";
          } else if (error.status === 409) {
            errorMessage = "Ya existe una especie con este nombre científico";
          } else if (error.status === 422) {
            errorMessage = "Formato de datos incorrecto";
          }

          this.zooToast.showError("Error", errorMessage);
        },
      });
  }
  private updateEspecie(): void {
    if (this.isLoading() || !this.currentEspecieId()) return;

    this.isLoading.set(true);
    const id = this.currentEspecieId()!;

    const updateData: UpdateEspecie = {
      ...(this.especieForm.value as CreateEspecie),
      isActive: this.activo!,
      idEspecie: id,
    };

    this.adminEspecies
      .updateSpecies(updateData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (especie) => {
          this.zooToast.showSuccess(
            "Éxito",
            `Especie "${especie.nombreComun}" actualizada exitosamente`,
          );
          this.router.navigate(["/admin/animales/especies"]);
        },
        error: (error) => {
          this.handleApiError(error, "actualizar");
        },
      });
  }

  protected limpiarFormulario(): void {
    this.especieForm.reset();
    this.formSubmitted.set(false);
  }

  private handleApiError(error: any, action: "crear" | "actualizar"): void {
    console.error(`Error al ${action} especie:`, error);
    let errorMessage = `Error al ${action} la especie`;

    if (error.status === 400) {
      errorMessage = "Datos inválidos. Verifique la información ingresada";
    } else if (error.status === 409) {
      errorMessage = "Ya existe una especie con este nombre científico";
    } else if (error.status === 422) {
      errorMessage = "Formato de datos incorrecto";
    }
    this.zooToast.showError("Error", errorMessage);
  }

  protected cancelar(): void {
    this.router.navigate(["/admin/animales/especies"]);
  }

  protected isInvalid(fieldName: string): boolean {
    const field = this.especieForm.get(fieldName);
    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(fieldName: string): string {
    const control = this.especieForm.get(fieldName);
    if (!control || !control.errors) return "";

    const errors = control.errors;

    if (errors["required"]) {
      const fieldLabels: { [key: string]: string } = {
        nombreCientifico: "El nombre científico",
        nombreComun: "El nombre común",
        filo: "El filo",
        clase: "La clase",
        orden: "El orden",
        familia: "La familia",
        descripcion: "La descripción",
      };
      return `${fieldLabels[fieldName] || "Este campo"} es requerido`;
    }

    if (errors["minlength"]) {
      const minLength = errors["minlength"].requiredLength;
      return `Debe tener al menos ${minLength} caracteres`;
    }

    return "Campo inválido";
  }
}
