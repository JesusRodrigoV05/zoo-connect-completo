import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import {
  CreateEntradaRequest,
  CreateSalidaRequest,
  EntradaInventario,
  SalidaInventario,
} from "../models/entradas-salidas/transacciones.model";
import { AdminEntradas } from "../services/entradas-salidas/admin-entradas";
import { ShowToast } from "@app/shared/services";
import { AdminSalidas } from "../services/entradas-salidas/admin-salidas";
import { Router } from "@angular/router";

type TransaccionesState = {
  entradas: EntradaInventario[];
  salidas: SalidaInventario[];
  loading: boolean;
  isSaving: boolean;
  error: string | null;
  page: number;
  size: number;
  total: number;
};

const initialState: TransaccionesState = {
  entradas: [],
  salidas: [],
  loading: false,
  isSaving: false,
  error: null,
  page: 1,
  size: 20,
  total: 0,
};

export const TransaccionesStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (
      store,
      entradasService = inject(AdminEntradas),
      salidasService = inject(AdminSalidas),
      router = inject(Router),
      toast = inject(ShowToast),
    ) => ({
      loadEntradas: rxMethod<{ page: number; size: number }>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(({ page, size }) =>
            entradasService.getEntradas(page, size).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    entradas: res.items,
                    total: res.total,
                    loading: false,
                  }),
                error: (err: any) =>
                  patchState(store, { loading: false, error: err.message }),
              }),
            ),
          ),
        ),
      ),

      registrarEntrada: rxMethod<CreateEntradaRequest>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            entradasService.createEntrada(data).pipe(
              tapResponse({
                next: (nueva) => {
                  toast.showSuccess(
                    "Registrado",
                    "Entrada de inventario exitosa",
                  );
                  router.navigate(["/admin/inventario/transacciones/"]);

                  patchState(store, (state) => ({
                    entradas: [nueva, ...state.entradas],
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo registrar la entrada");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      loadSalidas: rxMethod<{ page: number; size: number }>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(({ page, size }) =>
            salidasService.getSalidas(page, size).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    salidas: res.items,
                    total: res.total,
                    loading: false,
                  }),
                error: (err: any) =>
                  patchState(store, { loading: false, error: err.message }),
              }),
            ),
          ),
        ),
      ),

      registrarSalida: rxMethod<CreateSalidaRequest>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            salidasService.createSalida(data).pipe(
              tapResponse({
                next: (nueva) => {
                  toast.showSuccess(
                    "Registrado",
                    "Salida de inventario confirmada",
                  );
                  patchState(store, (state) => ({
                    salidas: [nueva, ...state.salidas],
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo registrar la salida");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      navigateToList() {
        router.navigate(["/admin/inventarios/transacciones"]);
      },
    }),
  ),
);
