import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Tarea } from "@app/features/private/admin/models/tareas/tarea.model";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "zoo-radar-task-item",
  imports: [ButtonModule, TooltipModule],
  templateUrl: "./radar-task-item.html",
  styleUrl: "./radar-task-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarTaskItem {
  task = input.required<Tarea>();
  reassign = output<number>();
  view = output<number>();

  getIconClass(): string {
    return this.task().isCompleted
      ? "pi pi-check-circle text-green-500"
      : "pi pi-clock text-orange-500";
  }
}
