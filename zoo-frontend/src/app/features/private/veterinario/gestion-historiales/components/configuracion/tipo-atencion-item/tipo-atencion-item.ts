import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { TipoAtencion } from "@app/features/private/veterinario/models/historiales/veterinario-config.model";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "tr[zoo-tipo-atencion-item]",
  imports: [ZooItemActionButton, TooltipModule],
  templateUrl: "./tipo-atencion-item.html",
  styleUrl: "./tipo-atencion-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipoAtencionItem {
  item = input.required<TipoAtencion>();

  onEdit = output<TipoAtencion>();
  onDelete = output<number>();
}
