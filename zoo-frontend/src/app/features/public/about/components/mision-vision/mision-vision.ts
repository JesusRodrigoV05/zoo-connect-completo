import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  signal,
} from "@angular/core";
import AOS from "aos";

@Component({
  selector: "app-mision-vision",
  imports: [],
  templateUrl: "./mision-vision.html",
  styleUrl: "./mision-vision.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisionVision {
  constructor() {
    afterRenderEffect(() => {
      AOS.refresh();
    });
  }

  protected readonly features = [
    {
      icon: "pi pi-shield",
      title: "Bienestar Absoluto",
      text: "Prioridad sobre la exhibición",
    },
    {
      icon: "pi pi-wifi",
      title: "Transparencia Digital",
      text: "Datos reales vía ZooConnect",
    },
    {
      icon: "pi pi-book",
      title: "Educación Viva",
      text: "Historias que inspiran cambio",
    },
    {
      icon: "pi pi-bolt",
      title: "Innovación Constante",
      text: "Tecnología para la conservación",
    },
  ];
}
