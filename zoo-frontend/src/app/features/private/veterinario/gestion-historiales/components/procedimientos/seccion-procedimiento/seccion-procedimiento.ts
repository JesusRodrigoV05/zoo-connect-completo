import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { CrearProcedimiento } from "../crear-procedimiento/crear-procedimiento";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { Procedimiento } from "@app/features/private/veterinario/models/historiales/procedimiento.model";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { ConfirmationService } from "primeng/api";
import { ProcedimientoItem } from "../procedimiento-item";

@Component({
  selector: "app-seccion-procedimiento",
  imports: [TableModule, ButtonModule, ProcedimientoItem],
  providers: [DialogService, ConfirmationService],
  templateUrl: "./seccion-procedimiento.html",
  styleUrl: "./seccion-procedimiento.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionProcedimiento {
  readonly store = inject(DetalleClinicoStore);
  private dialogService = inject(DialogService);
  private confirmation = inject(ZooConfirmationService);

  openCrear() {
    this.dialogService.open(CrearProcedimiento, {
      header: "Programar Procedimiento",
      width: "450px",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
    });
  }

  openEditar(item: Procedimiento) {
    this.dialogService.open(CrearProcedimiento, {
      header: "Editar Procedimiento",
      width: "450px",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
      data: {
        item: item,
        isEdit: true,
      },
    });
  }

  onDelete(id: number) {
    this.confirmation.delete({
      message: "¿Estás seguro de que deseas eliminar este procedimiento?",
      accept: () => this.store.eliminarProcedimiento(id),
    });
  }
}
