import { inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { pipe, switchMap, tap, debounceTime, distinctUntilChanged } from "rxjs";
import { Historial } from "../../models/historiales/historial.model";
import { VetHistoriales } from "../../services/historiales/vet-historiales";

type FiltrosHistorial = {
  animalId?: number;
  estado?: boolean;
  soloMios: boolean;
};

type HistorialesListaState = {
  items: Historial[];
  total: number;

  page: number;
  pageSize: number;

  filters: FiltrosHistorial;

  loading: boolean;
  error: string | null;
};

const initialState: HistorialesListaState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  filters: {
    animalId: undefined,
    estado: undefined,
    soloMios: false,
  },
  loading: false,
  error: null,
};

export const HistorialesListaStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, service = inject(VetHistoriales)) => ({
    loadHistoriales: rxMethod<void>(
      pipe(
        debounceTime(300),
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          const currentFilters = store.filters();

          return service
            .getHistoriales(store.page(), store.pageSize(), {
              animalId: currentFilters.animalId,
              soloMios: currentFilters.soloMios,
              estado: currentFilters.estado,
            })
            .pipe(
              tapResponse({
                next: (response) => {
                  console.log(response.items);
                  patchState(store, {
                    items: response.items,
                    total: response.total,
                    loading: false,
                  });
                },
                error: (err: any) => {
                  patchState(store, {
                    error: "Error al cargar el historial médico.",
                    loading: false,
                    items: [],
                  });
                  console.error(err);
                },
              }),
            );
        }),
      ),
    ),

    updatePagination(page: number, pageSize: number) {
      patchState(store, { page, pageSize });
      this.loadHistoriales();
    },

    updateFilters(newFilters: Partial<FiltrosHistorial>) {
      patchState(store, {
        filters: { ...store.filters(), ...newFilters },
        page: 1,
      });
      this.loadHistoriales();
    },

    resetFilters() {
      patchState(store, {
        filters: initialState.filters,
        page: 1,
      });
      this.loadHistoriales();
    },
  })),

  withHooks({
    onInit(store) {
      store.loadHistoriales();
    },
  }),
);
