import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Loader } from "@app/shared/components";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DataViewModule } from "primeng/dataview";
import { PaginatorModule } from "primeng/paginator";
import { SelectButtonModule } from "primeng/selectbutton";
import { ProductoItem } from "../producto-item";
import { ProductStore } from "@app/features/private/admin/stores/admin-productos.store";
import { ConfirmationService } from "primeng/api";
import { ShowToast } from "@app/shared/services";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { GenerarReportes } from "@app/shared/services/generar-reportes";

@Component({
  selector: "app-lista-producto",
  imports: [
    DataViewModule,
    ButtonModule,
    SelectButtonModule,
    PaginatorModule,
    ConfirmDialogModule,
    RouterLink,
    FormsModule,
    Loader,
    ProductoItem,
  ],
  templateUrl: "./lista-producto.html",
  styleUrl: "../../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class ListaProducto implements OnInit {
  readonly store = inject(ProductStore);
  readonly router = inject(Router);
  private confirm = inject(ZooConfirmationService);
  private toast = inject(ShowToast);
  private reportesService = inject(GenerarReportes);

  isDownloading = signal(false);

  layoutOptions = [
    { icon: "pi pi-list", value: "list" },
    { icon: "pi pi-table", value: "grid" },
  ];

  ngOnInit() {
    this.store.setPage(1, 100);

    this.store.updateFilters({
      tipoProductoId: null,
      nombre: null,
    });
    this.store.loadProducts();
  }

  onPageChange(event: any) {
    const page = event.page + 1;
    this.store.setPage(page, event.rows);
  }

  confirmDelete(id: number, event?: Event) {
    this.confirm.delete({
      message: "¿Estás seguro de eliminar este producto del inventario?",
      accept: () => {
        this.store.deleteProduct(id);
        this.toast.showSuccess(
          "Confirmado",
          "Producto eliminado correctamente",
        );
      },
    });
  }

  editProduct(id: number) {
    this.router.navigate(["admin/inventario/editar", id]);
  }

  descargarReporteKardex() {
    this.isDownloading.set(true);

    const fin = new Date();
    const inicio = new Date();
    inicio.setDate(fin.getDate() - 30);

    this.reportesService.downloadKardex(inicio, fin).subscribe({
      next: () => {
        this.isDownloading.set(false);
        this.toast.showSuccess(
          "Descarga iniciada",
          "El reporte se ha generado correctamente",
        );
      },
      error: () => {
        this.isDownloading.set(false);
        this.toast.showError("Error", "No se pudo generar el reporte");
      },
    });
  }
}
