import { NgClass } from "@angular/common";
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
  selector: "zoo-task-inbox",
  imports: [ButtonModule, TooltipModule, NgClass],
  templateUrl: "./task-inbox.html",
  styleUrl: "./task-inbox.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskInbox {
  tasks = input.required<Tarea[]>();
  onAssign = output<number>();
  onCancel = output<number>();

  getPriorityClass(task: any): string {
    const text = task.titulo?.toLowerCase() || "";
    if (text.includes("urgente") || text.includes("emergencia"))
      return "priority-high";
    if (text.includes("limpieza") || text.includes("aseo"))
      return "priority-normal";
    return "priority-medium";
  }

  getTaskIcon(tipo?: string): string {
    if (!tipo) return "pi pi-calendar";

    const t = tipo.toLowerCase();
    if (t.includes("aseo") || t.includes("limpieza")) return "pi pi-trash";
    if (t.includes("alimentacion")) return "pi pi-apple";
    if (t.includes("salud") || t.includes("medico")) return "pi pi-heart";
    return "pi pi-bolt";
  }
}
