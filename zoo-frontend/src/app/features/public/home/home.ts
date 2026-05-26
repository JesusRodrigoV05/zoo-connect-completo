import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
} from "@angular/core";
import { SocialSection } from "./components/social-section";
import { ContactSection } from "./components/contact-section";
import { NoticiasSection } from "./components/noticias-section";
import { HeroSection } from "./components/hero-section";
import { ServicesSection } from "./components/services-section";
import { Carousel } from "./components/carousel";
import { WeatherSection } from "./components/weather-section";
import { OnboardingService } from "@app/shared/services/onboarding.service";

@Component({
  selector: "app-home",
  imports: [
    SocialSection,
    ContactSection,
    NoticiasSection,
    HeroSection,
    ServicesSection,
    Carousel,
    WeatherSection,
  ],
  templateUrl: "./home.html",
  styleUrl: "./home.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Home {
  private readonly onboarding = inject(OnboardingService);

  constructor() {
    afterNextRender(() => {
      this.onboarding.startTourIfFirstVisit("public-inicio");
    });
  }

  protected onSubmitContact(): void {
    console.log("Formulario de contacto enviado");
  }
}
