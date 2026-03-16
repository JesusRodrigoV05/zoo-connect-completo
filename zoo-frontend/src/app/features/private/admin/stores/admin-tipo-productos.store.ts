import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import {
  CreateTipoProducto,
  TipoProducto,
  UpdateTipoProducto,
} from "../models/productos.model";
import { AdminTipoProductos } from "../services/admin-tipo-productos";
import { ShowToast } from "@app/shared/services";

type TipoState = {
  items: TipoProducto[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: TipoState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  loading: false,
  isSaving: false,
  error: null,
};

export const TiposProductoStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(AdminTipoProductos),
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
            return service.getTipos(page(), size()).pipe(
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

      createItem: rxMethod<CreateTipoProducto>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            service.createTipo(data).pipe(
              tapResponse({
                next: (newItem) => {
                  toast.showSuccess("Creado", "Tipo de producto registrado");
                  patchState(store, (state) => ({
                    items: [newItem, ...state.items],
                    total: state.total + 1,
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo crear");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      updateItem: rxMethod<{ id: number; data: UpdateTipoProducto }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, data }) =>
            service.updateTipo(id, data).pipe(
              tapResponse({
                next: (updatedItem) => {
                  toast.showSuccess(
                    "Actualizado",
                    "Tipo modificado correctamente",
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
            service.deleteTipo(id).pipe(
              tapResponse({
                next: () => {
                  toast.showSuccess("Eliminado", "Registro borrado");
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
