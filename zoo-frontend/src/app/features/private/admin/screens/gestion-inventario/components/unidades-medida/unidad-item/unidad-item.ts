import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { UnidadMedida } from "@app/features/private/admin/models/productos.model";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "zoo-unidad-item",
  imports: [ButtonModule, TagModule, TooltipModule, CardModule],
  templateUrl: "./unidad-item.html",
  styleUrl: "./unidad-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnidadItem {
  readonly unidad = input.required<UnidadMedida>();

  readonly onEdit = output<number>();
  readonly onDelete = output<number>();

  protected editar(): void {
    this.onEdit.emit(this.unidad().id);
  }

  protected toggleStatus(): void {
    this.onDelete.emit(this.unidad().id);
  }
}
