import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Receta } from "@app/features/private/veterinario/models/historiales/receta.model";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "tr[zoo-item-receta]",
  imports: [ButtonModule, TagModule, TooltipModule],
  templateUrl: "./receta-item.html",
  styleUrl: "./receta-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecetaItem {
  item = input.required<Receta>();
  bloqueado = input(false);

  delete = output<number>();

  onDelete() {
    this.delete.emit(this.item().id);
  }
}
