import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { Loader } from "@app/shared/components";
import { DataView, DataViewPageEvent } from "primeng/dataview";
import { ButtonModule } from "primeng/button";
import { RouterLink } from "@angular/router";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { DrawerModule } from "primeng/drawer";
import { TooltipModule } from "primeng/tooltip";
import { SelectButton } from "primeng/selectbutton";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NoticiaDetalle } from "../noticia-detalle/noticia-detalle";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { NoticiasStore } from "@app/features/private/admin/stores/noticias";
import { NoticiaItem } from "../noticia-item/noticia-item";

@Component({
  selector: "app-lista-noticias",
  imports: [
    Loader,
    DataView,
    ButtonModule,
    RouterLink,
    NoticiaItem,
    ConfirmDialogModule,
    DrawerModule,
    TooltipModule,
    NoticiaDetalle,
    SelectButton,
    NgClass,
    FormsModule,
  ],
  providers: [NoticiasStore],
  templateUrl: "./lista-noticias.html",
  styleUrl: "../../../lista-styles.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListaNoticias {
  readonly store = inject(NoticiasStore);
  private readonly confirmation = inject(ZooConfirmationService);

  protected readonly layout = signal<"list" | "grid">("list");
  protected readonly options = ["list", "grid"];

  protected readonly detalleVisible = signal(false);

  constructor() {
    this.store.loadNoticias({ page: 1, size: 10 });
  }

  protected onPageChange(event: DataViewPageEvent): void {
    const nextPage = event.first / event.rows + 1;
    const nextSize = event.rows;

    this.store.setPage(nextPage, nextSize);
  }

  protected viewDetails(id: string): void {
    this.store.selectNoticia(id);
    this.detalleVisible.set(true);
  }

  protected deleteNoticia(id: string): void {
    this.confirmation.delete({
      message: "¿Estás seguro de eliminar esta noticia? No se podrá recuperar.",
      accept: () => this.store.deleteNoticia(id),
    });
  }
}
