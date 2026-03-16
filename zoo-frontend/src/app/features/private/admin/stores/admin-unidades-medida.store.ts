import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { AdminUnidadesMedida } from "../services/admin-unidades-medida";
import { ShowToast } from "@app/shared/services";
import {
  CreateUnidadMedida,
  UnidadMedida,
  UpdateUnidadMedida,
} from "../models/productos.model";

type UnidadState = {
  items: UnidadMedida[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: UnidadState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  loading: false,
  isSaving: false,
  error: null,
};

export const UnidadesMedidaStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(AdminUnidadesMedida),
      toast = inject(ShowToast),
    ) => ({
      setPage(page: number, size: number) {
        patchState(store, { page, size });
        this.loadItems();
      },

      loadItems: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const { page, size } = store;
            return service.getUnidades(page(), size()).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    items: res.items,
                    total: res.total,
                    loading: false,
                  }),
                error: (err: any) =>
                  patchState(store, { loading: false, error: err.message }),
              }),
            );
          }),
        ),
      ),

      createItem: rxMethod<CreateUnidadMedida>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            service.createUnidad(data).pipe(
              tapResponse({
                next: (newItem) => {
                  toast.showSuccess("Creado", "Unidad de medida registrada");
                  patchState(store, (state) => ({
                    items: [newItem, ...state.items],
                    total: state.total + 1,
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo crear la unidad");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      updateItem: rxMethod<{ id: number; data: UpdateUnidadMedida }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, data }) =>
            service.updateUnidad(id, data).pipe(
              tapResponse({
                next: (updatedItem) => {
                  toast.showSuccess(
                    "Actualizado",
                    "Unidad modificada correctamente",
                  );
                  patchState(store, (state) => ({
                    items: state.items.map((i) =>
                      i.id === id ? updatedItem : i,
                    ),
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo actualizar la unidad");
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
            service.deleteUnidad(id).pipe(
              tapResponse({
                next: () => {
                  toast.showSuccess("Eliminado", "Unidad dada de baja");
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
