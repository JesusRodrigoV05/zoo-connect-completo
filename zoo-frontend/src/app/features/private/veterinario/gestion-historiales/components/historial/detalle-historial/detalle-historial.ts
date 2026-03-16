import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DatePipe, DecimalPipe, Location } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { TabsModule } from "primeng/tabs";
import { CardModule } from "primeng/card";
import { AvatarModule } from "primeng/avatar";
import { TagModule } from "primeng/tag";
import { PanelModule } from "primeng/panel";
import { SkeletonModule } from "primeng/skeleton";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { TooltipModule } from "primeng/tooltip";
import { DetalleClinicoStore } from "../../../../stores/historiales/detalle-clinico.store";
import { SeccionReceta } from "../../recetas/seccion-receta/seccion-receta";
import { SeccionProcedimiento } from "../../procedimientos/seccion-procedimiento/seccion-procedimiento";
import { SeccionExamenes } from "../../examenes/seccion-examenes/seccion-examenes";
import { ZooConfirmationService } from "@app/shared/services/zoo-confirmation-service";
import { DividerModule } from "primeng/divider";

@Component({
  selector: "app-detalle-historial",
  imports: [
    DatePipe,
    DecimalPipe,
    ButtonModule,
    TabsModule,
    CardModule,
    AvatarModule,
    DividerModule,
    TagModule,
    PanelModule,
    SkeletonModule,
    ConfirmDialogModule,
    TooltipModule,
    SeccionReceta,
    SeccionProcedimiento,
    SeccionExamenes,
  ],
  providers: [DetalleClinicoStore, ConfirmationService],
  templateUrl: "./detalle-historial.html",
  styleUrl: "./detalle-historial.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DetalleHistorial implements OnInit {
  readonly store = inject(DetalleClinicoStore);

  private route = inject(ActivatedRoute);
  confirmation = inject(ZooConfirmationService);
  locator = inject(Location);

  ngOnInit() {
    const id = this.route.snapshot.params["id"];
    if (id) {
      this.store.cargarHistorialCompleto(+id);
    }
  }

  confirmarCierre() {
    this.confirmation.confirm({
      message:
        "¿Estás seguro de finalizar esta consulta? Una vez cerrada, no podrás agregar más recetas ni procedimientos.",
      accept: () => this.store.cerrarConsulta(),
    });
  }

  volver() {
    this.locator.back();
  }
}
