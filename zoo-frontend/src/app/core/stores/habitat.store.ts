import { computed } from "@angular/core";
import { inject } from "@angular/core/primitives/di";
import { AdminHabitat } from "@app/features/private/admin/services/admin-habitat";
import { Habitat } from "@models/habitat";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { finalize, pipe, switchMap, tap } from "rxjs";

type HabitatState = {
  habitats: Habitat[];
  isLoading: boolean;
  error: string | null;
};

const initialState: HabitatState = {
  habitats: [],
  isLoading: false,
  error: null,
};

export const HabitatStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store, adminHabitat = inject(AdminHabitat)) => ({
    loadHabitats: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          adminHabitat.getAllHabitats(1, 100).pipe(
            tap({
              next: (response) => {
                patchState(store, { habitats: response.items });
              },
              error: (e) => {
                console.error("Error cargando hábitats", e);
                patchState(store, {
                  error: "No se pudo cargar la lista de hábitats",
                });
              },
            }),
            finalize(() => patchState(store, { isLoading: false })),
          ),
        ),
      ),
    ),
  })),

  withComputed((store) => ({
    activeHabitats: computed(() =>
      store.habitats().filter((habitat) => habitat.isActive),
    ),
  })),
);
