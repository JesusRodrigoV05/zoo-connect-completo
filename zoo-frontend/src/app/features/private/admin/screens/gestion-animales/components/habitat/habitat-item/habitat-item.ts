import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { Habitat } from "@models/habitat";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "zoo-habitat-item",
  imports: [CardModule, ButtonModule, TagModule, RouterLink, TooltipModule],
  templateUrl: "./habitat-item.html",
  styleUrl: "./habitat-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitatItem {
  readonly habitat = input.required<Habitat>();

  readonly onDelete = output<number>();

  protected deleteHabitat(): void {
    this.onDelete.emit(this.habitat().id);
  }
}
