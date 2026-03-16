import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { DialogService } from "primeng/dynamicdialog";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { CrearOrdenExamen } from "../crear-orden-examen/crear-orden-examen";
import { SubirResultado } from "../subir-resultado/subir-resultado";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { ExamenItem } from "../examen-item";
import { VisorResultado } from "../visor-resultado/visor-resultado";

@Component({
  selector: "app-seccion-examenes",
  imports: [TableModule, ButtonModule, TagModule, TooltipModule, ExamenItem],
  providers: [DialogService],
  templateUrl: "./seccion-examenes.html",
  styleUrl: "./seccion-examenes.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeccionExamenes {
  readonly store = inject(DetalleClinicoStore);
  private dialogService = inject(DialogService);

  openSolicitud() {
    this.dialogService.open(CrearOrdenExamen, {
      header: "Solicitar Examen de Laboratorio/Imagen",
      width: "500px",
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
    });
  }

  openSubirResultado(ordenId: number) {
    this.dialogService.open(SubirResultado, {
      header: "Cargar Resultado",
      width: "500px",
      data: { ordenId },
      contentStyle: { overflow: "auto" },
      baseZIndex: 10000,
    });
  }

  verResultado(url: string) {
    if (!url) return;

    this.dialogService.open(VisorResultado, {
      header: "Visualización de Resultado",
      width: "70%",
      height: "auto",
      maximizable: true,
      dismissableMask: true,
      contentStyle: { overflow: "auto", padding: "0" },
      data: { url: url },
    });
  }
}
