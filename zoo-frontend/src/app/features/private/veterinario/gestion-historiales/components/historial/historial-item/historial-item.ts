import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from "@angular/core";
import { Historial } from "../../../../models/historiales/historial.model";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";
import { AvatarModule } from "primeng/avatar";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";

@Component({
  selector: "tr[zoo-historial-item]",
  imports: [
    DatePipe,
    ButtonModule,
    TagModule,
    TooltipModule,
    AvatarModule,
    ZooItemActionButton,
  ],
  templateUrl: "./historial-item.html",
  styleUrl: "./historial-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistorialItem {
  item = input.required<Historial>();

  onView = output<number>();
  onDownload = output<number>();
}
