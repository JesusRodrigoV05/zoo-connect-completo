import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Proveedor } from "@app/features/private/admin/models/productos.model";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "zoo-proveedor-item",
  imports: [ButtonModule, TagModule, TooltipModule, CardModule],
  templateUrl: "./proveedor-item.html",
  styleUrl: "./proveedor-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProveedorItem {
  readonly proveedor = input.required<Proveedor>();
  readonly layout = input<"list" | "grid">("list");

  readonly onEdit = output<number>();
  readonly onDelete = output<number>();

  protected editar(): void {
    this.onEdit.emit(this.proveedor().id);
  }

  protected toggleStatus(): void {
    this.onDelete.emit(this.proveedor().id);
  }
}
