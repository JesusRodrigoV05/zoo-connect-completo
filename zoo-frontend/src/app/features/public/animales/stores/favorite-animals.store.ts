import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  withEntities,
  setAllEntities,
  addEntity,
  removeEntity,
} from "@ngrx/signals/entities";
import { inject, computed } from "@angular/core";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { Animal } from "@models/animales";
import { FavoriteAnimals } from "../services/favorite-animals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";

type FavoritesState = {
  isLoading: boolean;
  error: string | null;
};

const initialState: FavoritesState = {
  isLoading: false,
  error: null,
};

export const FavoriteStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withEntities<Animal>(),
  withComputed((store) => ({
    hasFavorites: computed(() => store.entities().length > 0),
  })),
  withMethods((store, service = inject(FavoriteAnimals)) => ({
    isAnimalFavorite(id: number): boolean {
      const map = store.entityMap();
      return !!map[id];
    },

    loadFavorites: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          service.getFavoriteAnimals().pipe(
            tapResponse({
              next: (animals) => {
                console.info("Mis favoritos", animals);
                patchState(
                  store,
                  setAllEntities(animals, { selectId: (a) => a.id_animal }),
                  { isLoading: false },
                );
              },
              error: (err) =>
                patchState(store, { error: String(err), isLoading: false }),
            }),
          ),
        ),
      ),
    ),

    toggleFavorite: rxMethod<Animal>(
      pipe(
        switchMap((animal) => {
          const map = store.entityMap();
          const exists = !!map[animal.id_animal];

          if (exists) {
            patchState(store, removeEntity(animal.id_animal));
            return service.removeFavoriteAnimal(animal.id_animal).pipe(
              tapResponse({
                next: () => console.log("Eliminado de favoritos"),
                error: () =>
                  patchState(
                    store,
                    addEntity(animal, { selectId: (a) => a.id_animal }),
                  ),
              }),
            );
          } else {
            patchState(
              store,
              addEntity(animal, { selectId: (a) => a.id_animal }),
            );
            return service.addFavoriteAnimal(animal.id_animal).pipe(
              tapResponse({
                next: () => console.log("Agregado a favoritos"),
                error: () => patchState(store, removeEntity(animal.id_animal)),
              }),
            );
          }
        }),
      ),
    ),
  })),
  withHooks({
    onInit: (store) => {
      store.loadFavorites();
    },
  }),
);
