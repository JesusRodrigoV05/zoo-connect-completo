import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import {
  CreateTipoSalida,
  TipoSalida,
  UpdateTipoSalida,
} from "../models/entradas-salidas/transacciones.model";
import { AdminTiposSalida } from "../services/entradas-salidas/admin-tipos-salida";
import { ShowToast } from "@app/shared/services";

type TipoSalidaState = {
  items: TipoSalida[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: TipoSalidaState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  loading: false,
  isSaving: false,
  error: null,
};

export const TiposSalidaStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (store, service = inject(AdminTiposSalida), toast = inject(ShowToast)) => ({
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
                  patchState(store, {
                    loading: false,
                    error: err.message || "Error al cargar tipos de salida",
                  }),
              }),
            );
          }),
        ),
      ),

      createItem: rxMethod<CreateTipoSalida>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            service.createTipo(data).pipe(
              tapResponse({
                next: (newItem) => {
                  toast.showSuccess("Creado", "Tipo de salida registrado");
                  patchState(store, (state) => ({
                    items: [newItem, ...state.items],
                    total: state.total + 1,
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo crear el tipo");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      updateItem: rxMethod<{ id: number; data: UpdateTipoSalida }>(
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
                  toast.showSuccess("Eliminado", "Tipo de salida dado de baja");
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
