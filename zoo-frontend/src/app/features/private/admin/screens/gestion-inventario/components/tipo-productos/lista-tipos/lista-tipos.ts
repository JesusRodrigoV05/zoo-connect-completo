import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TipoItem } from "../tipo-item";
import { Loader } from "@app/shared/components";
import { FormsModule } from "@angular/forms";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { PaginatorModule } from "primeng/paginator";
import { SelectButtonModule } from "primeng/selectbutton";
import { DataViewModule } from "primeng/dataview";
import { Router, RouterLink } from "@angular/router";
import { ConfirmationService } from "primeng/api";
import { TiposProductoStore } from "@app/features/private/admin/stores/admin-tipo-productos.store";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

@Component({
  selector: "app-lista-tipos",
  imports: [
    DataViewModule,
    ButtonModule,
    SelectButtonModule,
    PaginatorModule,
    ConfirmDialogModule,
    RouterLink,
    FormsModule,
    Loader,
    TipoItem,
  ],
  templateUrl: "./lista-tipos.html",
  styleUrl: "../../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class ListaTipos implements OnInit {
  readonly store = inject(TiposProductoStore);
  readonly router = inject(Router);
  confirmation = inject(ZooConfirmationService);

  layoutOptions = [
    { icon: "pi pi-list", value: "list" },
    { icon: "pi pi-table", value: "grid" },
  ];

  layout: "list" | "grid" = "list";

  ngOnInit() {
    this.store.loadItems();
  }

  onPageChange(event: any) {
    const page = event.first / event.rows + 1;
    this.store.setPage(page, event.rows);
  }

  confirmDelete(id: number) {
    this.confirmation.delete({
      message: "¿Estás seguro de eliminar este tipo de producto?",
      accept: () => this.store.deleteItem(id),
    });
  }

  editTipo(id: number) {
    this.router.navigate(["admin/inventario/tipo/editar", id]);
  }
}
