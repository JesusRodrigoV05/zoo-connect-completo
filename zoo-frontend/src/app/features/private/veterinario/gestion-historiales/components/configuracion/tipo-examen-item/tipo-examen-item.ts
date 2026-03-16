import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { TipoExamen } from "@app/features/private/veterinario/models/historiales/veterinario-config.model";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "tr[zoo-tipo-examen-item]",
  imports: [TooltipModule, ZooItemActionButton],
  templateUrl: "./tipo-examen-item.html",
  styleUrl: "./tipo-examen-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipoExamenItem {
  item = input.required<TipoExamen>();
  onEdit = output<TipoExamen>();
  onDelete = output<number>();
}
