import { Producto } from "@app/features/private/admin/models/productos.model";
import { DecimalPipe, NgClass, NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";

@Component({
  selector: "zoo-producto-item",
  imports: [
    NgClass,
    ButtonModule,
    TagModule,
    TooltipModule,
    NgOptimizedImage,
    DecimalPipe,
    ZooItemActionButton,
  ],
  templateUrl: "./producto-item.html",
  styleUrl: "./producto-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoItem {
  product = input.required<Producto>();
  layout = input.required<"list" | "grid">();

  onEdit = output<number>();
  onDelete = output<number>();

  stockState = computed(() => {
    const current = this.product().stockActual;
    const min = this.product().stockMinimo;

    if (current <= min) {
      return "critical";
    }

    if (current <= min * 1.2) {
      return "warning";
    }

    return "good";
  });
}
