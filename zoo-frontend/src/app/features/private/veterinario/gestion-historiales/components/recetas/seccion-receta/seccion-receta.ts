import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { ConfirmationService } from "primeng/api";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { CrearReceta } from "../crear-receta/crear-receta";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { RecetaItem } from "../receta-item";

@Component({
  selector: "app-seccion-receta",
  imports: [TableModule, ButtonModule, RecetaItem],
  providers: [DialogService, ConfirmationService],
  templateUrl: "./seccion-receta.html",
  styleUrl: "./seccion-receta.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionReceta {
  readonly store = inject(DetalleClinicoStore);
  private dialogService = inject(DialogService);
  private confirmation = inject(ZooConfirmationService);

  openCrear() {
    this.dialogService.open(CrearReceta, {
      header: "Nueva Receta Médica",
      width: "500px",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
    });
  }

  deleteReceta(id: number) {
    this.confirmation.delete({
      message:
        "¿Eliminar esta receta? Si tiene tareas automáticas asociadas, estas se cancelarán.",
      accept: () => this.store.eliminarReceta(id),
    });
  }
}
