import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DataViewModule } from "primeng/dataview";
import { SelectButtonModule } from "primeng/selectbutton";
import { PaginatorModule } from "primeng/paginator";
import { ConfirmationService } from "primeng/api";
import { Loader } from "@app/shared/components";
import { UnidadItem } from "../unidad-item/unidad-item";
import { UnidadesMedidaStore } from "@app/features/private/admin/stores/admin-unidades-medida.store";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

@Component({
  selector: "app-lista-unidad",
  imports: [
    DataViewModule,
    ButtonModule,
    SelectButtonModule,
    PaginatorModule,
    ConfirmDialogModule,
    RouterLink,
    FormsModule,
    Loader,
    UnidadItem,
  ],
  templateUrl: "./lista-unidad.html",
  styleUrl: "../../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class ListaUnidad implements OnInit {
  readonly store = inject(UnidadesMedidaStore);
  confirmation = inject(ZooConfirmationService);
  private router = inject(Router);

  layout: "list" | "grid" = "list";

  layoutOptions = [
    { icon: "pi pi-list", value: "list" },
    { icon: "pi pi-table", value: "grid" },
  ];

  ngOnInit() {
    this.store.loadItems();
  }

  onPageChange(event: any) {
    const page = event.first / event.rows + 1;
    this.store.setPage(page, event.rows);
  }

  confirmDelete(id: number) {
    this.confirmation.delete({
      message: "¿Estás seguro de eliminar esta unidad de medida?",
      accept: () => this.store.deleteItem(id),
    });
  }

  editUnidad(id: number) {
    this.router.navigate(["admin/inventario/unidades/editar", id]);
  }
}
