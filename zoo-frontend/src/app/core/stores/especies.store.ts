import { computed } from "@angular/core";
import { inject } from "@angular/core/primitives/di";
import { AdminEspecies } from "@app/features/private/admin/services/admin-especies";
import { Especie } from "@models/animales";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { finalize, pipe, switchMap, tap } from "rxjs";
import { rxMethod } from "@ngrx/signals/rxjs-interop";

type EspecieState = {
  especies: Especie[];
  isLoading: boolean;
  error: string | null;
};

const initialState: EspecieState = {
  especies: [],
  isLoading: false,
  error: null,
};

export const EspecieStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods((store, adminEspecies = inject(AdminEspecies)) => ({
    loadEspecies: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          adminEspecies.getAllSpecies(1, 100).pipe(
            tap({
              next: (response) => {
                patchState(store, { especies: response.items });
              },
              error: (e) => {
                console.error("Error cargando especies", e);
                patchState(store, {
                  error: "No se pudo cargar la lista de especies",
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
    activeEspecies: computed(() =>
      store.especies().filter((especie) => especie.isActive),
    ),
    totalCount: computed(() => store.especies().length),
  })),
);
