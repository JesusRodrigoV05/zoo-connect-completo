import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  signal,
} from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { FormsModule } from "@angular/forms";
import { AdminEncuestas } from "@app/features/private/admin/services/admin-encuestas";
import { ChartModule } from "primeng/chart";
import { SelectButtonModule } from "primeng/selectbutton";
import { switchMap } from "rxjs";

type SupportedChartType = "bar" | "pie" | "doughnut" | "line";

@Component({
  selector: "app-encuesta-stats",
  imports: [ChartModule, FormsModule, SelectButtonModule],
  templateUrl: "./encuesta-stats.html",
  styleUrl: "./encuesta-stats.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EncuestaStats {
  private surveyService = inject(AdminEncuestas);

  id = input.required<string>();

  statsRequest = toSignal(
    toObservable(this.id).pipe(
      switchMap((id) => this.surveyService.getStats(id)),
    ),
  );

  chartTypesState = signal<Record<string, SupportedChartType>>({});

  chartTypeOptions = [
    { icon: "pi pi-chart-bar", value: "bar", title: "Barras" },
    { icon: "pi pi-chart-pie", value: "pie", title: "Pastel" },
    { icon: "pi pi-circle", value: "doughnut", title: "Dona" },
    { icon: "pi pi-chart-line", value: "line", title: "Línea" },
  ];

  private readonly bgColors = [
    "rgba(161, 225, 164, 0.7)",
    "rgba(14, 107, 168, 0.7)",
    "rgba(93, 169, 233, 0.7)",
    "rgba(186, 151, 144, 0.7)",
  ];
  private readonly borderColors = ["#618762", "#084165", "#38658c", "#705b56"];

  chartsData = computed(() => {
    const stats = this.statsRequest();
    const typeState = this.chartTypesState();

    if (!stats) return [];

    return stats.questions.map((q) => {
      const selectedType = typeState[q.id] || "bar";

      const isCircular = selectedType === "pie" || selectedType === "doughnut";

      return {
        id: q.id,
        title: q.text,
        type: selectedType,
        data: {
          labels: q.options.map((o) => o.label),
          datasets: [
            {
              label: "Votos",
              data: q.options.map((o) => o.count),
              backgroundColor: q.options.map(
                (_, i) => this.bgColors[i % this.bgColors.length],
              ),
              borderColor: q.options.map(
                (_, i) => this.borderColors[i % this.borderColors.length],
              ),
              borderWidth: 1,
              fill: selectedType === "line" ? false : true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: isCircular,
              position: "bottom",
            },
            tooltip: {
              callbacks: {
                label: (context: any) => ` ${context.raw} respuestas`,
              },
            },
          },
          scales: isCircular
            ? {}
            : {
                y: {
                  beginAtZero: true,
                  ticks: { precision: 0 },
                  grid: { color: "rgba(0,0,0,0.05)" },
                },
                x: {
                  grid: { display: false },
                },
              },
        },
      };
    });
  });

  updateChartType(questionId: string, newType: SupportedChartType) {
    this.chartTypesState.update((current) => ({
      ...current,
      [questionId]: newType,
    }));
  }
}
