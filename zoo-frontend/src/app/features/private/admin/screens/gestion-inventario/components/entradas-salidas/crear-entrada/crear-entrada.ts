import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { CreateEntradaRequest } from "@app/features/private/admin/models/entradas-salidas/transacciones.model";
import { ProductStore } from "@app/features/private/admin/stores/admin-productos.store";
import { ProveedoresStore } from "@app/features/private/admin/stores/admin-proveedores.store";
import { TransaccionesStore } from "@app/features/private/admin/stores/admin-transacciones.store";
import { ShowToast } from "@app/shared/services";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DatePickerModule } from "primeng/datepicker";
import { FloatLabel } from "primeng/floatlabel";
import { InputNumberModule } from "primeng/inputnumber";
import { InputTextModule } from "primeng/inputtext";
import { MessageModule } from "primeng/message";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-crear-entrada",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabel,
    SelectModule,
    DatePickerModule,
    MessageModule,
    TableModule,
    TooltipModule,
  ],
  templateUrl: "./crear-entrada.html",
  styleUrl: "./crear-entrada.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearEntrada implements OnInit {
  readonly transaccionesStore = inject(TransaccionesStore);
  readonly productStore = inject(ProductStore);
  readonly proveedoresStore = inject(ProveedoresStore);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ShowToast);

  isProcessing = computed(() => this.transaccionesStore.isSaving());

  form = this.fb.group({
    proveedorId: [null as number | null, [Validators.required]],
    detalles: this.fb.array([]),
  });

  get detalles() {
    return this.form.get("detalles") as FormArray;
  }

  ngOnInit() {
    this.productStore.loadProducts();
    this.proveedoresStore.loadItems();

    this.addProducto();
  }

  addProducto() {
    const detalleGroup = this.fb.group({
      productoId: [null as number | null, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      costoUnitario: [0, [Validators.required, Validators.min(0)]],
      lote: [""],
      fechaCaducidad: [null as Date | null],
    });

    this.detalles.push(detalleGroup);
  }

  removeProducto(index: number) {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    } else {
      this.toast.showWarning(
        "Atención",
        "Debe haber al menos un producto en la entrada.",
      );
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.showWarning(
        "Formulario inválido",
        "Completa todos los campos requeridos.",
      );
      return;
    }

    const val = this.form.value;

    const request: CreateEntradaRequest = {
      proveedorId: val.proveedorId!,
      detalles: val.detalles!.map((d: any) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        lote: d.lote || undefined,
        fechaCaducidad: this.formatDate(d.fechaCaducidad),
      })),
    };

    this.transaccionesStore.registrarEntrada(request);
  }

  onCancel() {
    this.router.navigate(["/admin/inventario/transacciones"]);
  }

  private formatDate(date: Date | null): string | undefined {
    if (!date) return undefined;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  isInvalid(controlName: string, index?: number): boolean {
    let control;
    if (index !== undefined) {
      control = this.detalles.at(index).get(controlName);
    } else {
      control = this.form.get(controlName);
    }
    return !!(control && control.invalid && (control.dirty || control.touched));
  }
}
