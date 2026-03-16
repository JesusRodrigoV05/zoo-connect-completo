export interface DashboardKpis {
  total_animales: number;
  total_usuarios: number;
  alertas_stock: number;
  tareas_pendientes: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

export interface TaskSummaryItem {
  estado: string;
  cantidad: number;
}

export interface TasksTodayChart {
  total_hoy: number;
  resumen: TaskSummaryItem[];
}
