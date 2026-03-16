import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from "@angular/core";
import { ZooIcon } from "@app/shared/components/ui/zoo-icon";
import { ZooItemActionButton } from "@app/shared/components/ui/zoo-item-action-button";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "tr[zoo-rutina-item]",
  imports: [TagModule, ZooItemActionButton, TooltipModule, ZooIcon],
  templateUrl: "./rutina-item.html",
  styleUrl: "./rutina-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutinaItem {
  item = input.required<any>();

  onEdit = output<number>();
  onDelete = output<number>();

  ngOnInit() {
    console.log(this.item());
  }

  protected cronLabel = computed(() => {
    const cron = this.item().frecuenciaCron;
    if (!cron) return "Sin programar";

    try {
      const parts = cron.split(" ");
      if (parts.length < 5) return cron;

      const [min, hour, dayOfMonth, month, dayOfWeek] = parts;

      const time = `${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;

      if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
        return `Todos los días a las ${time}`;
      }

      if (dayOfMonth === "*" && month === "*" && dayOfWeek !== "*") {
        const daysMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
        const days = dayOfWeek
          .split(",")
          .map((d: string) => daysMap[parseInt(d)])
          .join(", ");
        return `Semanal (${days}) - ${time}`;
      }

      if (dayOfMonth !== "*" && month === "*" && dayOfWeek === "*") {
        return `Mensual (Día ${dayOfMonth}) - ${time}`;
      }

      return "Personalizado";
    } catch (e) {
      return cron;
    }
  });
}
