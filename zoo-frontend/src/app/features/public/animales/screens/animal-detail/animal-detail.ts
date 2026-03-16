import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { Location } from "@angular/common";
import { MainContainer } from "@app/shared/components/main-container";
import { FavoriteStore } from "../../stores";
import { Animal } from "@models/animales";
import { GetAnimales } from "../../services";
import { ActivatedRoute } from "@angular/router";
import { Loader } from "@app/shared/components";

@Component({
  selector: "app-animal-detail",
  imports: [Loader],
  templateUrl: "./animal-detail.html",
  styleUrl: "./animal-detail.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class AnimalDetail implements OnInit {
  readonly store = inject(FavoriteStore);
  readonly animalService = inject(GetAnimales);
  readonly route = inject(ActivatedRoute);
  readonly location = inject(Location);

  animal = signal<Animal | null>(null);

  isFavorite = computed(() => {
    const currentAnimal = this.animal();
    if (!currentAnimal) return false;

    return !!this.store.entityMap()[currentAnimal.id_animal];
  });

  ngOnInit() {
    if (this.store.ids().length === 0) {
      this.store.loadFavorites();
    }

    const id = this.route.snapshot.paramMap.get("id");
    if (id) {
      this.animalService.getAnimalById(Number(id)).subscribe((data) => {
        this.animal.set(data);
      });
    }
  }

  toggleFav() {
    console.log("Aqui presionando el boton");
    const currentAnimal = this.animal();
    if (currentAnimal) {
      this.store.toggleFavorite(currentAnimal);
    }
  }

  goBack() {
    this.location.back();
  }
}
