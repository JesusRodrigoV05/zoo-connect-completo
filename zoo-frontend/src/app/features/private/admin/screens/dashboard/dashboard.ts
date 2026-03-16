import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { MainContainer } from "@app/shared/components/main-container";
import { DashboardStore } from "../../stores/dashboard/dashboard.store";
import { ButtonModule } from "primeng/button";
import { ChartModule } from "primeng/chart";
import { TooltipModule } from "primeng/tooltip";
import { SkeletonModule } from "primeng/skeleton";
import { SelectButtonModule } from "primeng/selectbutton";
import { FormsModule } from "@angular/forms";
import { KpiCard, KpiModel } from "./components/kpi-card/kpi-card";
import { ZooIcon } from "@app/shared/components/ui/zoo-icon";
import { GenerarReportes } from "@app/shared/services/generar-reportes";
import { ShowToast } from "@app/shared/services";

@Component({
  selector: "app-dashboard",
  imports: [
    MainContainer,
    RouterLink,
    ButtonModule,
    ChartModule,
    TooltipModule,
    SkeletonModule,
    SelectButtonModule,
    FormsModule,
    KpiCard,
    ZooIcon,
  ],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Dashboard {
  readonly store = inject(DashboardStore);
  private reportesService = inject(GenerarReportes);
  private toast = inject(ShowToast);

  protected isDownloadingDiario = signal(false);

  groupByOptions = [
    { label: "Clase", value: "clase" },
    { label: "Familia", value: "familia" },
    { label: "Orden", value: "orden" },
  ];

  kpis = computed(() => {
    const data = this.store.kpis();
    if (!data) return [];

    return [
      {
        title: "Total Animales",
        value: data.total_animales,
        iconName: "github",
        iconColor: "#3b82f6",
        bgClass: "bg-blue-100",
      },
      {
        title: "Total Usuarios",
        value: data.total_usuarios,
        iconName: "user",
        iconColor: "#22c55e",
        bgClass: "bg-green-100",
      },
      {
        title: "Alertas Stock",
        value: data.alertas_stock,
        iconName: "error",
        iconColor: "#f97316",
        bgClass: "bg-orange-100",
        diff: data.alertas_stock > 0 ? "Requiere atención" : "Inventario OK",
      },
      {
        title: "Tareas Pendientes",
        value: data.tareas_pendientes,
        iconName: "task",
        iconColor: "#a855f7",
        bgClass: "bg-purple-100",
        diff: "Para hoy",
      },
    ];
  });

  animalsChartData = computed(() => {
    const rawData = this.store.animalChartData();
    return {
      labels: rawData.map((d) => d.label),
      datasets: [
        {
          data: rawData.map((d) => d.value),
        },
      ],
    };
  });

  tasksChartData = computed(() => {
    const rawData = this.store.tasksChartData();
    if (!rawData) return null;

    return {
      labels: rawData.resumen.map((r) => r.estado),
      datasets: [
        {
          label: "Cantidad",
          data: rawData.resumen.map((r) => r.cantidad),
          backgroundColor: ["#60a5fa", "#34d399", "#f87171"],
          borderRadius: 6,
        },
      ],
    };
  });

  chartOptions = {
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, color: "var(--p-text-color)" },
      },
    },
    maintainAspectRatio: false,
  };

  onFilterChange(event: any) {
    if (event.value) {
      this.store.updateAnimalChartFilter(event.value);
    }
  }

  descargarReporteDiario() {
    this.isDownloadingDiario.set(true);

    this.reportesService.downloadDiario(new Date()).subscribe({
      next: () => {
        this.isDownloadingDiario.set(false);
        this.toast.showSuccess(
          "Descarga completa",
          "El reporte diario se ha descargado.",
        );
      },
      error: () => {
        this.isDownloadingDiario.set(false);
        this.toast.showError("Error", "No se pudo generar el reporte diario.");
      },
    });
  }
}
