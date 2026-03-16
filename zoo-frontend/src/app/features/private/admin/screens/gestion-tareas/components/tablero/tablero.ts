import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { TaskInbox } from "../task-inbox/task-inbox";
import { TaskRadar } from "../task-radar/task-radar";
import { AsignarTarea } from "../asignar-tarea/asignar-tarea";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { DialogModule } from "primeng/dialog";
import { SplitterModule } from "primeng/splitter";
import { TareasPendientesStore } from "@app/features/private/admin/stores/tareas/admin-operaciones.store";
import { CrearTarea } from "../crear-tarea/crear-tarea";

@Component({
  selector: "zoo-tablero",
  imports: [
    TaskInbox,
    TaskRadar,
    AsignarTarea,
    ButtonModule,
    TooltipModule,
    DialogModule,
    SplitterModule,
    CrearTarea,
  ],
  templateUrl: "./tablero.html",
  styleUrl: "./tablero.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Tablero {
  readonly store = inject(TareasPendientesStore);

  isAssignModalOpen = signal(false);
  selectedTaskId = signal<number | null>(null);
  isCreateModalOpen = signal(false);

  ngOnInit() {
    this.store.loadDashboard();
  }

  onRequestAssign(taskId: number) {
    this.selectedTaskId.set(taskId);
    this.isAssignModalOpen.set(true);
  }

  confirmAssignment(userId: number) {
    if (this.selectedTaskId()) {
      this.store.assignTask({
        tareaId: this.selectedTaskId()!,
        usuarioId: userId,
      });
      this.isAssignModalOpen.set(false);
      this.selectedTaskId.set(null);
    }
  }
}
