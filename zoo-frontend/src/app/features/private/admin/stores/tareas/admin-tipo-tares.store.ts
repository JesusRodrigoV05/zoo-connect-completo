import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { ShowToast } from "@app/shared/services";
import { AdminTiposTarea } from "../../services/tareas/admin-tipos-tarea";
import {
  CreateTipoTarea,
  TipoTarea,
  UpdateTipoTarea,
} from "../../models/tareas/tarea.model";

type TipoTareaState = {
  items: TipoTarea[];
  loading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: TipoTareaState = {
  items: [],
  loading: false,
  isSaving: false,
  error: null,
};

export const TiposTareaStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (store, service = inject(AdminTiposTarea), toast = inject(ShowToast)) => ({
      loadItems: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            service.getTipos().pipe(
              tapResponse({
                next: (items) => patchState(store, { items, loading: false }),
                error: (err: any) =>
                  patchState(store, { loading: false, error: err.message }),
              }),
            ),
          ),
        ),
      ),

      createItem: rxMethod<CreateTipoTarea>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            service.createTipo(data).pipe(
              tapResponse({
                next: (newItem) => {
                  toast.showSuccess("Creado", "Tipo de tarea registrado");
                  patchState(store, (state) => ({
                    items: [newItem, ...state.items],
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

      updateItem: rxMethod<{ id: number; data: UpdateTipoTarea }>(
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
                  toast.showSuccess("Eliminado", "Tipo eliminado");
                  patchState(store, (state) => ({
                    items: state.items.filter((i) => i.id !== id),
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
