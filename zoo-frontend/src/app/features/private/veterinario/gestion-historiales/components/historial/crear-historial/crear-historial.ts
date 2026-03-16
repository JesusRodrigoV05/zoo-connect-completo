import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "primeng/api";
import { finalize } from "rxjs";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { TextareaModule } from "primeng/textarea";
import { ButtonModule } from "primeng/button";
import { AccordionModule } from "primeng/accordion";
import { RippleModule } from "primeng/ripple";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { VetHistoriales } from "@app/features/private/veterinario/services/historiales/vet-historiales";
import { ConfiguracionStore } from "@app/features/private/veterinario/stores/historiales/configuracion.store";
import { HistorialesListaStore } from "@app/features/private/veterinario/stores/historiales/historiales.store";
import { Animal } from "@models/animales";

@Component({
  selector: "app-crear-historial",
  imports: [
    ReactiveFormsModule,
    SelectModule,
    InputTextModule,
    InputNumberModule,
    TextareaModule,
    ButtonModule,
    AccordionModule,
    RippleModule,
  ],
  templateUrl: "./crear-historial.html",
  styleUrl: "./crear-historial.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearHistorial implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private animalesService = inject(AdminAnimales);
  private historialService = inject(VetHistoriales);
  private messageService = inject(MessageService);

  readonly configStore = inject(ConfiguracionStore);
  readonly listaStore = inject(HistorialesListaStore);

  animales = signal<Animal[]>([]);
  loadingAnimales = signal<boolean>(false);
  saving = signal<boolean>(false);

  form: FormGroup = this.fb.group({
    animal_id: [null, [Validators.required]],
    tipo_atencion_id: [null, [Validators.required]],
    peso_actual: [null],
    temperatura: [null],
    frecuencia_cardiaca: [null],
    frecuencia_respiratoria: [null],
    anamnesis: [null],
    examen_fisico_obs: [null],
    diagnostico_presuntivo: [null],
    diagnostico_definitivo: [null],
  });

  ngOnInit() {
    this.cargarAnimales();

    if (this.configStore.tiposAtencion().length === 0) {
      this.configStore.loadCatalogs();
    }
  }

  cargarAnimales() {
    this.loadingAnimales.set(true);
    this.animalesService
      .getAllAnimals(1, 100)
      .pipe(finalize(() => this.loadingAnimales.set(false)))
      .subscribe({
        next: (resp) => {
          this.animales.set(resp.items);
        },
        error: () =>
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "Error al cargar pacientes",
          }),
      });
  }

  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValues = this.form.value;

    const domainData = {
      anamnesis: formValues.anamnesis,
      peso: formValues.peso_actual,
      temperatura: formValues.temperatura,
      frecuenciaCardiaca: formValues.frecuencia_cardiaca,
      frecuenciaRespiratoria: formValues.frecuencia_respiratoria,
      examenFisico: formValues.examen_fisico_obs,
      diagnosticoPresuntivo: formValues.diagnostico_presuntivo,
      diagnosticoDefinitivo: formValues.diagnostico_definitivo,
      animalId: formValues.animal_id,
      tipoAtencionId: formValues.tipo_atencion_id,
      abierto: true,
    };

    this.historialService
      .createHistorial(domainData as any)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: "success",
            summary: "Creado",
            detail: "Historial clínico iniciado",
          });
          this.listaStore.loadHistoriales();
          this.regresar();
        },
        error: (err) => {
          console.error(err);
          this.messageService.add({
            severity: "error",
            summary: "Error",
            detail: "No se pudo crear el historial. Verifique los campos.",
          });
        },
      });
  }

  regresar() {
    this.router.navigate(["../"], { relativeTo: this.route });
  }
}
