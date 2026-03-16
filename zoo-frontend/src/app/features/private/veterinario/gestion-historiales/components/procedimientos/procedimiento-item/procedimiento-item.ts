import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  input,
  Input,
  output,
  Output,
} from "@angular/core";
import { DatePipe } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { Procedimiento } from "@app/features/private/veterinario/models/historiales/procedimiento.model";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";

@Component({
  selector: "tr[zoo-item-procedimiento]",
  imports: [DatePipe, ZooItemActionButton, TagModule, TooltipModule],
  templateUrl: "./procedimiento-item.html",
  styleUrl: "./procedimiento-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcedimientoItem {
  item = input.required<Procedimiento>();
  bloqueado = input(false);

  edit = output<Procedimiento>();
  delete = output<number>();

  onEdit() {
    this.edit.emit(this.item());
  }

  onDelete() {
    this.delete.emit(this.item().id);
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
      case "realizado":
        return "success";
      case "pendiente":
        return "warn";
      case "cancelado":
        return "danger";
      default:
        return "info";
    }
  }
}
