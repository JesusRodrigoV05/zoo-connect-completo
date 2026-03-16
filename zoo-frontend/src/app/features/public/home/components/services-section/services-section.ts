import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
} from "@angular/core";
import { ButtonModule } from "primeng/button";
import AOS from "aos";
import { RouterLink } from "@angular/router";

interface ServiceFeature {
  text: string;
}

interface ServiceCard {
  icon: string;
  title: string;
  description: string;
  isPrimary: boolean;
  features: ServiceFeature[];
}

@Component({
  selector: "app-services-section",
  imports: [ButtonModule, RouterLink],
  templateUrl: "./services-section.html",
  styleUrl: "./services-section.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesSection {
  constructor() {
    afterNextRender(() => {
      AOS.refresh();
    });
  }

  readonly serviceCards: ServiceCard[] = [
    {
      icon: "bx bxs-book-reader",
      title: "Educación Viva",
      description: "Aprende sintiendo la naturaleza de cerca",
      isPrimary: true,
      features: [
        { text: "Talleres sensoriales" },
        { text: "Charlas con cuidadores" },
        { text: "Aulas abiertas" },
      ],
    },
    {
      icon: "bx bxs-landscape",
      title: "Hábitats",
      description: "Inmersión total en ecosistemas recreados",
      isPrimary: false,
      features: [
        { text: "Selva tropical húmeda" },
        { text: "Aviario de vuelo libre" },
        { text: "Sabana africana" },
      ],
    },
    {
      icon: "bx bxs-leaf",
      title: "Conservación",
      description: "Nuestra misión principal en acción",
      isPrimary: false,
      features: [
        { text: "Rescate de fauna" },
        { text: "Medicina veterinaria" },
        { text: "Reintroducción" },
      ],
    },
  ];
}
