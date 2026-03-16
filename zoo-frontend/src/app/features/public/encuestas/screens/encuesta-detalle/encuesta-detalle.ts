import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { EncuestaService } from "../../services/encuestas";
import { AsyncPipe } from "@angular/common";
import { MainContainer } from "@app/shared/components/main-container";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { CardModule } from "primeng/card";
import { RadioButtonModule } from "primeng/radiobutton";
import { CheckboxModule } from "primeng/checkbox";
import { TextareaModule } from "primeng/textarea";
import { ButtonModule } from "primeng/button";
import { ShowToast } from "@app/shared/services";
import { Encuesta } from "@models/encuestas";
import { CreateRespuesta } from "@models/encuestas/respuesta.model";
import { concatMap, forkJoin, map } from "rxjs";
import { Loader } from "@app/shared/components";
import { HasUnsavedChanges } from "@app/core/guards/unsaved-changes-guard";

@Component({
  selector: "app-encuesta-detalle",
  imports: [
    MainContainer,
    ReactiveFormsModule,
    CardModule,
    FormsModule,
    RadioButtonModule,
    CheckboxModule,
    TextareaModule,
    ButtonModule,
    Loader,
  ],
  templateUrl: "./encuesta-detalle.html",
  styleUrl: "./encuesta-detalle.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EncuestaDetalle implements OnInit, HasUnsavedChanges {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private encuestaService = inject(EncuestaService);
  private fb = inject(FormBuilder);
  private zooToast = inject(ShowToast);

  protected encuestaId: string;
  protected encuesta = signal<Encuesta | null>(null);

  public form = signal<FormGroup>(this.fb.group({}));
  public isSubmitting = signal(false);
  protected isLoading = signal(true);

  constructor() {
    this.encuestaId = this.route.snapshot.paramMap.get("id") || "";
  }

  ngOnInit(): void {
    if (!this.encuestaId) {
      this.zooToast.showError("Error", "No se proporcionó ID de encuesta");
      this.router.navigate(["/"]);
      return;
    }

    this.encuestaService.getSurveyById(this.encuestaId).subscribe({
      next: (encuestaData) => {
        const dynamicForm = this.createForm(encuestaData);
        this.form.set(dynamicForm);
        this.encuesta.set(encuestaData);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.zooToast.showError("Error", "No se pudo cargar la encuesta");
      },
    });
  }

  private createForm(encuesta: Encuesta): FormGroup {
    const group: Record<string, any> = {};

    encuesta.preguntas.forEach((pregunta) => {
      if (!pregunta.esOpcionUnica && pregunta.opciones.length > 0) {
        const checkboxGroup = this.fb.group(
          pregunta.opciones.reduce(
            (acc, opcion) => {
              acc[opcion.idOpcion.toString()] = new FormControl(false);
              return acc;
            },
            {} as Record<string, any>,
          ),
        );
        group[pregunta.idPregunta.toString()] = checkboxGroup;
      } else {
        group[pregunta.idPregunta.toString()] = new FormControl(
          null,
          Validators.required,
        );
      }
    });

    return this.fb.group(group);
  }

  protected onSubmit(): void {
    if (this.form().invalid) {
      this.zooToast.showError(
        "Error",
        "Por favor, responde todas las preguntas",
      );
      this.form().markAllAsTouched();
      return;
    }

    const currentEncuesta = this.encuesta();
    if (!currentEncuesta) {
      this.zooToast.showError("Error", "No se ha podido cargar la encuesta");
      return;
    }

    this.isSubmitting.set(true);
    const formValue = this.form().value;

    this.encuestaService
      .createParticipation(currentEncuesta.idEncuesta)
      .pipe(
        concatMap((participacion) => {
          const participacionId = participacion.idParticipacion;
          const respuestas: CreateRespuesta[] = [];

          currentEncuesta.preguntas.forEach((pregunta) => {
            const answer = formValue[pregunta.idPregunta];
            if (!pregunta.esOpcionUnica && pregunta.opciones.length > 0) {
              Object.keys(answer).forEach((opcionId) => {
                if (answer[opcionId]) {
                  respuestas.push({
                    participacionId: participacionId,
                    preguntaId: pregunta.idPregunta,
                    opcionId: parseInt(opcionId, 10),
                    respuestaTexto: null,
                  });
                }
              });
            } else if (pregunta.esOpcionUnica) {
              respuestas.push({
                participacionId: participacionId,
                preguntaId: pregunta.idPregunta,
                opcionId: answer,
                respuestaTexto: null,
              });
            } else {
              respuestas.push({
                participacionId: participacionId,
                preguntaId: pregunta.idPregunta,
                opcionId: null,
                respuestaTexto: answer,
              });
            }
          });

          const observables = respuestas.map((res) =>
            this.encuestaService.submitResponse(res),
          );
          return forkJoin(observables).pipe(map(() => participacionId));
        }),
        concatMap((participacionId) => {
          return this.encuestaService.updateParticipationStatus(
            participacionId,
            true,
          );
        }),
      )
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.form().markAsPristine();
          this.zooToast.showSuccess(
            "¡Gracias!",
            "Encuesta enviada exitosamente",
          );
          this.router.navigate(["/"]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.zooToast.showError(
            "Error",
            "No se pudieron enviar las respuestas",
          );
        },
      });
  }
}
