import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
} from "@angular/core";
import {
  FormBuilder,
  FormArray,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { FloatLabel } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { DatePickerModule } from "primeng/datepicker";
import { MessageModule } from "primeng/message";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { TransaccionesStore } from "@app/features/private/admin/stores/admin-transacciones.store";
import { ProductStore } from "@app/features/private/admin/stores/admin-productos.store";
import { ProveedoresStore } from "@app/features/private/admin/stores/admin-proveedores.store";
import { ShowToast } from "@app/shared/services";
import {
  CreateEntradaRequest,
  CreateSalidaRequest,
} from "@app/features/private/admin/models/entradas-salidas/transacciones.model";
import { TiposSalidaStore } from "@app/features/private/admin/stores/admin-tipo-salidas.store";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { AdminHabitat } from "@app/features/private/admin/services/admin-habitat";
import { TextareaModule } from "primeng/textarea";

@Component({
  selector: "app-crear-salida",
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
    TextareaModule,
    TooltipModule,
  ],
  templateUrl: "./crear-salida.html",
  styleUrl: "./crear-salida.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearSalida implements OnInit {
  readonly transaccionesStore = inject(TransaccionesStore);
  readonly productStore = inject(ProductStore);
  readonly tiposSalidaStore = inject(TiposSalidaStore);
  private adminAnimales = inject(AdminAnimales);
  private adminHabitat = inject(AdminHabitat);

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toast = inject(ShowToast);

  isProcessing = computed(() => this.transaccionesStore.isSaving());

  animalList = signal<{ label: string; value: number }[]>([]);
  habitatList = signal<{ label: string; value: number }[]>([]);

  destinosOptions = [
    { label: "General", value: "general" },
    { label: "Animal", value: "animal" },
    { label: "Hábitat", value: "habitat" },
  ];

  form = this.fb.group({
    tipoSalidaId: [null as number | null, [Validators.required]],
    observacion: [""],
    detalles: this.fb.array([]),
  });

  get detalles() {
    return this.form.get("detalles") as FormArray;
  }

  ngOnInit() {
    this.productStore.loadProducts();
    this.tiposSalidaStore.loadItems();

    this.loadDestinos();

    this.addProducto();
  }

  private loadDestinos() {
    this.adminAnimales.getAllAnimals(1, 100).subscribe((res) => {
      this.animalList.set(
        res.items.map((a) => ({ label: a.nombre, value: a.id_animal })),
      );
    });

    this.adminHabitat.getAllHabitats(1, 100).subscribe((res) => {
      this.habitatList.set(
        res.items.map((h) => ({ label: h.nombre, value: h.id })),
      );
    });
  }

  addProducto() {
    const detalleGroup = this.fb.group({
      productoId: [null as number | null, [Validators.required]],
      cantidad: [1, [Validators.required, Validators.min(0.01)]],
      tipoDestino: ["general"],
      destinoId: [null as number | null],
    });

    this.detalles.push(detalleGroup);
  }

  removeProducto(index: number) {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    } else {
      this.toast.showWarning(
        "Atención",
        "Debe haber al menos un ítem en la salida.",
      );
    }
  }

  onDestinoTypeChange(index: number) {
    this.detalles.at(index).get("destinoId")?.setValue(null);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.showWarning(
        "Formulario incompleto",
        "Revisa los campos requeridos.",
      );
      return;
    }

    const val = this.form.value;

    const request: CreateSalidaRequest = {
      tipoSalidaId: val.tipoSalidaId!,
      detalles: val.detalles!.map((d: any) => ({
        productoId: d.productoId,
        cantidad: d.cantidad,
        animalId: d.tipoDestino === "animal" ? d.destinoId : undefined,
        habitatId: d.tipoDestino === "habitat" ? d.destinoId : undefined,
      })),
    };

    this.transaccionesStore.registrarSalida(request);
  }

  onCancel() {
    this.router.navigate(["/admin/inventario/transacciones"]);
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
