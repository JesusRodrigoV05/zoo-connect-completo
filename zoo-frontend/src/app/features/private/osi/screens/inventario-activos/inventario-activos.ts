import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { DialogModule } from "primeng/dialog";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { SelectModule } from "primeng/select";
import { RatingModule } from "primeng/rating";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { MainContainer } from "@app/shared/components/main-container";
import { ShowToast } from "@app/shared/services";
import { InformationAsset, InformationAssetPayload, InformationAssetService } from "../../services/information-asset.service";

@Component({
  selector: "app-inventario-activos",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    RatingModule,
    ConfirmDialogModule,
    MainContainer,
  ],
  templateUrl: "./inventario-activos.html",
  styleUrl: "./inventario-activos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class InventarioActivos {
  private readonly service = inject(InformationAssetService);
  private readonly toast = inject(ShowToast);
  private readonly confirmService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly assets = signal<InformationAsset[]>([]);
  protected readonly loading = signal(true);
  protected readonly showDialog = signal(false);
  protected readonly saving = signal(false);

  protected readonly categories = [
    { label: "Software / Aplicaciones", value: "Software" },
    { label: "Hardware / Servidores", value: "Hardware" },
    { label: "Datos / Bases de Datos", value: "Datos" },
    { label: "Redes / Infraestructura", value: "Redes" },
    { label: "Personal / Roles", value: "Personal" },
  ];

  protected currentAsset: InformationAssetPayload = this.resetAsset();
  protected editingId: number | null = null;

  constructor() {
    this.loadAssets();
  }

  protected loadAssets(): void {
    this.loading.set(true);
    this.service
      .list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (data) => this.assets.set(data),
        error: () => this.toast.showError("Error", "No se pudieron cargar los activos"),
      });
  }

  protected openCreate(): void {
    this.editingId = null;
    this.currentAsset = this.resetAsset();
    this.showDialog.set(true);
  }

  protected openEdit(asset: InformationAsset): void {
    this.editingId = asset.id;
    this.currentAsset = {
      name: asset.name,
      description: asset.description,
      category: asset.category,
      confidentiality: asset.confidentiality,
      integrity: asset.integrity,
      availability: asset.availability,
      owner_id: asset.owner_id,
    };
    this.showDialog.set(true);
  }

  protected saveAsset(): void {
    if (!this.currentAsset.name || !this.currentAsset.category) {
      this.toast.showWarning("Validación", "Nombre y categoría son obligatorios");
      return;
    }

    this.saving.set(true);
    const obs = this.editingId
      ? this.service.update(this.editingId, this.currentAsset)
      : this.service.create(this.currentAsset);

    obs
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: () => {
          this.toast.showSuccess("Éxito", `Activo ${this.editingId ? "actualizado" : "creado"} correctamente`);
          this.showDialog.set(false);
          this.loadAssets();
        },
        error: () => this.toast.showError("Error", "No se pudo guardar el activo"),
      });
  }

  protected confirmDelete(id: number): void {
    this.confirmService.confirm({
      message: "¿Estás seguro de eliminar este activo? Podría afectar a la matriz de riesgos.",
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.service.delete(id).subscribe({
          next: () => {
            this.toast.showSuccess("Eliminado", "Activo eliminado");
            this.loadAssets();
          },
          error: () => this.toast.showError("Error", "No se pudo eliminar el activo"),
        });
      },
    });
  }

  private resetAsset(): InformationAssetPayload {
    return {
      name: "",
      description: "",
      category: "Software",
      confidentiality: 1,
      integrity: 1,
      availability: 1,
    };
  }

  protected getCriticidad(asset: InformationAsset): number {
    return Math.max(asset.confidentiality, asset.integrity, asset.availability);
  }
}
