import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { NgClass } from "@angular/common";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TooltipModule } from "primeng/tooltip";
import { TipoTarea } from "@app/features/private/admin/models/tareas/tarea.model";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";

@Component({
  selector: "zoo-tipo-tarea-item",
  imports: [
    NgClass,
    ButtonModule,
    CardModule,
    TooltipModule,
    ZooItemActionButton,
  ],
  templateUrl: "./tipo-tarea-item.html",
  styleUrl: "./tipo-tarea-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipoTareaItem {
  tipo = input.required<TipoTarea>();
  layout = input.required<"list" | "grid">();

  onEdit = output<number>();
  onDelete = output<number>();
}
