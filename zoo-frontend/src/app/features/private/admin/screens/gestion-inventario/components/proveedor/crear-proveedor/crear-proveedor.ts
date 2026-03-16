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
import { InputMaskModule } from "primeng/inputmask";
import { AdminProveedores } from "@app/features/private/admin/services/admin-proveedores";
import { ShowToast } from "@app/shared/services";
import {
  CreateProveedor,
  UpdateProveedor,
} from "@app/features/private/admin/models/productos.model";

@Component({
  selector: "app-crear-proveedor",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    CheckboxModule,
    MessageModule,
    InputMaskModule,
  ],
  templateUrl: "./crear-proveedor.html",
  styleUrl: "./crear-proveedor.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearProveedor implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly providerService = inject(AdminProveedores);
  private readonly toast = inject(ShowToast);

  protected isEditMode = signal(false);
  protected isProcessing = signal(false);
  protected formSubmitted = signal(false);
  protected providerId = signal<number | null>(null);

  protected pageTitle = computed(() =>
    this.isEditMode() ? "Editar Proveedor" : "Registrar Nuevo Proveedor",
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
    email: ["", [Validators.required, Validators.email]],
    telefono: ["", [Validators.required]],
    isActive: [true],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditMode.set(true);
      this.providerId.set(+id);
      this.loadProvider(+id);
    }
  }

  private loadProvider(id: number) {
    this.isProcessing.set(true);
    this.providerService
      .getProveedorById(id)
      .pipe(finalize(() => this.isProcessing.set(false)))
      .subscribe({
        next: (data) => {
          this.form.patchValue({
            nombre: data.nombre,
            email: data.email,
            telefono: data.telefono,
            isActive: data.isActive,
          });
        },
        error: (err) => {
          console.error(err);
          this.toast.showError(
            "Error",
            "No se pudo cargar la información del proveedor",
          );
          this.router.navigate(["../"], { relativeTo: this.route });
        },
      });
  }

  protected onSubmit() {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.toast.showWarning(
        "Formulario inválido",
        "Revisa los campos marcados en rojo.",
      );
      return;
    }

    this.isProcessing.set(true);
    const val = this.form.value;

    if (this.isEditMode() && this.providerId()) {
      const updateDto: UpdateProveedor = {
        nombre: val.nombre!,
        email: val.email!,
        telefono: val.telefono!,
        isActive: val.isActive!,
      };

      this.providerService
        .updateProveedor(this.providerId()!, updateDto)
        .pipe(finalize(() => this.isProcessing.set(false)))
        .subscribe({
          next: () => {
            this.toast.showSuccess(
              "Actualizado",
              "Proveedor modificado correctamente",
            );
            this.onCancel();
          },
          error: (err) => {
            this.toast.showError("Error", "No se pudo actualizar el proveedor");
          },
        });
    } else {
      const createDto: CreateProveedor = {
        nombre: val.nombre!,
        email: val.email!,
        telefono: val.telefono!,
      };

      this.providerService
        .createProveedor(createDto)
        .pipe(finalize(() => this.isProcessing.set(false)))
        .subscribe({
          next: () => {
            this.toast.showSuccess(
              "Creado",
              "Proveedor registrado exitosamente",
            );
            this.onCancel();
          },
          error: (err) => {
            this.toast.showError("Error", "No se pudo crear el proveedor");
          },
        });
    }
  }

  protected onCancel() {
    this.router.navigate(["/admin/inventario/proveedor"]);
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
    if (control?.hasError("required")) return "Este campo es obligatorio";
    if (control?.hasError("email")) return "Formato de correo inválido";
    if (control?.hasError("minlength")) return "El nombre es muy corto";
    return "Campo inválido";
  }
}
