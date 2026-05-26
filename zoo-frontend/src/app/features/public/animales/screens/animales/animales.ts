import {
  afterNextRender,
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
import { ButtonModule } from "primeng/button";
import { OnboardingService } from "@app/shared/services/onboarding.service";

@Component({
  selector: "app-animales",
  imports: [InfiniteScroll, MainContainer, AnimalItem, ButtonModule],
  templateUrl: "./animales.html",
  styleUrl: "./animales.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  //providers: [provideCloudinaryLoader("https://res.cloudinary.com/djne2ckoy/")],
})
export default class Animales {
  private animalService = inject(GetAnimales);
  private readonly onboarding = inject(OnboardingService);

  protected animals = signal<Animal[]>([]);
  protected isLoading = signal(false);
  protected hasMoreData = signal(true);

  private currentPage = 1;
  private readonly pageSize = 12;

  constructor() {
    this.loadAnimals();
    afterNextRender(() => {
      this.onboarding.startTourIfFirstVisit("public-animales");
    });
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour("public-animales");
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
