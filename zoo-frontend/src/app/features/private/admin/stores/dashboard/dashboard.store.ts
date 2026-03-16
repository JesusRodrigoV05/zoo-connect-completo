import { inject } from "@angular/core";
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { tapResponse } from "@ngrx/operators";
import { forkJoin, pipe, switchMap, tap, finalize } from "rxjs";
import {
  ChartDataPoint,
  DashboardKpis,
  TasksTodayChart,
} from "../../models/dashboard/dashboard.model";
import { GetDashboardData } from "../../services/dashboard";

type DashboardState = {
  kpis: DashboardKpis | null;
  animalChartData: ChartDataPoint[];
  tasksChartData: TasksTodayChart | null;
  animalChartGroupBy: "clase" | "familia" | "orden" | "filo";
  loading: boolean;
  error: string | null;
};

const initialState: DashboardState = {
  kpis: null,
  animalChartData: [],
  tasksChartData: null,
  animalChartGroupBy: "clase",
  loading: false,
  error: null,
};

export const DashboardStore = signalStore(
  { providedIn: "root" },
  withState(initialState),

  withMethods((store, service = inject(GetDashboardData)) => ({
    loadDashboard: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => {
          return forkJoin({
            kpis: service.getKpis(),
            animals: service.getAnimalsChart(store.animalChartGroupBy()),
            tasks: service.getTasksTodayChart(),
          }).pipe(
            tapResponse({
              next: (results) => {
                patchState(store, {
                  kpis: results.kpis,
                  animalChartData: results.animals,
                  tasksChartData: results.tasks,
                  loading: false,
                });
              },
              error: (err) => {
                console.error("Error cargando dashboard", err);
                patchState(store, {
                  error: "No se pudo cargar la información del tablero",
                  loading: false,
                });
              },
            }),
          );
        }),
      ),
    ),

    updateAnimalChartFilter: rxMethod<"clase" | "familia" | "orden" | "filo">(
      pipe(
        tap((groupBy) => patchState(store, { animalChartGroupBy: groupBy })),
        switchMap((groupBy) =>
          service.getAnimalsChart(groupBy).pipe(
            tapResponse({
              next: (data) => patchState(store, { animalChartData: data }),
              error: () => console.error("Error actualizando gráfico animales"),
            }),
          ),
        ),
      ),
    ),
  })),

  withHooks({
    onInit(store) {
      store.loadDashboard();
    },
  }),
);
