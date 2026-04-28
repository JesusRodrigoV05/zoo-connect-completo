import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import AOS from "aos";
import { ButtonModule } from "primeng/button";
import { OnboardingService } from "@app/shared/services/onboarding.service";

@Component({
  selector: "app-mision-vision",
  imports: [ButtonModule],
  templateUrl: "./mision-vision.html",
  styleUrl: "./mision-vision.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisionVision {
  private readonly onboarding = inject(OnboardingService);

  constructor() {
    afterRenderEffect(() => {
      AOS.refresh();
    });
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour("public-acerca-de");
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
