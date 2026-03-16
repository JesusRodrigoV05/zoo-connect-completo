import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import {
  Proveedor,
  CreateProveedor,
  UpdateProveedor,
} from "../models/productos.model";
import { AdminProveedores } from "../services/admin-proveedores";
import { ShowToast } from "@app/shared/services";

type ProveedorState = {
  items: Proveedor[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: ProveedorState = {
  items: [],
  total: 0,
  page: 1,
  size: 10,
  loading: false,
  isSaving: false,
  error: null,
};

export const ProveedoresStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (store, service = inject(AdminProveedores), toast = inject(ShowToast)) => ({
      setPage(page: number, size: number) {
        patchState(store, { page, size });
        this.loadItems();
      },

      loadItems: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const { page, size } = store;
            return service.getProveedores(page(), size()).pipe(
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

      createItem: rxMethod<CreateProveedor>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            service.createProveedor(data).pipe(
              tapResponse({
                next: (newItem) => {
                  toast.showSuccess(
                    "Creado",
                    "Proveedor registrado exitosamente",
                  );
                  patchState(store, (state) => ({
                    items: [newItem, ...state.items],
                    total: state.total + 1,
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo registrar al proveedor");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      updateItem: rxMethod<{ id: number; data: UpdateProveedor }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, data }) =>
            service.updateProveedor(id, data).pipe(
              tapResponse({
                next: (updatedItem) => {
                  toast.showSuccess(
                    "Actualizado",
                    "Datos del proveedor modificados",
                  );
                  patchState(store, (state) => ({
                    items: state.items.map((i) =>
                      i.id === id ? updatedItem : i,
                    ),
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError(
                    "Error",
                    "No se pudo actualizar el proveedor",
                  );
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
            service.deleteProveedor(id).pipe(
              tapResponse({
                next: () => {
                  toast.showSuccess("Eliminado", "Proveedor dado de baja");
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
