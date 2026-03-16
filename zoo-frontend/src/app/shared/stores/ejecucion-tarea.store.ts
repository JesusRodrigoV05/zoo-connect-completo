import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import {
  SugerenciaDietaResponse,
  Tarea,
} from "@app/features/private/admin/models/tareas/tarea.model";
import { EjecucionTareas } from "../services/ejecucion-tareas";
import { ShowToast } from "../services";

type MisTareasState = {
  tareas: Tarea[];
  sugerenciaDieta: SugerenciaDietaResponse | null;
  loading: boolean;
  loadingDieta: boolean;
  saving: boolean;
  error: string | null;
};

const initialState: MisTareasState = {
  tareas: [],
  sugerenciaDieta: null,
  loading: false,
  loadingDieta: false,
  saving: false,
  error: null,
};

export const MisTareasStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods(
    (
      store,
      ejecucionService = inject(EjecucionTareas),
      toast = inject(ShowToast),
    ) => ({
      loadMisTareas: rxMethod<{ completadas?: boolean }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ completadas = false }) =>
            ejecucionService.getMyTasks(1, 50, completadas).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    tareas: res.items,
                    loading: false,
                  }),
                error: (err: any) => {
                  const errorMsg =
                    err?.error?.message || "Error cargando tus tareas";
                  toast.showError("Error de carga", errorMsg);
                  patchState(store, {
                    loading: false,
                    error: errorMsg,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      completarTareaSimple: rxMethod<{ id: number; data: any }>(
        pipe(
          tap(() => patchState(store, { saving: true })),
          switchMap(({ id, data }) =>
            ejecucionService.completeSimpleTask(id, data).pipe(
              tapResponse({
                next: (tareaCompletada) => {
                  toast.showSuccess(
                    "Tarea Completada",
                    "La tarea se ha registrado correctamente.",
                  );

                  patchState(store, (state) => ({
                    tareas: state.tareas.map((t) =>
                      t.id === id
                        ? { ...tareaCompletada, completada: true }
                        : t,
                    ),
                    saving: false,
                  }));
                },
                error: (err: any) => {
                  const errorMsg =
                    err?.error?.message || "Error al completar tarea";
                  toast.showError("Error", errorMsg);

                  patchState(store, {
                    saving: false,
                    error: errorMsg,
                  });
                },
              }),
            ),
          ),
        ),
      ),

      loadSugerenciaDieta: rxMethod<number>(
        pipe(
          tap(() =>
            patchState(store, { loadingDieta: true, sugerenciaDieta: null }),
          ),
          switchMap((idTarea) =>
            ejecucionService.getSugerenciaDieta(idTarea).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    sugerenciaDieta: res,
                    loadingDieta: false,
                  }),
                error: (err) => {
                  toast.showError(
                    "Error",
                    "No se pudo cargar la dieta sugerida.",
                  );

                  patchState(store, {
                    loadingDieta: false,
                    error: "No se pudo cargar la dieta sugerida.",
                  });
                },
              }),
            ),
          ),
        ),
      ),

      resetSugerencia: () => {
        patchState(store, { sugerenciaDieta: null, loadingDieta: false });
      },

      completarTareaAlimentacion: rxMethod<{ id: number; data: any }>(
        pipe(
          tap(() => patchState(store, { saving: true })),
          switchMap(({ id, data }) =>
            ejecucionService.completeFeedingTask(id, data).pipe(
              tapResponse({
                next: () => {
                  toast.showSuccess(
                    "Alimentación Registrada",
                    "Se ha guardado el registro de alimentación.",
                  );

                  patchState(store, (state) => ({
                    tareas: state.tareas.map((t) =>
                      t.id === id
                        ? { ...t, completada: true, estado: "Completada" }
                        : t,
                    ),
                    saving: false,
                    sugerenciaDieta: null,
                  }));
                },
                error: (err: any) => {
                  const errorMsg =
                    err?.error?.message || "Error al registrar alimentación";
                  toast.showError("Error", errorMsg);

                  patchState(store, {
                    saving: false,
                    error: errorMsg,
                  });
                },
              }),
            ),
          ),
        ),
      ),
    }),
  ),
);
