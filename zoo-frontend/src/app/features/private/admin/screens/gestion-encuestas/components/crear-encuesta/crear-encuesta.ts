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
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  FormArray,
  AbstractControl,
  FormGroup,
} from "@angular/forms";
import { DatePickerModule } from "primeng/datepicker";
import { MessageModule } from "primeng/message";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { TextareaModule } from "primeng/textarea";
import { NgTemplateOutlet } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { ShowToast } from "@app/shared/services";
import { ActivatedRoute, Router } from "@angular/router";
import { AgregarPregunta, PreguntaDialogResult } from "../agregar-pregunta";
import { AdminEncuestas } from "@app/features/private/admin/services/admin-encuestas";
import { finalize } from "rxjs/operators";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { AccordionModule } from "primeng/accordion";
import { TooltipModule } from "primeng/tooltip";
import { Loader } from "@app/shared/components";
import { CreatePregunta, Encuesta } from "@models/encuestas";
import { forkJoin, Observable, of } from "rxjs";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

type OpcionFormValue = {
  idOpcion: number | null;
  texto_opcion: string;
};

type PreguntaFormValue = {
  idPregunta: number | null;
  texto_pregunta: string;
  es_opcion_unica: boolean;
  opciones: OpcionFormValue[];
};

@Component({
  selector: "app-crear-encuesta",
  imports: [
    NgTemplateOutlet,
    DialogModule,
    ReactiveFormsModule,
    DatePickerModule,
    MessageModule,
    InputTextModule,
    TextareaModule,
    FloatLabel,
    AgregarPregunta,
    CardModule,
    ButtonModule,
    AccordionModule,
    TooltipModule,
    Loader,
  ],
  templateUrl: "./crear-encuesta.html",
  styleUrl: "./crear-encuesta.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearEncuesta implements OnInit {
  private fb = inject(FormBuilder);
  private zooToast = inject(ShowToast);
  confirmation = inject(ZooConfirmationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private adminEncuestas = inject(AdminEncuestas);

  protected readonly formSubmitted = signal(false);
  protected readonly isCreating = signal(false);
  protected readonly showDialog = signal(false);

  protected isEditMode = false;
  protected pageTitle = "Crear Nueva Encuesta";
  protected buttonText = "Crear Encuesta";
  private encuestaId: string | null = null;

  private preguntasAEliminar: number[] = [];

  private readonly basicValidator: ValidatorFn[] = [
    Validators.required,
    Validators.minLength(2),
  ];

  protected readonly encuestaForm = this.fb.group({
    titulo: ["", [...this.basicValidator, Validators.maxLength(255)]],
    descripcion: ["", [...this.basicValidator, Validators.maxLength(1000)]],
    fechaInicio: [new Date(), Validators.required],
    fechaFin: [new Date(), Validators.required],
    preguntas: this.fb.array([] as FormGroup[], [
      Validators.required,
      Validators.minLength(1),
    ]),
  });

  ngOnInit(): void {
    this.encuestaId = this.route.snapshot.paramMap.get("id");

    if (this.encuestaId) {
      this.isEditMode = true;
      this.pageTitle = "Actualizar Encuesta";
      this.buttonText = "Guardar Cambios";

      this.minDateInicio = null;

      this.loadEncuestaData(this.encuestaId);
    }
  }

  private loadEncuestaData(id: string): void {
    this.isCreating.set(true);
    this.adminEncuestas
      .getSurveyById(id)
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: (encuesta: Encuesta) => {
          this.encuestaForm.patchValue({
            titulo: encuesta.titulo,
            descripcion: encuesta.descripcion,
            fechaInicio: new Date(encuesta.fechaInicio),
            fechaFin: new Date(encuesta.fechaFin),
          });

          this.preguntas.clear();

          encuesta.preguntas.forEach((pregunta) => {
            const opcionesArray = this.fb.array(
              pregunta.opciones.map((op) =>
                this.fb.group({
                  idOpcion: [op.idOpcion],
                  texto_opcion: [op.textoOpcion, this.basicValidator],
                }),
              ),
            );

            const preguntaGroup = this.fb.group({
              idPregunta: [pregunta.idPregunta],
              texto_pregunta: [pregunta.textoPregunta, this.basicValidator],
              es_opcion_unica: [pregunta.esOpcionUnica],
              opciones: opcionesArray,
            });

            this.preguntas.push(preguntaGroup);
          });
        },
        error: (err) => {
          this.zooToast.showError(
            "Error",
            `No se pudo cargar la encuesta: ${err.message}`,
          );
          this.router.navigate(["/admin/encuestas"]);
        },
      });
  }

  get preguntas(): FormArray {
    return this.encuestaForm.get("preguntas") as FormArray;
  }

  protected minDateInicio: Date | null = new Date();

  protected minDateFin = computed(() => {
    const fechaInicio = this.encuestaForm.get("fechaInicio")?.value;
    return fechaInicio ? new Date(fechaInicio) : new Date();
  });

  protected getOpciones(pregunta: AbstractControl): FormArray {
    return pregunta.get("opciones") as FormArray;
  }

  protected getPreguntaTipoTexto(pregunta: AbstractControl): string {
    const esOpcionUnica = pregunta.get("es_opcion_unica")?.value;
    if (esOpcionUnica) {
      const opciones = this.getOpciones(pregunta);
      const length = opciones.controls.length;
      return `${length} ${length === 1 ? "opción" : "opciones"}`;
    }
    return "Respuesta de texto";
  }

  protected onSubmit(): void {
    this.formSubmitted.set(true);

    if (this.encuestaForm.invalid) {
      this.zooToast.showError(
        "Error",
        "Por favor, completa todos los campos requeridos",
      );
      return;
    }

    if (this.preguntas.length === 0) {
      this.zooToast.showError("Error", "Debes agregar al menos una pregunta.");
      return;
    }

    this.isCreating.set(true);

    if (this.isEditMode && this.encuestaId) {
      this.handleUpdateSurvey(this.encuestaId);
    } else {
      this.handleCreateSurvey();
    }
  }

  private handleCreateSurvey(): void {
    const formValue = this.encuestaForm.getRawValue();
    const preguntasValue = formValue.preguntas as PreguntaFormValue[];

    const payload = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      fecha_inicio: (formValue.fechaInicio as Date).toISOString(),
      fecha_fin: (formValue.fechaFin as Date).toISOString(),
      preguntas: preguntasValue.map((p, i) => ({
        texto_pregunta: p.texto_pregunta,
        es_opcion_unica: p.es_opcion_unica,
        orden: i + 1,
        opciones: p.es_opcion_unica
          ? p.opciones.map((op, j) => ({
              texto_opcion: op.texto_opcion,
              orden: j + 1,
            }))
          : [],
      })),
    };

    this.adminEncuestas
      .createSurvey(payload)
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: () => {
          this.zooToast.showSuccess("Éxito", "Encuesta creada exitosamente");
          this.router.navigate(["/admin/encuestas"]);
        },
        error: (err) => {
          this.zooToast.showError("Error", `No se pudo crear: ${err.message}`);
        },
      });
  }

  private handleUpdateSurvey(encuestaId: string): void {
    const formValue = this.encuestaForm.getRawValue();
    const observables: Observable<any>[] = [];

    const basePayload = {
      titulo: formValue.titulo,
      descripcion: formValue.descripcion,
      fecha_inicio: (formValue.fechaInicio as Date).toISOString(),
      fecha_fin: (formValue.fechaFin as Date).toISOString(),
      is_active: true,
    };
    observables.push(
      this.adminEncuestas.updateSurvey(parseInt(encuestaId), basePayload),
    );

    this.preguntasAEliminar.forEach((idPregunta) => {
      observables.push(this.adminEncuestas.deletePregunta(idPregunta));
    });

    const preguntasForm = formValue.preguntas as PreguntaFormValue[];
    preguntasForm.forEach((pregunta, index) => {
      if (pregunta.idPregunta === null) {
        const createPreguntaPayload: CreatePregunta = {
          textoPregunta: pregunta.texto_pregunta,
          esOpcionUnica: pregunta.es_opcion_unica,
          orden: index + 1,
          opciones: pregunta.opciones.map((op, j) => ({
            textoOpcion: op.texto_opcion,
            orden: j + 1,
          })),
        };
        observables.push(
          this.adminEncuestas.addPreguntaToSurvey(
            parseInt(encuestaId),
            createPreguntaPayload,
          ),
        );
      }
    });

    if (observables.length === 0) {
      observables.push(of(null));
    }

    forkJoin(observables)
      .pipe(finalize(() => this.isCreating.set(false)))
      .subscribe({
        next: () => {
          this.zooToast.showSuccess(
            "Éxito",
            "Encuesta actualizada exitosamente",
          );
          this.router.navigate(["/admin/encuestas"]);
        },
        error: (err) => {
          this.zooToast.showError(
            "Error",
            `No se pudo actualizar: ${err.message}`,
          );
        },
      });
  }

  protected onCancel(): void {
    this.router.navigate(["/admin/encuestas"]);
  }

  protected addPregunta(): void {
    this.showDialog.set(true);
  }

  protected onDialogResult(result: PreguntaDialogResult | null): void {
    this.showDialog.set(false);

    if (result) {
      const opcionesArray = this.fb.array(
        result.opciones.map((op) =>
          this.fb.group({
            idOpcion: [null],
            texto_opcion: [op.texto_opcion, this.basicValidator],
          }),
        ),
      );

      const preguntaGroup = this.fb.group({
        idPregunta: [null],
        texto_pregunta: [result.texto_pregunta, this.basicValidator],
        es_opcion_unica: [result.es_opcion_unica],
        opciones: opcionesArray,
      });

      this.preguntas.push(preguntaGroup);
      this.zooToast.showSuccess("Éxito", "Pregunta agregada");
    }
  }

  protected removePregunta(index: number, event: Event): void {
    this.confirmation.delete({
      key: "confirm-popup",
      target: event.currentTarget as EventTarget,
      message: "¿Estás seguro de que deseas eliminar esta pregunta?",
      accept: () => {
        if (this.isEditMode) {
          const idPregunta = this.preguntas.at(index).get("idPregunta")?.value;
          if (idPregunta) {
            this.preguntasAEliminar.push(idPregunta);
          }
        }
        this.preguntas.removeAt(index);
        this.zooToast.showSuccess("Éxito", "Pregunta eliminada");
      },
    });
  }

  protected isInvalid(
    fieldName: string,
    formGroup: AbstractControl = this.encuestaForm,
  ): boolean {
    const field = formGroup.get(fieldName);
    return !!(
      field?.invalid &&
      (field?.dirty || field?.touched || this.formSubmitted())
    );
  }

  protected getErrorMessage(
    fieldName: string,
    formGroup: AbstractControl = this.encuestaForm,
  ): string {
    const field = formGroup.get(fieldName);
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
      if (field.errors["maxlength"]) {
        const requiredLength = field.errors["maxlength"].requiredLength;
        return `${this.getFieldDisplayName(
          fieldName,
        )} no debe exceder ${requiredLength} caracteres`;
      }
    }
    return "";
  }

  private getFieldDisplayName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      titulo: "El título",
      descripcion: "La descripción",
      fechaInicio: "La fecha de inicio",
      fechaFin: "La fecha de fin",
    };
    return fieldNames[fieldName] || fieldName;
  }
}
