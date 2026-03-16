import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { computed, inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { forkJoin, pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { CreateTareaManual, Tarea } from "../../models/tareas/tarea.model";
import { AdminOperacionesTarea } from "../../services/tareas/admin-operaciones-tarea";
import { Usuario } from "@models/usuario";
import { ShowToast } from "@app/shared/services";

type TareasPendientesState = {
  sinAsignar: Tarea[];
  asignadasHoy: Tarea[];
  loadingSinAsignar: boolean;
  loadingAsignadasHoy: boolean;
  creatingManual: boolean;
  error: string | null;
};

const initialState: TareasPendientesState = {
  sinAsignar: [],
  asignadasHoy: [],
  loadingSinAsignar: false,
  loadingAsignadasHoy: false,
  creatingManual: false,
  error: null,
};

export const TareasPendientesStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withComputed((state) => ({
    unassignedTasks: state.sinAsignar,
    assignedTasks: state.asignadasHoy,
    loading: computed(
      () => state.loadingSinAsignar() || state.loadingAsignadasHoy(),
    ),

    tasksByCaretaker: computed((): Map<string, Tarea[]> => {
      const map = new Map<string, Tarea[]>();

      state.asignadasHoy().forEach((tarea) => {
        const usuario = tarea.usuarioAsignado;
        if (!usuario?.id) return;

        const key = usuario.username;

        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(tarea);
      });

      return map;
    }),

    caretakers: computed((): Usuario[] => {
      const seen = new Set<string>();
      const result: Usuario[] = [];

      state.asignadasHoy().forEach((tarea) => {
        const usuario = tarea.usuarioAsignado;
        if (usuario && !seen.has(usuario.id)) {
          seen.add(usuario.id);
          result.push(usuario);
        }
      });

      return result;
    }),
  })),
  withMethods(
    (
      store,
      adminService = inject(AdminOperacionesTarea),
      toast = inject(ShowToast),
    ) => ({
      loadSinAsignar: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, { loadingSinAsignar: true, error: null }),
          ),
          switchMap(() =>
            adminService.getUnassignedTasks(1, 100).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    sinAsignar: res.items,
                    loadingSinAsignar: false,
                  }),
                error: (err: any) =>
                  patchState(store, {
                    loadingSinAsignar: false,
                    error:
                      err?.error?.message ||
                      "Error cargando tareas sin asignar",
                  }),
              }),
            ),
          ),
        ),
      ),

      loadAsignadasHoy: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, { loadingAsignadasHoy: true, error: null }),
          ),
          switchMap(() =>
            adminService.getAssignedTasksToday(1, 100).pipe(
              tapResponse({
                next: (res) =>
                  patchState(store, {
                    asignadasHoy: res.items,
                    loadingAsignadasHoy: false,
                  }),
                error: (err: any) =>
                  patchState(store, {
                    loadingAsignadasHoy: false,
                    error:
                      err?.error?.message || "Error cargando tareas de hoy",
                  }),
              }),
            ),
          ),
        ),
      ),

      assignTask: rxMethod<{ tareaId: number; usuarioId: number }>(
        pipe(
          switchMap(({ tareaId, usuarioId }) =>
            adminService.assignTask(tareaId, usuarioId).pipe(
              tapResponse({
                next: (tareaActualizada) => {
                  patchState(store, (state) => ({
                    sinAsignar: state.sinAsignar.filter(
                      (t) => t.id !== tareaId,
                    ),
                    asignadasHoy: [tareaActualizada, ...state.asignadasHoy],
                  }));
                },
                error: (err: any) =>
                  patchState(store, {
                    error: err?.error?.message || "Error al asignar tarea",
                  }),
              }),
            ),
          ),
        ),
      ),

      loadDashboard: rxMethod<void>(
        pipe(
          tap(() =>
            patchState(store, {
              loadingSinAsignar: true,
              loadingAsignadasHoy: true,
              error: null,
            }),
          ),
          switchMap(() =>
            forkJoin({
              sinAsignar: adminService.getUnassignedTasks(1, 100),
              asignadasHoy: adminService.getAssignedTasksToday(1, 100),
            }).pipe(
              tapResponse({
                next: ({ sinAsignar, asignadasHoy }) => {
                  patchState(store, {
                    sinAsignar: sinAsignar.items,
                    asignadasHoy: asignadasHoy.items,
                    loadingSinAsignar: false,
                    loadingAsignadasHoy: false,
                  });
                },
                error: (err: any) => {
                  patchState(store, {
                    loadingSinAsignar: false,
                    loadingAsignadasHoy: false,
                    error: err?.error?.message || "Error cargando el dashboard",
                  });
                },
              }),
            ),
          ),
        ),
      ),
      createManualTask: rxMethod<CreateTareaManual>(
        pipe(
          tap(() => patchState(store, { creatingManual: true, error: null })),
          switchMap((data) =>
            adminService.createManualTask(data).pipe(
              tapResponse({
                next: (nuevaTarea) => {
                  toast.showSuccess("Creada", "Tarea manual creada con éxito");

                  // Decidimos dónde va según si tiene usuario asignado o no
                  if (nuevaTarea.usuarioAsignado?.id) {
                    patchState(store, (state) => ({
                      asignadasHoy: [nuevaTarea, ...state.asignadasHoy],
                    }));
                  } else {
                    patchState(store, (state) => ({
                      sinAsignar: [nuevaTarea, ...state.sinAsignar],
                    }));
                  }
                },
                error: (err: any) => {
                  toast.showError(
                    "Error",
                    err?.error?.message || "No se pudo crear la tarea",
                  );
                  patchState(store, { error: err?.error?.message });
                },
              }),
              tap(() => patchState(store, { creatingManual: false })),
            ),
          ),
        ),
      ),
    }),
  ),
);
