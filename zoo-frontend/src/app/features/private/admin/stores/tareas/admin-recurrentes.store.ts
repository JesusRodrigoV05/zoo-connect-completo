import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { computed, inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import {
  TareaRecurrente,
  CreateTareaRecurrente,
} from "../../models/tareas/tarea.model";
import { AdminRecurrentes } from "../../services/tareas/admin-recurrentes";
import { ShowToast } from "@app/shared/services";

type RecurrenteState = {
  items: TareaRecurrente[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: RecurrenteState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  loading: false,
  isSaving: false,
  error: null,
};

export const RecurrentesStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed((state) => ({
    pages: computed(() => Math.ceil(state.total() / state.size())),
    hasItems: computed(() => state.items().length > 0),
    activeItems: computed(() => state.items().filter((i) => i.isActive)),
    inactiveItems: computed(() => state.items().filter((i) => !i.isActive)),
  })),
  withMethods(
    (store, service = inject(AdminRecurrentes), toast = inject(ShowToast)) => ({
      setPage(page: number, size: number) {
        patchState(store, { page, size });
        this.loadItems();
      },

      loadItems: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const { page, size } = store;
            return service.getRecurrentes(page(), size()).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    items: res.items,
                    total: res.total,
                    loading: false,
                  }),
                error: (err: any) =>
                  patchState(store, {
                    loading: false,
                    error: err.message || "Error al cargar rutinas",
                  }),
              }),
            );
          }),
        ),
      ),

      createItem: rxMethod<CreateTareaRecurrente>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            service.createRecurrente(data).pipe(
              tapResponse({
                next: (newItem) => {
                  toast.showSuccess("Creado", "Tarea recurrente programada");
                  patchState(store, (state) => ({
                    items: [newItem, ...state.items],
                    total: state.total + 1,
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError(
                    "Error",
                    "No se pudo crear la tarea recurrente",
                  );
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      updateItem: rxMethod<{
        id: number;
        data: Partial<CreateTareaRecurrente>;
      }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, data }) =>
            service.updateRecurrente(id, data).pipe(
              tapResponse({
                next: (updatedItem) => {
                  toast.showSuccess(
                    "Actualizado",
                    "Configuración de tarea actualizada",
                  );
                  patchState(store, (state) => ({
                    items: state.items.map((i) =>
                      i.id === id ? updatedItem : i,
                    ),
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo actualizar");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      deleteItem: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((id) =>
            service.deleteRecurrente(id).pipe(
              tapResponse({
                next: () => {
                  toast.showSuccess("Eliminado", "Tarea recurrente eliminada");
                  patchState(store, (state) => ({
                    items: state.items.filter((i) => i.id !== id),
                    total: state.total - 1,
                    loading: false,
                  }));
                },
                error: (err: any) =>
                  patchState(store, { loading: false, error: err.message }),
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
