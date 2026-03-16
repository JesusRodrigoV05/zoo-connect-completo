import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgClass } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { InputNumberModule } from "primeng/inputnumber";
import { FloatLabel } from "primeng/floatlabel";
import { SelectModule } from "primeng/select";
import { TableModule } from "primeng/table";
import { RadioButtonModule } from "primeng/radiobutton";
import { TooltipModule } from "primeng/tooltip";
import { MessageModule } from "primeng/message";
import { AlimentacionStore } from "../../../stores/alimentacion.store";
import { ProductStore } from "@app/features/private/admin/stores/admin-productos.store";
import { UnidadesMedidaStore } from "@app/features/private/admin/stores/admin-unidades-medida.store";
import { EspecieStore } from "@stores/especies.store";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { AlimentacionService } from "../../../services/alimentacion-service";
import { ShowToast } from "@app/shared/services";
import {
  CreateDietaRequest,
  UpdateDietaRequest,
} from "../../../models/alimentacion.model";

@Component({
  selector: "app-crear-dieta",
  imports: [
    ReactiveFormsModule,
    NgClass,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    FloatLabel,
    SelectModule,
    TableModule,
    RadioButtonModule,
    TooltipModule,
    MessageModule,
  ],
  templateUrl: "./crear-dieta.html",
  styleUrl: "./crear-dieta.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearDieta implements OnInit {
  readonly dietaStore = inject(AlimentacionStore);
  readonly productStore = inject(ProductStore);
  readonly unidadesStore = inject(UnidadesMedidaStore);
  readonly especieStore = inject(EspecieStore);

  private adminAnimales = inject(AdminAnimales);
  private alimentacionService = inject(AlimentacionService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ShowToast);

  protected isEditMode = signal(false);
  protected dietaId = signal<number | null>(null);
  protected formSubmitted = signal(false);
  protected animalList = signal<{ label: string; value: number }[]>([]);

  protected pageTitle = computed(() =>
    this.isEditMode() ? "Editar Dieta" : "Nueva Dieta Nutricional",
  );

  protected isProcessing = computed(() => this.dietaStore.isSaving());

  protected isLoadingOptions = computed(
    () =>
      this.productStore.loading() ||
      this.unidadesStore.loading() ||
      this.especieStore.isLoading(),
  );

  form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    targetType: ["especie", [Validators.required]],
    targetId: [null as number | null, [Validators.required]],
    detalles: this.fb.array([]),
  });

  get detalles() {
    return this.form.get("detalles") as FormArray;
  }

  ngOnInit() {
    this.productStore.setPage(1, 100);
    this.productStore.updateFilters({
      tipoProductoId: 2,
      nombre: null,
    });
    this.productStore.loadProducts();
    this.unidadesStore.loadItems();
    this.especieStore.loadEspecies();

    this.adminAnimales.getAllAnimals(1, 100).subscribe((res) => {
      this.animalList.set(
        res.items.map((a) => ({ label: a.nombre, value: a.id_animal })),
      );
    });

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditMode.set(true);
      this.dietaId.set(+id);
      this.loadDietaData(+id);
    } else {
      this.addDetalle();
    }
  }

  private loadDietaData(id: number) {
    this.alimentacionService.getDietaById(id).subscribe({
      next: (data) => {
        const targetType = data.animalId ? "animal" : "especie";
        const targetId = data.animalId || data.especieId;

        this.form.patchValue({
          nombre: data.nombre,
          targetType: targetType,
          targetId: targetId,
        });

        data.detalles.forEach((d) => {
          this.addDetalle(d);
        });
      },
      error: (err) => {
        console.error(err);
        this.toast.showError("Error", "No se encontró la dieta");
        this.onCancel();
      },
    });
  }

  addDetalle(data?: any) {
    const group = this.fb.group({
      productoId: [data?.productoId || null, [Validators.required]],
      cantidad: [
        data?.cantidad || null,
        [Validators.required, Validators.min(0.01)],
      ],
      unidadMedidaId: [data?.unidadMedidaId || null, [Validators.required]],
      frecuencia: [data?.frecuencia || "", [Validators.required]],
    });
    this.detalles.push(group);
  }

  removeDetalle(index: number) {
    if (this.detalles.length > 1) {
      this.detalles.removeAt(index);
    } else {
      this.toast.showWarning(
        "Atención",
        "La dieta debe tener al menos un ingrediente.",
      );
    }
  }

  onTargetTypeChange() {
    this.form.get("targetId")?.setValue(null);
  }

  onSubmit() {
    this.formSubmitted.set(true);
    if (this.form.invalid) {
      this.toast.showWarning(
        "Formulario incompleto",
        "Revisa los campos requeridos.",
      );
      return;
    }

    const val = this.form.value;

    const request: CreateDietaRequest = {
      nombre: val.nombre!,
      animalId: val.targetType === "animal" ? val.targetId! : undefined,
      especieId: val.targetType === "especie" ? val.targetId! : undefined,
      detalles: val.detalles!.map((d: any) => ({
        productoId: d.productoId,
        unidadMedidaId: d.unidadMedidaId,
        cantidad: d.cantidad,
        frecuencia: d.frecuencia,
      })),
    };

    if (this.isEditMode() && this.dietaId()) {
      this.dietaStore.updateDieta({
        id: this.dietaId()!,
        data: request as UpdateDietaRequest,
      });
    } else {
      this.dietaStore.createDieta(request);
    }

    this.onCancel();
  }

  onCancel() {
    this.router.navigate(["/vet/dietas"]);
  }

  isInvalid(controlName: string, index?: number): boolean {
    let control;
    if (index !== undefined) {
      control = this.detalles.at(index).get(controlName);
    } else {
      control = this.form.get(controlName);
    }
    return !!(
      control &&
      control.invalid &&
      (control.dirty || control.touched || this.formSubmitted())
    );
  }
}
