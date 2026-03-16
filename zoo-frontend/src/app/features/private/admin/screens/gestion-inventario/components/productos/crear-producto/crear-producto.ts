import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
  viewChild,
} from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { InputTextModule } from "primeng/inputtext";
import { FloatLabel } from "primeng/floatlabel";
import { TextareaModule } from "primeng/textarea";
import { InputNumberModule } from "primeng/inputnumber";
import { SelectModule } from "primeng/select";
import { CheckboxModule } from "primeng/checkbox";
import { StepperModule } from "primeng/stepper";
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import { ImageModule } from "primeng/image";
import { MessageModule } from "primeng/message";
import { ProductStore } from "@app/features/private/admin/stores/admin-productos.store";
import { TiposProductoStore } from "@app/features/private/admin/stores/admin-tipo-productos.store";
import { UnidadesMedidaStore } from "@app/features/private/admin/stores/admin-unidades-medida.store";
import { AdminInventario } from "@app/features/private/admin/services/admin-inventario";
import { ShowToast } from "@app/shared/services";
import {
  CreateProducto,
  UpdateProducto,
} from "@app/features/private/admin/models/productos.model";

@Component({
  selector: "app-crear-producto",
  imports: [
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    FloatLabel,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    CheckboxModule,
    StepperModule,
    FileUploadModule,
    ImageModule,
    MessageModule,
  ],
  templateUrl: "./crear-producto.html",
  styleUrl: "./crear-producto.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CrearProducto implements OnInit {
  readonly productStore = inject(ProductStore);
  readonly tiposStore = inject(TiposProductoStore);
  readonly unidadesStore = inject(UnidadesMedidaStore);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly inventoryService = inject(AdminInventario);
  private readonly toast = inject(ShowToast);

  fileUploader = viewChild<FileUpload>("fileUploader");

  protected isEditMode = signal(false);
  protected activeStep = signal(1);
  protected formSubmitted = signal(false);
  protected productId = signal<number | null>(null);

  protected selectedFile = signal<File | undefined>(undefined);
  protected currentImageUrl = signal<string | undefined>(undefined);

  protected pageTitle = computed(() =>
    this.isEditMode() ? "Editar Producto" : "Registrar Nuevo Producto",
  );

  protected isProcessing = computed(() => this.productStore.isSaving());

  protected isLoadingOptions = computed(
    () => this.tiposStore.loading() || this.unidadesStore.loading(),
  );

  protected form = this.fb.group({
    nombre: ["", [Validators.required, Validators.minLength(3)]],
    descripcion: ["", [Validators.required]],
    stockMinimo: [5, [Validators.required, Validators.min(0)]],
    tipoProductoId: [null as number | null, [Validators.required]],
    unidadMedidaId: [null as number | null, [Validators.required]],
    isActive: [true],
  });

  ngOnInit(): void {
    this.tiposStore.loadItems();
    this.unidadesStore.loadItems();

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(+id);
      this.loadProductData(+id);
    }
  }

  private loadProductData(id: number) {
    this.inventoryService.getProductById(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nombre: data.nombre,
          descripcion: data.descripcion,
          stockMinimo: data.stockMinimo,
          tipoProductoId: data.tipoProductoId,
          unidadMedidaId: data.unidadMedidaId,
          isActive: data.isActive,
        });
        this.currentImageUrl.set(data.photoUrl);
      },
      error: (err) => {
        console.error(err);
        this.toast.showError("Error", "No se encontró el producto");
        this.onCancel();
      },
    });
  }

  onFileSelect(event: any) {
    if (event.files && event.files.length > 0) {
      this.selectedFile.set(event.files[0]);
    }
  }

  onFileClear() {
    this.selectedFile.set(undefined);
  }

  nextStep() {
    this.formSubmitted.set(true);
    if (this.activeStep() === 1) {
      if (this.form.valid) {
        this.activeStep.set(2);
        this.formSubmitted.set(false);
      } else {
        this.toast.showWarning(
          "Datos incompletos",
          "Por favor completa el formulario.",
        );
      }
    }
  }

  prevStep() {
    this.activeStep.set(1);
  }

  finishProcess() {
    const val = this.form.value;
    const file = this.selectedFile();

    if (this.isEditMode() && this.productId()) {
      const updateDto: UpdateProducto = {
        nombre: val.nombre!,
        descripcion: val.descripcion!,
        stockMinimo: val.stockMinimo!,
        tipoProductoId: val.tipoProductoId!,
        unidadMedidaId: val.unidadMedidaId!,
        isActive: val.isActive!,
      };

      this.productStore.updateProduct({
        id: this.productId()!,
        data: updateDto,
        file: file,
      });

      this.onCancel();
    } else {
      const createDto: CreateProducto = {
        nombre: val.nombre!,
        descripcion: val.descripcion!,
        stockMinimo: val.stockMinimo!,
        tipoProductoId: val.tipoProductoId!,
        unidadMedidaId: val.unidadMedidaId!,
      };

      this.productStore.createProduct({
        data: createDto,
        file: file,
      });

      this.onCancel();
    }
  }

  protected onCancel() {
    this.router.navigate(["/admin/inventario/"]);
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
    return "Campo requerido";
  }
}
