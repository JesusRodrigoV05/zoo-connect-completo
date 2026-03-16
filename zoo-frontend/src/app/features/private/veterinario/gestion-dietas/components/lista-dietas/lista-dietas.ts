import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { Loader } from "@app/shared/components";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DataViewModule } from "primeng/dataview";
import { PaginatorModule } from "primeng/paginator";
import { SelectButtonModule } from "primeng/selectbutton";
import { InputTextModule } from "primeng/inputtext";
import { IconFieldModule } from "primeng/iconfield";
import { InputIconModule } from "primeng/inputicon";
import { ConfirmationService } from "primeng/api";
import { DietaItem } from "../dieta-item";
import { AlimentacionStore } from "../../../stores/alimentacion.store";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";

@Component({
  selector: "app-lista-dietas",
  imports: [
    DataViewModule,
    ButtonModule,
    SelectButtonModule,
    PaginatorModule,
    ConfirmDialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    RouterLink,
    FormsModule,
    Loader,
    DietaItem,
  ],
  templateUrl: "./lista-dietas.html",
  styleUrls: ["./lista-dietas.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class ListaDietas {
  readonly store = inject(AlimentacionStore);
  private readonly router = inject(Router);
  private readonly confirmation = inject(ZooConfirmationService);

  protected readonly layout = signal<"list" | "grid">("list");
  protected readonly searchTerm = signal("");

  protected readonly layoutOptions = [
    { icon: "pi pi-list", value: "list" },
    { icon: "pi pi-table", value: "grid" },
  ];

  loading = this.store.loading;
  error = this.store.error;
  currentPage = this.store.page;
  pageSize = this.store.size;

  dietaData = computed(() => {
    const items = this.store.dietas();
    const total = this.store.total();
    const size = this.store.size();

    if (this.store.loading() && items.length === 0) return null;

    return {
      items,
      total,
      page: this.store.page(),
      size,
      pages: size > 0 ? Math.ceil(total / size) : 0,
    };
  });

  ngOnInit() {
    this.store.loadDietas();
  }

  onSearch() {
    this.store.setPage(1, this.store.size());
  }

  clearSearch() {
    this.searchTerm.set("");
    this.onSearch();
  }

  loadDietas(page: number, size: number) {
    this.store.setPage(page, size);
  }

  onPageChange(event: any) {
    const page = event.first / event.rows + 1;
    this.store.setPage(page, event.rows);
  }

  confirmDelete(id: number) {
    this.confirmation.delete({
      message:
        "¿Estás seguro de eliminar esta dieta? Esto afectará a los animales asignados.",
      accept: () => this.store.deleteDieta(id),
    });
  }

  editDieta(id: number) {
    this.router.navigate(["/vet/dietas/editar", id]);
  }

  viewDieta(id: number) {
    this.router.navigate(["/vet/dietas/detalle", id]);
  }
}
