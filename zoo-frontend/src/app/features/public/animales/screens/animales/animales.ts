import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from "@angular/core";
import { InfiniteScroll } from "@directive/infinite-scroll";
import { Animal } from "@models/animales";
import { GetAnimales } from "../../services";
import { Loader } from "@app/shared/components";
import { MainContainer } from "@app/shared/components/main-container";
import { AnimalItem } from "../../components/animal-item";
import { provideCloudinaryLoader } from "@angular/common";

@Component({
  selector: "app-animales",
  imports: [InfiniteScroll, MainContainer, AnimalItem],
  templateUrl: "./animales.html",
  styleUrl: "./animales.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  //providers: [provideCloudinaryLoader("https://res.cloudinary.com/djne2ckoy/")],
})
export default class Animales {
  private animalService = inject(GetAnimales);

  protected animals = signal<Animal[]>([]);
  protected isLoading = signal(false);
  protected hasMoreData = signal(true);

  private currentPage = 1;
  private readonly pageSize = 12;

  constructor() {
    this.loadAnimals();
  }

  onScrollDown() {
    if (this.isLoading() || !this.hasMoreData()) return;

    this.currentPage++;
    this.loadAnimals();
  }

  private loadAnimals() {
    this.isLoading.set(true);

    this.animalService
      .getAllAnimals(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.animals.update((current) => [...current, ...response.items]);

          if (response.items.length < this.pageSize) {
            this.hasMoreData.set(false);
          }

          this.isLoading.set(false);
          console.log(this.animals());
        },
        error: (err) => {
          console.error("Error cargando animales:", err);
          this.isLoading.set(false);
        },
      });
  }
}
