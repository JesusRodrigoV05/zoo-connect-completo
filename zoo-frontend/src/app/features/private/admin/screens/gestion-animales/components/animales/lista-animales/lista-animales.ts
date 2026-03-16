import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { Loader } from "@app/shared/components";
import { DataView, DataViewPageEvent } from "primeng/dataview";
import { AnimalItem } from "../animal-item";
import { ButtonModule } from "primeng/button";
import { Router, RouterLink } from "@angular/router";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DrawerModule } from "primeng/drawer";
import { TooltipModule } from "primeng/tooltip";
import { SelectButton } from "primeng/selectbutton";
import { AnimalDetalle } from "../animal-detalle";
import { ConfirmationService } from "primeng/api";
import { ShowToast } from "@app/shared/services";
import { PaginatedResponse } from "@models/common";
import { Animal } from "@models/animales";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

@Component({
  selector: "zoo-lista-animales",
  imports: [
    Loader,
    DataView,
    ButtonModule,
    RouterLink,
    AnimalItem,
    ConfirmDialogModule,
    DrawerModule,
    TooltipModule,
    AnimalDetalle,
    SelectButton,
    NgClass,
    FormsModule,
  ],
  providers: [ConfirmationService],
  templateUrl: "./lista-animales.html",
  styleUrl: "../../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListaAnimales {
  private readonly animalService = inject(AdminAnimales);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ShowToast);
  private confirmation = inject(ZooConfirmationService);

  protected readonly currentPage = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly animalData = signal<PaginatedResponse<Animal> | null>(
    null,
  );
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string | null>(null);

  protected readonly detalleVisible = signal(false);
  protected readonly idDetalleSeleccionado = signal<number | null>(null);

  protected readonly layout = signal<"list" | "grid">("list");
  protected readonly options = ["list", "grid"];

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const size = this.pageSize();
      this.loadAnimales(page, size);
    });
  }

  protected loadAnimales(page: number, size: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.animalService
      .getAllAnimals(page, size)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.animalData.set(response);
        },
        error: (err) => {
          console.error("Error al cargar animales:", err);
          this.error.set(
            err.message || "Ocurrió un error al cargar los animales.",
          );
          this.animalData.set(null);
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

  protected viewDetails(id: number): void {
    this.idDetalleSeleccionado.set(id);
    this.detalleVisible.set(true);
  }

  protected deleteAnimal(id: number): void {
    this.confirmation.delete({
      message:
        "¿Estás seguro de eliminar este animal? Esta acción es permanente.",
      accept: () => this.onDeleteConfirm(id),
    });
  }

  private onDeleteConfirm(id: number): void {
    this.loading.set(true);
    this.animalService
      .deleteAnimal(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            "Éxito",
            "Animal eliminado correctamente",
          );
          this.actualizarSignalTrasBorrado(id);
        },
        error: (err) => {
          this.toastService.showError(
            "Error",
            err.message || "No se pudo eliminar el animal.",
          );
        },
      });
  }

  private actualizarSignalTrasBorrado(id: number): void {
    this.animalData.update((currentData) => {
      if (!currentData) return null;
      const updatedItems = currentData.items.filter(
        (item) => item.id_animal !== id,
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
