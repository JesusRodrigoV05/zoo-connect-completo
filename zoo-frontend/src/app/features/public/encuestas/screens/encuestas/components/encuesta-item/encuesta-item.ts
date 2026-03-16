import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { Encuesta } from "@app/core/models/encuestas";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TagModule } from "primeng/tag";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "app-encuesta-item",
  imports: [
    CardModule,
    TagModule,
    ButtonModule,
    RouterLink,
    DatePipe,
    TooltipModule,
  ],
  templateUrl: "./encuesta-item.html",
  styleUrl: "./encuesta-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncuestaItem {
  readonly encuesta = input.required<Encuesta>();

  private readonly now = signal(new Date());

  protected readonly status = computed(() => {
    const now = new Date().getTime();
    const start = new Date(this.encuesta().fechaInicio).getTime();
    const end = new Date(this.encuesta().fechaFin).getTime();

    if (now < start)
      return { severity: "info" as const, value: "Próximamente" };
    if (now > end) return { severity: "danger" as const, value: "Finalizada" };
    return { severity: "success" as const, value: "Activa" };
  });

  protected readonly isAvailable = computed(() => {
    const now = new Date().getTime();
    const start = new Date(this.encuesta().fechaInicio).getTime();
    const end = new Date(this.encuesta().fechaFin).getTime();

    return now >= start && now <= end;
  });

  protected readonly buttonConfig = computed(() => {
    const status = this.status().value;

    if (status === "Activa") {
      return {
        label: "Participar Ahora",
        icon: "pi pi-arrow-right",
        disabled: false,
        tooltip: "",
      };
    }

    if (status === "Finalizada") {
      return {
        label: "Finalizada",
        icon: "pi pi-lock",
        disabled: true,
        tooltip: "Esta encuesta ya ha finalizado",
      };
    }

    return {
      label: "Próximamente",
      icon: "pi pi-calendar-plus",
      disabled: true,
      tooltip: `Disponible a partir del ${new DatePipe("en-US").transform(this.encuesta().fechaInicio, "d MMM, y")}`,
    };
  });
}
