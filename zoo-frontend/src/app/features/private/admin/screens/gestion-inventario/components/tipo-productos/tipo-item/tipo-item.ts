import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { TipoProducto } from "@app/features/private/admin/models/productos.model";
import { CardModule } from "primeng/card";

@Component({
  selector: "zoo-tipo-item",
  imports: [ButtonModule, TagModule, TooltipModule, CardModule],
  templateUrl: "./tipo-item.html",
  styleUrl: "./tipo-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TipoItem {
  readonly tipo = input.required<TipoProducto>();

  readonly onEdit = output<number>();
  readonly onDelete = output<number>();

  get initial(): string {
    return this.tipo().nombre.charAt(0).toUpperCase();
  }

  protected editar(): void {
    this.onEdit.emit(this.tipo().id);
  }

  protected toggleStatus(): void {
    this.onDelete.emit(this.tipo().id);
  }
}
