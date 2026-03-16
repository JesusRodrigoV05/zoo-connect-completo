import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  output,
} from "@angular/core";
import {
  FormBuilder,
  FormArray,
  ReactiveFormsModule,
  Validators,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { ShowToast } from "@app/shared/services";
import { MessageModule } from "primeng/message";
import { FloatLabel } from "primeng/floatlabel";
import { TextareaModule } from "primeng/textarea";
import { InputTextModule } from "primeng/inputtext";
import { SelectModule } from "primeng/select";
import { ButtonModule } from "primeng/button";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

export interface PreguntaDialogResult {
  texto_pregunta: string;
  es_opcion_unica: boolean;
  opciones: { texto_opcion: string; orden: number }[];
}

@Component({
  selector: "zoo-agregar-pregunta",
  imports: [
    NgTemplateOutlet,
    ButtonModule,
    ReactiveFormsModule,
    MessageModule,
    FloatLabel,
    InputTextModule,
    TextareaModule,
    SelectModule,
  ],
  templateUrl: "./agregar-pregunta.html",
  styleUrl: "./agregar-pregunta.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgregarPregunta {
  private readonly fb = inject(FormBuilder);
  private readonly zooToast = inject(ShowToast);
  confirmation = inject(ZooConfirmationService);

  protected readonly formSubmitted = signal(false);
  tipoOpciones: any[] | undefined;

  readonly dialogResult = output<PreguntaDialogResult | null>();

  constructor() {
    this.tipoOpciones = [
      { nombre: "Opción única", value: "opcion_unica" },
      { nombre: "Texto", value: "texto" },
    ];
  }

  protected readonly tipoSeleccionado = signal<"opcion_unica" | "texto">(
    "opcion_unica",
  );

  private readonly basicValidator: ValidatorFn[] = [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(500),
  ];

  protected readonly questionForm = this.fb.group({
    textoPregunta: ["", this.basicValidator],
    tipoPregunta: ["opcion_unica", Validators.required],
    opciones: this.fb.array([
      this.createOpcionControl(),
      this.createOpcionControl(),
    ]),
  });

  get opciones(): FormArray {
    return this.questionForm.get("opciones") as FormArray;
  }

  private createOpcionControl() {
    return this.fb.group({
      texto_opcion: ["", this.basicValidator],
    });
  }

  onTipoChange(): void {
    const tipo = this.questionForm.get("tipoPregunta")?.value;
    if (tipo === "opcion_unica" || tipo === "texto") {
      this.tipoSeleccionado.set(tipo);
    }

    if (tipo === "texto") {
      this.opciones.clear();
    } else if (tipo === "opcion_unica" && this.opciones.length === 0) {
      this.opciones.push(this.createOpcionControl());
      this.opciones.push(this.createOpcionControl());
    }
  }

  addOpcion(): void {
    if (this.opciones.length < 10) {
      this.opciones.push(this.createOpcionControl());
    }
  }

  removeOpcion(index: number, event: Event): void {
    if (this.opciones.length > 1) {
      this.confirmation.delete({
        key: "confirm-popup",
        target: event.currentTarget as EventTarget,
        message: "¿Estás seguro de que deseas eliminar esta opción?",
        accept: () => this.opciones.removeAt(index),
      });
    }
  }

  isFormValid(): boolean {
    const formValid = this.questionForm.valid;
    const tipoValido =
      this.tipoSeleccionado() === "texto" ||
      (this.tipoSeleccionado() === "opcion_unica" && this.opciones.length >= 2);

    return formValid && tipoValido;
  }

  save(): void {
    this.formSubmitted.set(true);
    if (!this.isFormValid()) {
      this.zooToast.showError(
        "Error",
        "Por favor corrige los errores del formulario",
      );
      return;
    }

    const formValue = this.questionForm.getRawValue();

    if (
      this.tipoSeleccionado() === "opcion_unica" &&
      formValue.opciones!.length < 2
    ) {
      this.zooToast.showError(
        "Error",
        "Las preguntas de opción única necesitan al menos 2 opciones",
      );
      return;
    }

    const result: PreguntaDialogResult = {
      texto_pregunta: formValue.textoPregunta!,
      es_opcion_unica: this.tipoSeleccionado() === "opcion_unica",
      opciones:
        this.tipoSeleccionado() === "opcion_unica"
          ? formValue.opciones!.map((opcion, index) => ({
              texto_opcion: opcion.texto_opcion!,
              orden: index + 1,
            }))
          : [],
    };
    this.dialogResult.emit(result);
    this.resetForm();
  }

  private resetForm(): void {
    this.formSubmitted.set(false);
    this.tipoSeleccionado.set("opcion_unica");

    this.questionForm.reset({
      textoPregunta: "",
      tipoPregunta: "opcion_unica",
    });

    this.opciones.clear();

    this.opciones.push(this.createOpcionControl());
    this.opciones.push(this.createOpcionControl());

    this.questionForm.markAsUntouched();
  }

  cancel(): void {
    this.dialogResult.emit(null);
    this.resetForm();
  }

  getErrorMessage(
    controlName: string,
    formGroup: AbstractControl | null = this.questionForm,
  ): string {
    if (!formGroup) return "";
    const control = formGroup.get(controlName);
    if (
      !control ||
      !control.errors ||
      !(control.touched || this.formSubmitted())
    )
      return "";

    const errors = control.errors;

    if (errors["required"]) {
      return `${this.getFieldDisplayName(controlName)} es requerido`;
    }
    if (errors["minlength"]) {
      const requiredLength = errors["minlength"].requiredLength;
      return `${this.getFieldDisplayName(controlName)} debe tener al menos ${requiredLength} caracteres`;
    }
    if (errors["maxlength"]) {
      const requiredLength = errors["maxlength"].requiredLength;
      return `${this.getFieldDisplayName(
        controlName,
      )} no debe exceder ${requiredLength} caracteres`;
    }

    return "Campo inválido";
  }
  isInvalid(
    controlName: string,
    formGroup: AbstractControl | null = this.questionForm,
  ): boolean {
    if (!formGroup) return false;
    const control = formGroup.get(controlName);
    return (
      !!control && control.invalid && (control.touched || this.formSubmitted())
    );
  }
  isOpcionInvalid(index: number, controlName: string): boolean {
    const opcionGroup = this.opciones.at(index);
    return this.isInvalid(controlName, opcionGroup);
  }

  getOpcionErrorMessage(index: number, controlName: string): string {
    const opcionGroup = this.opciones.at(index);
    return this.getErrorMessage(controlName, opcionGroup);
  }

  private getFieldDisplayName(controlName: string): string {
    const displayNames: Record<string, string> = {
      textoPregunta: "Texto de pregunta",
      tipoPregunta: "Tipo de pregunta",
      titulo: "Título",
      descripcion: "Descripción",
      fechaInicio: "Fecha de inicio",
      fechaFin: "Fecha de fin",
      preguntas: "Preguntas",
    };
    return displayNames[controlName] || "Campo";
  }
}
