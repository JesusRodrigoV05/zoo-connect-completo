import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { OrdenExamen } from "@app/features/private/veterinario/models/historiales/examenes.model";

@Component({
  selector: "tr[zoo-item-examen]",
  imports: [DatePipe, ButtonModule, TagModule],
  templateUrl: "./examen-item.html",
  styleUrl: "./examen-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExamenItem {
  item = input.required<OrdenExamen>();
  bloqueado = input(false);

  openUpload = output<number>();
  viewResult = output<string>();

  onUpload() {
    this.openUpload.emit(this.item().id);
  }

  onView() {
    const resultados = this.item().resultados;
    if (resultados && resultados.length > 0) {
      this.viewResult.emit(resultados[0].archivoUrl);
    }
  }

  getStatusSeverity(
    estado: string,
  ):
    | "success"
    | "secondary"
    | "info"
    | "warn"
    | "danger"
    | "contrast"
    | undefined {
    switch (estado?.toLowerCase()) {
      case "completado":
        return "success";
      case "solicitado":
      case "pendiente":
        return "warn";
      case "cancelado":
        return "danger";
      default:
        return "info";
    }
  }
}
