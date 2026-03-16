import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { Tarea } from "@app/features/private/admin/models/tareas/tarea.model";
import { RadarTaskItem } from "../tablero-tareas/radar-task-item";
import { UpperCasePipe } from "@angular/common";

@Component({
  selector: "zoo-task-radar",
  imports: [RadarTaskItem, UpperCasePipe],
  templateUrl: "./task-radar.html",
  styleUrl: "./task-radar.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskRadar {
  tasksMap = input.required<Map<string, Tarea[]>>();

  onReassign = output<number>();
  onView = output<number>();
}
