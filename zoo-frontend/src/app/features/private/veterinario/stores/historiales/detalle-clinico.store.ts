import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { pipe, switchMap, tap, forkJoin } from "rxjs";
import { ShowToast } from "@app/shared/services";
import { Historial } from "../../models/historiales/historial.model";
import { Receta, RecetaForm } from "../../models/historiales/receta.model";
import {
  Procedimiento,
  ProcedimientoForm,
} from "../../models/historiales/procedimiento.model";
import {
  OrdenExamen,
  OrdenExamenForm,
} from "../../models/historiales/examenes.model";
import { VetHistoriales } from "../../services/historiales/vet-historiales";
import { VetRecetas } from "../../services/historiales/vet-recetas";
import { VetProcedimientos } from "../../services/historiales/vet-procedimientos";
import { VetExamenes } from "../../services/historiales/vet-examenes";

type DetalleState = {
  historial: Historial | null;
  recetas: Receta[];
  procedimientos: Procedimiento[];
  ordenes: OrdenExamen[];

  loading: boolean;
  actionLoading: boolean;
  error: string | null;
};

const initialState: DetalleState = {
  historial: null,
  recetas: [],
  procedimientos: [],
  ordenes: [],
  loading: false,
  actionLoading: false,
  error: null,
};

export const DetalleClinicoStore = signalStore(
  withState(initialState),

  withComputed((store) => ({
    bloqueado: computed(() => !store.historial()?.abierto),
    historialId: computed(() => store.historial()?.id || 0),
  })),

  withMethods(
    (
      store,
      historialService = inject(VetHistoriales),
      recetaService = inject(VetRecetas),
      procedimientoService = inject(VetProcedimientos),
      examenService = inject(VetExamenes),
      toast = inject(ShowToast),
    ) => ({
      cargarHistorialCompleto: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((id) =>
            historialService.getHistorialById(id).pipe(
              tapResponse({
                next: (data) => {
                  patchState(store, {
                    historial: data,
                    recetas: data.recetas || [],
                    procedimientos: data.procedimientos || [],
                    ordenes: data.ordenesExamen || [],
                    loading: false,
                  });
                },
                error: (err) => {
                  patchState(store, {
                    error: "Error cargando historial",
                    loading: false,
                  });
                  toast.showError(
                    "Error",
                    "No se pudo cargar el historial clínico",
                  );
                },
              }),
            ),
          ),
        ),
      ),

      agregarReceta: rxMethod<RecetaForm>(
        pipe(
          tap(() => patchState(store, { actionLoading: true })),
          switchMap((form) => {
            const idHistorial = store.historial()!.id;
            return recetaService.createReceta(idHistorial, form).pipe(
              tapResponse({
                next: (nuevaReceta) => {
                  patchState(store, {
                    recetas: [...store.recetas(), nuevaReceta],
                    actionLoading: false,
                  });
                  toast.showSuccess(
                    "Receta Creada",
                    "Se ha agregado correctamente",
                  );
                },
                error: (err) => {
                  patchState(store, { actionLoading: false });
                  toast.showError("Error", "No se pudo crear la receta");
                },
              }),
            );
          }),
        ),
      ),

      eliminarReceta: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { actionLoading: true })),
          switchMap((id) =>
            recetaService.deleteReceta(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    recetas: store.recetas().filter((r) => r.id !== id),
                    actionLoading: false,
                  });
                  toast.showSuccess("Eliminado", "Receta eliminada");
                },
                error: () => {
                  patchState(store, { actionLoading: false });
                  toast.showError("Error", "No se pudo eliminar");
                },
              }),
            ),
          ),
        ),
      ),

      agregarProcedimiento: rxMethod<ProcedimientoForm>(
        pipe(
          tap(() => patchState(store, { actionLoading: true })),
          switchMap((form) => {
            const idHistorial = store.historial()!.id;
            return procedimientoService
              .createProcedimiento(idHistorial, form)
              .pipe(
                tapResponse({
                  next: (nuevoProc) => {
                    patchState(store, {
                      procedimientos: [...store.procedimientos(), nuevoProc],
                      actionLoading: false,
                    });
                    toast.showSuccess("Éxito", "Procedimiento agendado");
                  },
                  error: () => {
                    patchState(store, { actionLoading: false });
                    toast.showError("Error", "Falló la creación");
                  },
                }),
              );
          }),
        ),
      ),

      actualizarProcedimiento: rxMethod<{
        id: number;
        data: ProcedimientoForm;
      }>(
        pipe(
          tap(() => patchState(store, { actionLoading: true })),
          switchMap(({ id, data }) =>
            procedimientoService.updateProcedimiento(id, data).pipe(
              tapResponse({
                next: (itemActualizado) => {
                  patchState(store, {
                    procedimientos: store
                      .procedimientos()
                      .map((p) => (p.id === id ? itemActualizado : p)),
                    actionLoading: false,
                  });
                  toast.showSuccess(
                    "Actualizado",
                    "El procedimiento se ha actualizado correctamente",
                  );
                },
                error: () => {
                  patchState(store, { actionLoading: false });
                  toast.showError(
                    "Error",
                    "No se pudo actualizar el procedimiento",
                  );
                },
              }),
            ),
          ),
        ),
      ),

      eliminarProcedimiento: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { actionLoading: true })),
          switchMap((id) =>
            procedimientoService.deleteProcedimiento(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    procedimientos: store
                      .procedimientos()
                      .filter((p) => p.id !== id),
                    actionLoading: false,
                  });
                  toast.showSuccess("Eliminado", "Procedimiento eliminado");
                },
                error: () => {
                  patchState(store, { actionLoading: false });
                  toast.showError(
                    "Error",
                    "No se pudo eliminar el procedimiento",
                  );
                },
              }),
            ),
          ),
        ),
      ),

      crearOrdenExamen: rxMethod<OrdenExamenForm>(
        pipe(
          tap(() => patchState(store, { actionLoading: true })),
          switchMap((form) => {
            const idHistorial = store.historial()!.id;
            return examenService.createOrden(idHistorial, form).pipe(
              tapResponse({
                next: (nuevaOrden) => {
                  patchState(store, {
                    ordenes: [...store.ordenes(), nuevaOrden],
                    actionLoading: false,
                  });
                  toast.showSuccess(
                    "Solicitud Enviada",
                    "Orden de examen creada",
                  );
                },
                error: () => {
                  patchState(store, { actionLoading: false });
                  toast.showError("Error", "No se pudo crear la orden");
                },
              }),
            );
          }),
        ),
      ),

      cerrarConsulta: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { actionLoading: true })),
          switchMap(() => {
            const id = store.historial()!.id;
            return historialService.cerrarHistorial(id).pipe(
              tapResponse({
                next: (historialActualizado) => {
                  patchState(store, {
                    historial: historialActualizado,
                    actionLoading: false,
                  });
                  toast.showSuccess(
                    "Consulta Finalizada",
                    "El historial se ha cerrado correctamente",
                  );
                },
                error: () => {
                  patchState(store, { actionLoading: false });
                  toast.showError("Error", "No se pudo cerrar la consulta");
                },
              }),
            );
          }),
        ),
      ),
    }),
  ),
);
