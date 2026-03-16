import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { inject } from "@angular/core";
import { pipe, switchMap, tap } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { ShowToast } from "@app/shared/services";
import { Noticia } from "@models/noticias/noticia.model";
import { AdminNoticias } from "../../services/noticias";

type NoticiasState = {
  items: Noticia[];
  total: number;
  page: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  selectedId: string | null;
};

const initialState: NoticiasState = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  loading: false,
  error: null,
  selectedId: null,
};

export const NoticiasStore = signalStore(
  withState(initialState),

  withMethods(
    (store, service = inject(AdminNoticias), toast = inject(ShowToast)) => ({
      loadNoticias: rxMethod<{ page: number; size: number }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(({ page, size }) =>
            service.getAllNoticias(page, size).pipe(
              tapResponse({
                next: (response) => {
                  patchState(store, {
                    items: response.items,
                    total: response.total,
                    page: response.page,
                    loading: false,
                  });
                },
                error: (err: any) => {
                  const errorMsg = err.message || "Error al cargar noticias";
                  patchState(store, { error: errorMsg, loading: false });
                  console.error(err);
                },
              }),
            ),
          ),
        ),
      ),

      deleteNoticia: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((id) =>
            service.deleteNoticia(id).pipe(
              tapResponse({
                next: () => {
                  const currentItems = store
                    .items()
                    .filter((item) => item.id !== id);
                  let newPage = store.page();

                  if (currentItems.length === 0 && newPage > 1) {
                    newPage = newPage - 1;
                  }

                  patchState(store, {
                    items: currentItems,
                    total: store.total() - 1,
                    page: newPage,
                    loading: false,
                  });

                  toast.showSuccess("Éxito", "Noticia eliminada correctamente");

                  if (newPage !== store.page()) {
                    // Llamada recursiva o simple recarga
                    // En este caso simple, la lista vacía ya se actualizó,
                    // pero si queremos datos reales del server:
                    // this.loadNoticias({ page: newPage, size: store.pageSize() });
                  }
                },
                error: (err: any) => {
                  patchState(store, { loading: false });
                  toast.showError("Error", "No se pudo eliminar la noticia");
                },
              }),
            ),
          ),
        ),
      ),

      setPage(page: number, pageSize: number) {
        patchState(store, { page, pageSize });
        this.loadNoticias({ page, size: pageSize });
      },

      selectNoticia(id: string | null) {
        patchState(store, { selectedId: id });
      },
    }),
  ),
);
