import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { ShowToast } from "@app/shared/services";
import {
  CreateDietaRequest,
  Dieta,
  UpdateDietaRequest,
} from "../models/alimentacion.model";
import { AlimentacionService } from "../services/alimentacion-service";

type DietaState = {
  dietas: Dieta[];
  total: number;
  page: number;
  size: number;
  loading: boolean;
  isSaving: boolean;
  error: string | null;
  selectedDieta: Dieta | null;
};

const initialState: DietaState = {
  dietas: [],
  total: 0,
  page: 1,
  size: 20,
  loading: false,
  isSaving: false,
  error: null,
  selectedDieta: null,
};

export const AlimentacionStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (
      store,
      service = inject(AlimentacionService),
      toast = inject(ShowToast),
    ) => ({
      setPage(page: number, size: number) {
        patchState(store, { page, size });
        this.loadDietas();
      },

      loadDietas: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const { page, size } = store;
            return service.getDietas(page(), size()).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    dietas: res.items,
                    total: res.total,
                    loading: false,
                  }),
                error: (err: any) =>
                  patchState(store, {
                    loading: false,
                    error: err.message || "Error al cargar dietas",
                  }),
              }),
            );
          }),
        ),
      ),

      loadSugerenciaDieta: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((tareaId) =>
            service.getSugerenciaDieta(tareaId).pipe(
              tapResponse({
                next: (dieta) =>
                  patchState(store, {
                    selectedDieta: dieta,
                    loading: false,
                  }),
                error: (err: any) => {
                  toast.showWarning(
                    "Aviso",
                    "No se encontró dieta sugerida para esta tarea",
                  );
                  patchState(store, { loading: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      createDieta: rxMethod<CreateDietaRequest>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap((data) =>
            service.createDieta(data).pipe(
              tapResponse({
                next: (newItem) => {
                  toast.showSuccess("Creado", "Dieta registrada exitosamente");
                  patchState(store, (state) => ({
                    dietas: [newItem, ...state.dietas],
                    total: state.total + 1,
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo registrar la dieta");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      updateDieta: rxMethod<{ id: number; data: UpdateDietaRequest }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, data }) =>
            service.updateDieta(id, data).pipe(
              tapResponse({
                next: (updatedItem) => {
                  toast.showSuccess(
                    "Actualizado",
                    "Dieta modificada correctamente",
                  );
                  patchState(store, (state) => ({
                    dietas: state.dietas.map((i) =>
                      i.id === id ? updatedItem : i,
                    ),
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo actualizar la dieta");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      deleteDieta: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((id) =>
            service.deleteDieta(id).pipe(
              tapResponse({
                next: () => {
                  toast.showSuccess("Eliminado", "Dieta dada de baja");
                  patchState(store, (state) => ({
                    dietas: state.dietas.filter((i) => i.id !== id),
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
