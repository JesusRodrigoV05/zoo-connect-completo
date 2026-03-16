import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { finalize } from "rxjs/operators";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { CheckboxModule } from "primeng/checkbox";
import { MessageModule } from "primeng/message";
import { UnidadesMedidaStore } from "@app/features/private/admin/stores/admin-unidades-medida.store";
import { AdminUnidadesMedida } from "@app/features/private/admin/services/admin-unidades-medida";
import { ShowToast } from "@app/shared/services";

@Component({
  selector: "app-crear-unidad",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    CheckboxModule,
    MessageModule,
  ],
  templateUrl: "./crear-unidad.html",
  styleUrl: "./crear-unidad.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearUnidad implements OnInit {
  readonly store = inject(UnidadesMedidaStore);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly unidadService = inject(AdminUnidadesMedida);
  private readonly toast = inject(ShowToast);

  protected isEditMode = signal(false);
  protected formSubmitted = signal(false);
  protected unidadId = signal<number | null>(null);

  protected isProcessing = computed(() => this.store.isSaving());

  protected pageTitle = computed(() =>
    this.isEditMode() ? "Editar Unidad de Medida" : "Nueva Unidad de Medida",
  );

  protected submitLabel = computed(() =>
    this.isProcessing()
      ? "Procesando..."
      : this.isEditMode()
        ? "Actualizar"
        : "Guardar",
  );

  protected form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    abreviatura: ["", [Validators.required, Validators.maxLength(10)]],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditMode.set(true);
      this.unidadId.set(+id);
      this.loadData(+id);
    }
  }

  private loadData(id: number) {
    this.unidadService.getUnidadById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nombre: data.nombre,
          abreviatura: data.abreviatura,
          isActive: data.isActive,
        });
      },
      error: (err) => {
        console.error(err);
        this.toast.showError("Error", "No se pudo cargar la unidad");
        this.onCancel();
      },
    });
  }

  protected onSubmit() {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.toast.showWarning("Inválido", "Revisa los campos requeridos");
      return;
    }

    const val = this.form.value;

    if (this.isEditMode() && this.unidadId()) {
      this.store.updateItem({
        id: this.unidadId()!,
        data: {
          nombre: val.nombre!,
          abreviatura: val.abreviatura!,
          isActive: val.isActive!,
        },
      });

      this.onCancel();
    } else {
      this.store.createItem({
        nombre: val.nombre!,
        abreviatura: val.abreviatura!,
      });

      this.onCancel();
    }
  }

  protected onCancel() {
    this.router.navigate(["/admin/inventario/unidades"]);
  }

  protected isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.formSubmitted())
    );
  }

  protected getError(field: string): string {
    const control = this.form.get(field);
    if (control?.hasError("required")) return "Campo obligatorio";
    if (control?.hasError("minlength")) return "Muy corto";
    if (control?.hasError("maxlength")) return "Muy largo (máx 10 chars)";
    return "Inválido";
  }
}
