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
import { TextareaModule } from "primeng/textarea";
import { CheckboxModule } from "primeng/checkbox";
import { MessageModule } from "primeng/message";
import { ShowToast } from "@app/shared/services";
import { TiposProductoStore } from "@app/features/private/admin/stores/admin-tipo-productos.store";
import { AdminTipoProductos } from "@app/features/private/admin/services/admin-tipo-productos";

@Component({
  selector: "app-crear-tipo",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    TextareaModule,
    CheckboxModule,
    MessageModule,
  ],
  templateUrl: "./crear-tipo.html",
  styleUrl: "./crear-tipo.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearTipo implements OnInit {
  readonly store = inject(TiposProductoStore);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly tipoService = inject(AdminTipoProductos);

  protected isEditMode = signal(false);
  protected formSubmitted = signal(false);
  protected tipoId = signal<number | null>(null);

  protected pageTitle = computed(() =>
    this.isEditMode() ? "Editar Tipo de Producto" : "Nuevo Tipo de Producto",
  );

  protected isProcessing = computed(() => this.store.isSaving());

  protected submitLabel = computed(() =>
    this.isProcessing()
      ? "Procesando..."
      : this.isEditMode()
        ? "Actualizar"
        : "Guardar",
  );

  protected form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    descripcion: ["", [Validators.required, Validators.minLength(5)]],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditMode.set(true);
      this.tipoId.set(+id);
      this.loadData(+id);
    }
  }

  private loadData(id: number) {
    this.tipoService.getTipoById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          isActive: data.isActive,
        });
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(["../"], { relativeTo: this.route });
      },
    });
  }

  protected onSubmit() {
    this.formSubmitted.set(true);
    if (this.form.invalid) return;

    const val = this.form.value;

    if (this.isEditMode() && this.tipoId()) {
      this.store.updateItem({
        id: this.tipoId()!,
        data: {
          nombre: val.nombre!,
          descripcion: val.descripcion!,
          isActive: val.isActive!,
        },
      });

      this.onCancel();
    } else {
      this.store.createItem({
        nombre: val.nombre!,
        descripcion: val.descripcion!,
      });

      this.onCancel();
    }
  }

  protected onCancel() {
    this.router.navigate(["/admin/inventario/tipo"]);
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
    if (control?.hasError("minlength")) return "El texto es muy corto";
    return "Campo inválido";
  }
}
