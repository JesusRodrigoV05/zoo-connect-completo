import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { CardData } from "@shared/components/apple-carousel/card-data.model";
import { AppleCarousel } from "@shared/components/apple-carousel";
import { Card } from "@shared/components/apple-carousel/card/card";

@Component({
  selector: "app-carousel",
  imports: [AppleCarousel, Card],
  templateUrl: "./carousel.html",
  styleUrl: "./carousel.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Carousel {
  readonly cards = signal<CardData[]>([
    {
      category: "Aviario",
      title: "El pico que pinta la selva.",
      src: "/assets/images/hero-carousel/1.jpg",
      //content: DummyContent,
    },
    {
      category: "Conservación",
      title: "Vuelo libre en nuestros cielos.",
      src: "/assets/images/hero-carousel/2.jpg",
      //content: DummyContent,
    },
    {
      category: "Educación Infantil",
      title: "Conoce a nuestros amigos más tiernos.",
      src: "/assets/images/hero-carousel/3.jpeg",
      //content: DummyContent,
    },
    {
      category: "Fauna Silvestre",
      title: "Maestros de la velocidad y el camuflaje.",
      src: "/assets/images/hero-carousel/4.jpg",
      //content: DummyContent,
    },
    {
      category: "Vida Nocturna",
      title: "Curiosidad e inteligencia en la sombra.",
      src: "/assets/images/hero-carousel/5.jpg",
      //content: DummyContent,
    },
    {
      category: "Biodiversidad",
      title: "Cada pequeña vida importa en ARCA.",
      src: "/assets/images/hero-carousel/6.jpg",
      //content: DummyContent,
    },
  ]);
}
