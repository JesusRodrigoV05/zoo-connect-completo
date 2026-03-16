import { computed, inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { forkJoin, pipe, switchMap, tap, finalize } from "rxjs";
import { ShowToast } from "@app/shared/services";
import {
  TipoAtencion,
  TipoExamen,
} from "../../models/historiales/veterinario-config.model";
import { VeterinarioConfig } from "../../services/historiales/veterinario-config";

type ConfigState = {
  tiposAtencion: TipoAtencion[];
  tiposExamen: TipoExamen[];
  loading: boolean;
  error: string | null;
};

const initialState: ConfigState = {
  tiposAtencion: [],
  tiposExamen: [],
  loading: false,
  error: null,
};

export const ConfiguracionStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withComputed((store) => ({
    tiposAtencionActivos: computed(() =>
      store.tiposAtencion().filter((t) => t.activo),
    ),
    tiposExamenActivos: computed(() =>
      store.tiposExamen().filter((t) => t.activo),
    ),
  })),

  withMethods(
    (
      store,
      service = inject(VeterinarioConfig),
      toast = inject(ShowToast),
    ) => ({
      loadCatalogs: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() =>
            forkJoin({
              atencion: service.getTiposAtencion(false),
              examen: service.getTiposExamen(false),
            }).pipe(
              tapResponse({
                next: (results) => {
                  patchState(store, {
                    tiposAtencion: results.atencion,
                    tiposExamen: results.examen,
                    loading: false,
                  });
                },
                error: (err: any) => {
                  patchState(store, { error: err.message, loading: false });
                  console.error("Error cargando catálogos veterinarios", err);
                },
              }),
            ),
          ),
        ),
      ),

      addTipoAtencion: rxMethod<Omit<TipoAtencion, "id" | "activo">>(
        pipe(
          switchMap((data) =>
            service.createTipoAtencion(data).pipe(
              tapResponse({
                next: (newItem) => {
                  patchState(store, {
                    tiposAtencion: [...store.tiposAtencion(), newItem],
                  });
                  toast.showSuccess("Éxito", "Tipo de atención creado");
                },
                error: (err) =>
                  toast.showError(
                    "Error",
                    "No se pudo crear el tipo de atención",
                  ),
              }),
            ),
          ),
        ),
      ),

      updateTipoAtencion: rxMethod<{ id: number; data: Partial<TipoAtencion> }>(
        pipe(
          switchMap(({ id, data }) =>
            service.updateTipoAtencion(id, data).pipe(
              tapResponse({
                next: (updatedItem) => {
                  patchState(store, {
                    tiposAtencion: store
                      .tiposAtencion()
                      .map((item) => (item.id === id ? updatedItem : item)),
                  });
                  toast.showSuccess("Éxito", "Tipo de atención actualizado");
                },
                error: (err) =>
                  toast.showError("Error", "No se pudo actualizar"),
              }),
            ),
          ),
        ),
      ),

      deleteTipoAtencion: rxMethod<number>(
        pipe(
          switchMap((id) =>
            service.deleteTipoAtencion(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    tiposAtencion: store
                      .tiposAtencion()
                      .filter((i) => i.id !== id),
                  });
                  toast.showSuccess("Éxito", "Eliminado correctamente");
                },
                error: (err) => toast.showError("Error", "No se pudo eliminar"),
              }),
            ),
          ),
        ),
      ),

      addTipoExamen: rxMethod<Omit<TipoExamen, "id" | "activo">>(
        pipe(
          switchMap((data) =>
            service.createTipoExamen(data).pipe(
              tapResponse({
                next: (newItem) => {
                  patchState(store, {
                    tiposExamen: [...store.tiposExamen(), newItem],
                  });
                  toast.showSuccess("Éxito", "Tipo de examen creado");
                },
                error: (err) => toast.showError("Error", "No se pudo crear"),
              }),
            ),
          ),
        ),
      ),

      updateTipoExamen: rxMethod<{ id: number; data: Partial<TipoExamen> }>(
        pipe(
          switchMap(({ id, data }) =>
            service.updateTipoExamen(id, data).pipe(
              tapResponse({
                next: (updatedItem) => {
                  patchState(store, {
                    tiposExamen: store
                      .tiposExamen()
                      .map((item) => (item.id === id ? updatedItem : item)),
                  });
                  toast.showSuccess("Éxito", "Tipo de examen actualizado");
                },
                error: (err) =>
                  toast.showError("Error", "No se pudo actualizar"),
              }),
            ),
          ),
        ),
      ),

      deleteTipoExamen: rxMethod<number>(
        pipe(
          switchMap((id) =>
            service.deleteTipoExamen(id).pipe(
              tapResponse({
                next: () => {
                  patchState(store, {
                    tiposExamen: store.tiposExamen().filter((i) => i.id !== id),
                  });
                  toast.showSuccess("Éxito", "Eliminado correctamente");
                },
                error: (err) => toast.showError("Error", "No se pudo eliminar"),
              }),
            ),
          ),
        ),
      ),
    }),
  ),

  withHooks({
    onInit(store) {
      store.loadCatalogs();
    },
  }),
);
