import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { AdminEspecies } from "@app/features/private/admin/services/admin-especies";
import { Loader } from "@app/shared/components";
import { DataView, DataViewPageEvent } from "primeng/dataview";
import { EspecieItem } from "../especie-item";
import { ButtonModule } from "primeng/button";
import { Router } from "@angular/router";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { ShowToast } from "@app/shared/services";
import { PaginatedResponse } from "@models/common";
import { Especie } from "@models/animales";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { DrawerModule } from "primeng/drawer";
import { EspecieDetalle } from "../especie-detalle";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

@Component({
  selector: "app-lista-especies",
  imports: [
    Loader,
    DataView,
    EspecieItem,
    ButtonModule,
    ConfirmDialogModule,
    DrawerModule,
    EspecieDetalle,
  ],
  providers: [ConfirmationService],
  templateUrl: "./lista-especies.html",
  styleUrl: "../../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListaEspecies {
  private readonly especiesService = inject(AdminEspecies);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ShowToast);
  private confirmation = inject(ZooConfirmationService);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly especieData = signal<PaginatedResponse<Especie> | null>(
    null,
  );
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly detalleVisible = signal(false);
  protected readonly idDetalleSeleccionado = signal<number | null>(null);

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const size = this.pageSize();
      this.loadEspecies(page, size);
    });
  }

  protected loadEspecies(page: number, size: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.especiesService
      .getAllSpecies(page, size)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.especieData.set(response);
        },
        error: (err) => {
          console.error("Error al cargar especies:", err);
          this.error.set(
            err.message || "Ocurrió un error al cargar las especies.",
          );
          this.especieData.set(null);
        },
      });
  }

  protected onPageChange(event: DataViewPageEvent): void {
    const nextPage = event.first / event.rows + 1;

    if (nextPage !== this.currentPage()) {
      this.currentPage.set(nextPage);
    }
    if (event.rows !== this.pageSize()) {
      this.pageSize.set(event.rows);
    }
  }

  protected navigateToCreate(): void {
    this.router.navigate(["/admin/animales/especies/crear"]);
  }

  protected navigateToEdit(id: number): void {
    this.router.navigate(["/admin/animales/especies/editar", id]);
  }

  protected viewDetails(id: number): void {
    this.idDetalleSeleccionado.set(id);
    this.detalleVisible.set(true);
  }

  protected cerrarDetalle(): void {
    this.detalleVisible.set(false);
  }

  protected deleteEspecie(id: number): void {
    this.confirmation.delete({
      message:
        "¿Estás seguro de eliminar esta especie? Esta acción no se puede deshacer.",
      accept: () => this.onDeleteConfirm(id),
    });
  }

  private onDeleteConfirm(id: number): void {
    this.loading.set(true);

    this.especiesService
      .deleteSpecies(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            "Éxito",
            "Especie eliminada correctamente",
          );
          this.actualizarSignalTrasBorrado(id);
        },
        error: (err) => {
          this.toastService.showError(
            "Error",
            err.message || "No se pudo eliminar la especie.",
          );
        },
      });
  }

  private actualizarSignalTrasBorrado(id: number): void {
    this.especieData.update((currentData) => {
      if (!currentData) return null;

      const updatedItems = currentData.items.filter(
        (item) => item.idEspecie !== id,
      );

      if (updatedItems.length === 0 && this.currentPage() > 1) {
        this.currentPage.update((page) => page - 1);
      }

      return {
        ...currentData,
        items: updatedItems,
        total: currentData.total - 1,
      };
    });
  }
}
