import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { MainContainer } from "@app/shared/components/main-container";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { ShowToast } from "@app/shared/services";
import {
  RiskMatrixEntryDto,
  RiskMatrixEntryPayload,
  RiskMatrixService,
} from "./matriz-riesgos.service";

type RiskLevel = "Bajo" | "Moderado" | "Alto" | "Extremo" | "Verifique valores";

interface RiskOption {
  readonly label: string;
  readonly value: string;
}

interface RiskRow {
  id: number;
  asset: string;
  threat: string;
  consequence: string;
  probability: number;
  impact: number;
  treatment: string;
  control: string;
  type: string;
  automationLevel: string;
  frequency: string;
  residualProbability: number;
  residualImpact: number;
}

const CONTROL_TYPES: RiskOption[] = [
  { label: "P - Preventivo", value: "P" },
  { label: "D - Detectivo", value: "D" },
  { label: "C - Correctivo", value: "C" },
  { label: "Di - Disuasivo", value: "Di" },
];

const AUTOMATION_LEVELS: RiskOption[] = [
  { label: "A - Automático", value: "A" },
  { label: "S - Semiautomático", value: "S" },
  { label: "M - Manual", value: "M" },
];

const FREQUENCIES: RiskOption[] = [
  { label: "D - Diaria", value: "D" },
  { label: "S - Semanal", value: "S" },
  { label: "M - Mensual", value: "M" },
  { label: "A - Anual", value: "A" },
  { label: "PT - Por transacción", value: "PT" },
  { label: "m - Masivo", value: "m" },
  { label: "s - Semestral", value: "s" },
];

const TREATMENTS_BY_LEVEL: Record<RiskLevel, string[]> = {
  Bajo: ["Aceptar"],
  Moderado: ["Reducir o Mitigar"],
  Alto: ["Evitar o Eliminar", "Compartir o Transferir", "Reducir o Mitigar"],
  Extremo: [
    "Evitar o Eliminar",
    "Compartir o Transferir",
    "Reducir o Mitigar (ATENCIÓN INMEDIATA)",
  ],
  "Verifique valores": [],
};

@Component({
  selector: "app-matriz-riesgos",
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, TooltipModule, ConfirmDialog, MainContainer],
  templateUrl: "./matriz-riesgos.html",
  styleUrl: "./matriz-riesgos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatrizRiesgos {
  private readonly service = inject(RiskMatrixService);
  private readonly toast = inject(ShowToast);
  private readonly confirmService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly controlTypes = CONTROL_TYPES;
  protected readonly automationLevels = AUTOMATION_LEVELS;
  protected readonly frequencies = FREQUENCIES;
  protected readonly scaleValues = [5, 4, 3, 2, 1];
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly rows = signal<RiskRow[]>(this.defaultRows());

  protected readonly riskSummary = computed(() => {
    const counts: Record<string, number> = { Bajo: 0, Moderado: 0, Alto: 0, Extremo: 0 };
    for (const row of this.rows()) {
      const level = this.riskLevel(this.inherentRisk(row));
      if (level in counts) counts[level]++;
    }
    return counts;
  });

  constructor() {
    this.loadRows();
  }

  protected loadRows(): void {
    this.loading.set(true);
    this.service
      .list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (entries) => {
          this.rows.set(entries.length ? entries.map((entry) => this.fromDto(entry)) : this.defaultRows());
        },
        error: () => {
          this.toast.showError("Error", "No se pudo cargar la matriz de riesgos");
          this.rows.set(this.defaultRows());
        },
      });
  }

  protected saveRows(): void {
    const invalid = this.rows().some((row) => !row.asset.trim() || !row.threat.trim());
    if (invalid) {
      this.toast.showWarning("Validación", "Completá activo y amenaza en todas las filas antes de guardar");
      return;
    }

    this.saving.set(true);
    this.service
      .replaceAll(this.rows().map((row) => this.toPayload(row)))
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (entries) => {
          this.rows.set(entries.map((entry) => this.fromDto(entry)));
          this.toast.showSuccess("Matriz guardada", "Los riesgos se guardaron en su tabla propia");
        },
        error: () => {
          this.toast.showError("Error", "No se pudo guardar la matriz de riesgos");
        },
      });
  }

  private defaultRows(): RiskRow[] {
    return [
    {
      id: 1,
      asset: "Aplicación Core",
      threat: "Usurpación de identidad",
      consequence: "Accesos no autorizados a la aplicación core y pérdida de información",
      probability: 2,
      impact: 3,
      treatment: "Reducir o Mitigar",
      control: "Contraseñas individuales",
      type: "P",
      automationLevel: "A",
      frequency: "PT",
      residualProbability: 1,
      residualImpact: 2,
    },
    {
      id: 2,
      asset: "Plataforma de usuarios",
      threat: "Falta de pistas de auditoría",
      consequence: "Inexistencia de trazabilidad de eventos y posible pérdida de auditabilidad",
      probability: 3,
      impact: 3,
      treatment: "Reducir o Mitigar",
      control: "Revisión de pistas de auditoría para identificar situaciones anómalas",
      type: "P",
      automationLevel: "S",
      frequency: "D",
      residualProbability: 2,
      residualImpact: 2,
    },
  ];
  }

  protected inherentRisk(row: RiskRow): number {
    return this.normalizedScore(row.probability, row.impact);
  }

  protected residualScore(row: RiskRow): number {
    return this.normalizedScore(row.residualProbability, row.residualImpact);
  }

  protected riskLevel(score: number): RiskLevel {
    if (score >= 1 && score <= 4) {
      return "Bajo";
    }

    if (score >= 5 && score <= 9) {
      return "Moderado";
    }

    if (score > 9 && score < 20) {
      return "Alto";
    }

    if (score >= 20) {
      return "Extremo";
    }

    return "Verifique valores";
  }

  protected riskClass(score: number): string {
    return this.riskLevel(score).toLowerCase().replace(" ", "-");
  }

  protected treatmentsFor(row: RiskRow): string[] {
    return TREATMENTS_BY_LEVEL[this.riskLevel(this.inherentRisk(row))];
  }

  protected addRow(): void {
    const nextId = Math.max(...this.rows().map((row) => row.id), 0) + 1;
    this.rows.update((rows) => [
      ...rows,
      {
        id: nextId,
        asset: "",
        threat: "",
        consequence: "",
        probability: 1,
        impact: 1,
        treatment: "Aceptar",
        control: "",
        type: "P",
        automationLevel: "M",
        frequency: "M",
        residualProbability: 1,
        residualImpact: 1,
      },
    ]);
  }

  protected confirmRemoveRow(rowId: number): void {
    this.confirmService.confirm({
      message: "¿Estás seguro de eliminar esta fila de la matriz de riesgos?",
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      accept: () => this.rows.update((rows) => rows.filter((r) => r.id !== rowId)),
    });
  }

  protected syncTreatment(row: RiskRow): void {
    this.rows.update((rows) => {
      const treatments = TREATMENTS_BY_LEVEL[this.riskLevel(this.normalizedScore(row.probability, row.impact))];
      const treatment = treatments.includes(row.treatment) ? row.treatment : (treatments[0] ?? "");
      return rows.map((r) => (r.id === row.id ? { ...r, treatment } : r));
    });
  }

  private normalizedScore(probability: number, impact: number): number {
    return Number(probability || 0) * Number(impact || 0);
  }

  private fromDto(entry: RiskMatrixEntryDto): RiskRow {
    return {
      id: entry.id,
      asset: entry.asset,
      threat: entry.threat,
      consequence: entry.consequence,
      probability: entry.probability,
      impact: entry.impact,
      treatment: entry.treatment,
      control: entry.control,
      type: entry.control_type,
      automationLevel: entry.automation_level,
      frequency: entry.frequency,
      residualProbability: entry.residual_probability,
      residualImpact: entry.residual_impact,
    };
  }

  private toPayload(row: RiskRow): RiskMatrixEntryPayload {
    return {
      asset: row.asset,
      threat: row.threat,
      consequence: row.consequence,
      probability: Number(row.probability || 1),
      impact: Number(row.impact || 1),
      treatment: row.treatment,
      control: row.control,
      control_type: row.type,
      automation_level: row.automationLevel,
      frequency: row.frequency,
      residual_probability: Number(row.residualProbability || 1),
      residual_impact: Number(row.residualImpact || 1),
    };
  }
}
