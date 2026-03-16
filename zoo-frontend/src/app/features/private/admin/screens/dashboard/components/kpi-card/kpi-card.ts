import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { NgClass } from "@angular/common";
import { ZooIcon } from "@app/shared/components/ui/zoo-icon";

export interface KpiModel {
  title: string;
  value: number | string;
  iconName: string;
  iconColor: string;
  bgClass: string;
  diff?: string;
}

@Component({
  selector: "app-kpi-card",
  imports: [NgClass, ZooIcon],
  templateUrl: "./kpi-card.html",
  styleUrl: "./kpi-card.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  item = input.required<KpiModel>();
}
