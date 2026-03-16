import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TableModule } from "primeng/table";
import { TooltipModule } from "primeng/tooltip";
import { RecurrentesStore } from "@app/features/private/admin/stores/tareas/admin-recurrentes.store";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { TagModule } from "primeng/tag";
import { ConfirmationService, MessageService } from "primeng/api";
import { RutinaItem } from "../rutina-item";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { Router, RouterLink } from "@angular/router";

@Component({
  selector: "app-planificador",
  imports: [
    ButtonModule,
    TableModule,
    TagModule,
    TooltipModule,
    ConfirmDialogModule,
    RutinaItem,
    RouterLink,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: "./planificador.html",
  styleUrl: "./planificador.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Planificador {
  readonly store = inject(RecurrentesStore);
  private readonly confirm = inject(ZooConfirmationService);
  private readonly router = inject(Router);

  ngOnInit() {
    this.store.loadItems();
  }

  onPageChange(event: any) {
    const page = (event.first ?? 0) / (event.rows ?? 10) + 1;
    const size = event.rows ?? 10;
    this.store.setPage(page, size);
  }

  navigateToEdit(id: number) {
    this.router.navigate(["/admin/tareas/planificador/editar", id]);
  }

  deleteItem(id: number) {
    this.confirm.delete({
      message:
        "¿Estás seguro de eliminar esta rutina permanente? Dejará de generarse en el futuro.",
      accept: () => this.store.deleteItem(id),
    });
  }
}
