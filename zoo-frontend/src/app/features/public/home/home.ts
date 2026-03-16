import { ChangeDetectionStrategy, Component, PLATFORM_ID } from "@angular/core";
import { SocialSection } from "./components/social-section";
import { ContactSection } from "./components/contact-section";
import { NoticiasSection } from "./components/noticias-section";
import { HeroSection } from "./components/hero-section";
import { ServicesSection } from "./components/services-section";
import { Carousel } from "./components/carousel";
import { WeatherSection } from "./components/weather-section";

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
  protected onSubmitContact(): void {
    console.log("Formulario de contacto enviado");
  }
}
