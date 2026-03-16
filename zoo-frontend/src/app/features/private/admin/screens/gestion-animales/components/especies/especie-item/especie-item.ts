import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
  output,
} from "@angular/core";
import { Especie } from "@models/animales";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { DividerModule } from "primeng/divider";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "zoo-especie-item",
  imports: [CardModule, ButtonModule, TagModule, DividerModule, TooltipModule],
  templateUrl: "./especie-item.html",
  styleUrl: "./especie-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EspecieItem {
  readonly especie = input.required<Especie>();

  readonly verDetalles = output<number>();
  readonly editar = output<number>();
  readonly eliminar = output<number>();

  readonly taxonomiaResumen = computed(() => {
    const esp = this.especie();
    return `${esp.clase} • ${esp.orden} • ${esp.familia}`;
  });
}
