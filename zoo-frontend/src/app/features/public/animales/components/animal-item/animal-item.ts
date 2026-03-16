import { NgOptimizedImage } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from "@angular/core";
import { Router } from "@angular/router";
import { Animal } from "@models/animales";

@Component({
  selector: "app-animal-item",
  imports: [NgOptimizedImage],
  templateUrl: "./animal-item.html",
  styleUrl: "./animal-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnimalItem {
  router = inject(Router);

  animal = input.required<Animal>();

  protected animalImage = computed(() => {
    const media = this.animal().media;
    return media && media.length > 0
      ? media[0].url
      : "assets/placeholder-zoo.jpg";
  });

  navigateToAnimalDetails() {
    this.router.navigate(["/animales", this.animal().id_animal]);
  }
}
