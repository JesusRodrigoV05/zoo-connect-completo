import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { inject } from "@angular/core";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap, finalize } from "rxjs";
import { tapResponse } from "@ngrx/operators";
import { Producto } from "../models/productos.model";
import { AdminInventario } from "../services/admin-inventario";
import { ShowToast } from "@app/shared/services";

type ProductFilters = {
  nombre: string | null;
  tipoProductoId: number | null;
  includeInactive: boolean;
};

type ProductState = {
  products: Producto[];
  total: number;
  page: number;
  size: number;
  layout: "list" | "grid";
  filters: ProductFilters;
  loading: boolean;
  isSaving: boolean;
  error: string | null;
};

const initialState: ProductState = {
  products: [],
  total: 0,
  page: 1,
  size: 20,
  layout: "list",
  filters: {
    nombre: null,
    tipoProductoId: null,
    includeInactive: false,
  },
  loading: false,
  isSaving: false,
  error: null,
};

export const ProductStore = signalStore(
  { providedIn: "root" },
  withState(initialState),
  withMethods(
    (store, service = inject(AdminInventario), toast = inject(ShowToast)) => ({
      setLayout(layout: "list" | "grid") {
        patchState(store, { layout });
      },

      updateFilters(filters: Partial<ProductFilters>) {
        patchState(store, (state) => ({
          filters: { ...state.filters, ...filters },
          page: 1,
        }));
        this.loadProducts();
      },

      setPage(page: number, size: number) {
        patchState(store, { page, size });
        this.loadProducts();
      },

      loadProducts: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const { page, size, filters } = store;

            return service
              .getProducts(
                page(),
                size(),
                filters.includeInactive(),
                filters.nombre(),
                filters.tipoProductoId(),
              )
              .pipe(
                tapResponse({
                  next: (response) =>
                    patchState(store, {
                      products: response.items,
                      total: response.total,
                      loading: false,
                    }),
                  error: (err: any) =>
                    patchState(store, {
                      loading: false,
                      error: err.message || "Error al cargar productos",
                    }),
                }),
              );
          }),
        ),
      ),

      createProduct: rxMethod<{ data: any; file?: File }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ data, file }) =>
            service.createProduct(data, file).pipe(
              tapResponse({
                next: (newProduct) => {
                  toast.showSuccess(
                    "Creado",
                    "Producto registrado correctamente",
                  );
                  patchState(store, (state) => ({
                    products: [newProduct, ...state.products],
                    total: state.total + 1,
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo crear el producto");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            ),
          ),
        ),
      ),

      updateProduct: rxMethod<{ id: number; data: any; file?: File }>(
        pipe(
          tap(() => patchState(store, { isSaving: true })),
          switchMap(({ id, data, file }) => {
            return service.updateProduct(id, data).pipe(
              switchMap((updatedProd) => {
                if (file) {
                  return service.updateProductImage(id, file);
                }
                return [updatedProd];
              }),
              tapResponse({
                next: (finalProduct: any) => {
                  const product = Array.isArray(finalProduct)
                    ? finalProduct[0]
                    : finalProduct;

                  toast.showSuccess(
                    "Actualizado",
                    "Producto modificado correctamente",
                  );
                  patchState(store, (state) => ({
                    products: state.products.map((p) =>
                      p.id === id ? product : p,
                    ),
                    isSaving: false,
                  }));
                },
                error: (err: any) => {
                  toast.showError("Error", "No se pudo actualizar el producto");
                  patchState(store, { isSaving: false, error: err.message });
                },
              }),
            );
          }),
        ),
      ),

      deleteProduct: rxMethod<number>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap((id) =>
            service.deleteProduct(id).pipe(
              tapResponse({
                next: () => {
                  toast.showSuccess("Eliminado", "Producto dado de baja");
                  patchState(store, (state) => ({
                    products: state.products.filter((p) => p.id !== id),
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

      loadStockAlerts: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => {
            const { page, size } = store;
            return service.getStockAlertProducts(page(), size()).pipe(
              tapResponse({
                next: (response) => {
                  console.log("Alertas recibidas:", response.items);
                  console.log("Total encontradas:", response.total);
                  patchState(store, {
                    products: response.items,
                    total: response.total,
                    loading: false,
                  });
                },
                error: (err: any) =>
                  patchState(store, {
                    loading: false,
                    error: err.message || "Error al cargar alertas de stock",
                  }),
              }),
            );
          }),
        ),
      ),
    }),
  ),
);
