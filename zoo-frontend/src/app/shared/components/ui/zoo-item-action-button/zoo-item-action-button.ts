import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

export type ActionType =
  | "edit"
  | "delete"
  | "restore"
  | "view"
  | "add"
  | "download";

interface ActionConfig {
  icon: string;
  severity:
    | "secondary"
    | "danger"
    | "success"
    | "info"
    | "help"
    | "primary"
    | "warn";
  tooltip: string;
}

const ACTION_CONFIG: Record<ActionType, ActionConfig> = {
  edit: {
    icon: "pi pi-pencil",
    severity: "info",
    tooltip: "Editar",
  },
  delete: {
    icon: "pi pi-trash",
    severity: "danger",
    tooltip: "Eliminar",
  },
  restore: {
    icon: "pi pi-undo",
    severity: "success",
    tooltip: "Restaurar/Reactivar",
  },
  view: {
    icon: "pi pi-eye",
    severity: "info",
    tooltip: "Ver detalles",
  },
  add: {
    icon: "pi pi-plus",
    severity: "primary",
    tooltip: "Agregar",
  },
  download: {
    icon: "pi pi-download",
    severity: "secondary",
    tooltip: "Descargar",
  },
};

@Component({
  selector: "zoo-item-action-button",
  imports: [ButtonModule, TooltipModule],
  templateUrl: "./zoo-item-action-button.html",
  styleUrl: "./zoo-item-action-button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZooItemActionButton {
  type = input.required<ActionType>({ alias: "tipo" });

  tooltip = input<string>();
  disabled = input<boolean>(false);
  loading = input<boolean>(false);

  onAction = output<void>();

  protected config = computed(() => ACTION_CONFIG[this.type()]);

  protected finalTooltip = computed(
    () => this.tooltip() || this.config().tooltip,
  );
}
