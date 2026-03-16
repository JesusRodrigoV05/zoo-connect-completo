import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from "@angular/core";
import { AdminHabitat } from "@app/features/private/admin/services/admin-habitat";
import { Loader } from "@app/shared/components";
import { DataView, DataViewPageEvent } from "primeng/dataview";
import { Router, RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { HabitatItem } from "../habitat-item";
import { PaginatedResponse } from "@models/common";
import { Habitat } from "@models/habitat";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { ShowToast } from "@app/shared/services";
import { ConfirmationService } from "primeng/api";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { FormsModule } from "@angular/forms";
import { SelectButtonModule } from "primeng/selectbutton";
import { NgClass } from "@angular/common";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

@Component({
  selector: "zoo-lista-habitats",
  imports: [
    Loader,
    DataView,
    ButtonModule,
    HabitatItem,
    ConfirmDialogModule,
    FormsModule,
    SelectButtonModule,
    NgClass,
  ],
  providers: [ConfirmationService],
  templateUrl: "./lista-habitats.html",
  styleUrl: "../../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListaHabitats {
  private router = inject(Router);
  private habitatService = inject(AdminHabitat);
  private destroyRef = inject(DestroyRef);
  toastService = inject(ShowToast);
  confirmation = inject(ZooConfirmationService);

  protected currentPage = signal(1);
  protected pageSize = signal(10);

  protected habitatData = signal<PaginatedResponse<Habitat> | null>(null);
  protected loading = signal<boolean>(true);
  protected error = signal<string | null>(null);

  protected readonly layout = signal<"list" | "grid">("list");
  protected readonly options: ("list" | "grid")[] = ["list", "grid"];

  constructor() {
    effect(() => {
      const page = this.currentPage();
      const size = this.pageSize();
      this.loadHabitats(page, size);
    });
  }

  protected navigateToCreate(): void {
    this.router.navigate(["/admin/animales/habitat/crear"]);
  }

  protected loadHabitats(page: number, size: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.habitatService
      .getAllHabitats(page, size)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (response) => {
          this.habitatData.set(response);
        },
        error: (err) => {
          console.error("Error al cargar hábitats:", err);
          this.error.set(
            err.message || "Ocurrió un error al cargar los hábitats.",
          );
          this.habitatData.set(null);
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

  protected deleteHabitat(id: number): void {
    this.confirmation.delete({
      message:
        "¿Estás seguro de que quieres eliminar este hábitat? Esta acción no se puede deshacer.",
      accept: () => this.onDeleteConfirm(id),
    });
  }

  private onDeleteConfirm(id: number): void {
    this.loading.set(true);

    this.habitatService
      .deleteHabitat(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: () => {
          this.toastService.showSuccess(
            "Éxito",
            "Hábitat eliminado correctamente",
          );

          this.habitatData.update((currentData) => {
            if (!currentData) return null;

            const updatedItems = currentData.items.filter(
              (item) => item.id !== id,
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
        },
        error: (err) => {
          this.toastService.showError(
            "Error",
            err.message || "No se pudo eliminar el hábitat",
          );
        },
      });
  }
}
