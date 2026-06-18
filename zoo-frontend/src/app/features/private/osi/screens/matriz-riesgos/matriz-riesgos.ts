import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { DialogModule } from "primeng/dialog";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { MainContainer } from "@app/shared/components/main-container";
import { OnboardingService } from "@app/shared/services/onboarding.service";
import { ShowToast } from "@app/shared/services";
import {
  InformationAsset,
  InformationAssetPayload,
  InformationAssetService,
} from "../../services/information-asset.service";
import { RiskWizard } from "./components/risk-wizard/risk-wizard";
import {
  RiskControlPayload,
  RiskMatrixEntryDto,
  RiskMatrixEntryPayload,
  RiskMatrixService,
} from "./matriz-riesgos.service";

type RiskLevel = "Bajo" | "Moderado" | "Alto" | "Extremo" | "Verifique valores";
type RiskTab = "assets" | "risks" | "controls" | "residual" | "result";
type SortField = "asset" | "threat" | "probability" | "impact" | "inherent" | "residual" | null;

interface RiskOption {
  readonly label: string;
  readonly value: string;
}

interface RiskRow {
  id: number;
  informationAssetId?: number;
  asset: string;
  threat: string;
  vulnerability: string;
  riskEvent: string;
  consequence: string;
  probability: number;
  impact: number;
  treatment: string;
  residualProbability: number;
  residualImpact: number;
  controls: RiskControlPayload[];
}

const CONTROL_TYPES: RiskOption[] = [
  { label: "P - Preventivo", value: "P" },
  { label: "D - Detectivo", value: "D" },
  { label: "C - Correctivo", value: "C" },
  { label: "Di - Disuasivo", value: "Di" },
];

const AUTOMATION_LEVELS: RiskOption[] = [
  { label: "A - Automatico", value: "A" },
  { label: "S - Semiautomatico", value: "S" },
  { label: "M - Manual", value: "M" },
];

const FREQUENCIES: RiskOption[] = [
  { label: "PT - Por evento/transaccion", value: "PT" },
  { label: "D - Diario", value: "D" },
  { label: "S - Semanal", value: "S" },
  { label: "M - Mensual", value: "M" },
  { label: "A - Anual", value: "A" },
  { label: "m - Masivo", value: "m" },
  { label: "s - Semestral", value: "s" },
];

const TREATMENTS_BY_LEVEL: Record<RiskLevel, string[]> = {
  Bajo: ["Aceptar"],
  Moderado: ["Reducir o Mitigar"],
  Alto: ["Evitar o Eliminar", "Compartir o Transferir", "Reducir o Mitigar"],
  Extremo: ["Evitar o Eliminar", "Compartir o Transferir", "Reducir o Mitigar"],
  "Verifique valores": [],
};

@Component({
  selector: "app-matriz-riesgos",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    TooltipModule,
    ConfirmDialog,
    MainContainer,
    RiskWizard,
    DialogModule,
  ],
  templateUrl: "./matriz-riesgos.html",
  styleUrl: "./matriz-riesgos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatrizRiesgos {
  private readonly service = inject(RiskMatrixService);
  private readonly assetService = inject(InformationAssetService);
  private readonly toast = inject(ShowToast);
  private readonly confirmService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly onboarding = inject(OnboardingService);

  protected readonly controlTypes = CONTROL_TYPES;
  protected readonly automationLevels = AUTOMATION_LEVELS;
  protected readonly frequencies = FREQUENCIES;
  protected readonly scaleValues = [1, 2, 3, 4, 5];
  protected readonly heatmapValues = [5, 4, 3, 2, 1];
  protected readonly tabs: { key: RiskTab; label: string; icon: string }[] = [
    { key: "assets", label: "Activos", icon: "pi pi-list" },
    { key: "risks", label: "Riesgos", icon: "pi pi-exclamation-triangle" },
    { key: "controls", label: "Controles", icon: "pi pi-shield" },
    { key: "residual", label: "Residual", icon: "pi pi-chart-line" },
    { key: "result", label: "Resultado", icon: "pi pi-check-circle" },
  ];

  protected readonly loading = signal(true);
  protected readonly loadingAssets = signal(true);
  protected readonly saving = signal(false);
  protected readonly savingAsset = signal(false);
  protected readonly showWizard = signal(false);
  protected readonly showAssetDialog = signal(false);
  protected readonly activeTab = signal<RiskTab>("risks");
  protected readonly rows = signal<RiskRow[]>([]);
  protected readonly assets = signal<InformationAsset[]>([]);

  protected readonly searchQuery = signal("");
  protected readonly filterLevel = signal<RiskLevel | "">("");
  protected readonly sortField = signal<SortField>(null);
  protected readonly sortDir = signal<"asc" | "desc">("asc");

  protected currentAsset: InformationAssetPayload = this.emptyAsset();

  protected readonly riskSummary = computed(() => {
    const counts: Record<RiskLevel, number> = {
      Bajo: 0,
      Moderado: 0,
      Alto: 0,
      Extremo: 0,
      "Verifique valores": 0,
    };
    for (const row of this.rows()) {
      counts[this.riskLevel(this.inherentRisk(row))]++;
    }
    return counts;
  });

  protected readonly extremeCount = computed(() => this.riskSummary().Extremo);
  protected readonly highOrAboveCount = computed(() => this.riskSummary().Extremo + this.riskSummary().Alto);
  protected readonly totalRisks = computed(() => this.rows().length);
  protected readonly pendingControlsCount = computed(() => this.rows().filter((row) => row.controls.length === 0).length);
  protected readonly hasPendingControls = computed(() => this.pendingControlsCount() > 0);
  protected readonly residualSummary = computed(() => {
    const counts: Record<RiskLevel, number> = {
      Bajo: 0,
      Moderado: 0,
      Alto: 0,
      Extremo: 0,
      "Verifique valores": 0,
    };
    for (const row of this.rows()) {
      counts[this.riskLevel(this.residualScore(row))]++;
    }
    return counts;
  });
  protected readonly residualHighOrAboveCount = computed(
    () => this.residualSummary().Extremo + this.residualSummary().Alto,
  );
  protected readonly totalResidualReduction = computed(() =>
    this.rows().reduce((total, row) => total + this.riskReduction(row), 0),
  );

  protected readonly filteredRows = computed(() => {
    let data = this.rows();
    const query = this.searchQuery().trim().toLowerCase();
    const level = this.filterLevel();

    if (query) {
      data = data.filter((row) =>
        [
          row.asset,
          row.threat,
          row.vulnerability,
          row.riskEvent,
          row.consequence,
          this.controlSummary(row),
        ].some((value) => value.toLowerCase().includes(query)),
      );
    }

    if (level) {
      data = data.filter((row) => this.riskLevel(this.inherentRisk(row)) === level);
    }

    const field = this.sortField();
    if (!field) return data;

    return [...data].sort((a, b) => {
      let cmp = 0;
      if (field === "asset") cmp = a.asset.localeCompare(b.asset);
      else if (field === "threat") cmp = a.threat.localeCompare(b.threat);
      else if (field === "probability") cmp = a.probability - b.probability;
      else if (field === "impact") cmp = a.impact - b.impact;
      else if (field === "inherent") cmp = this.inherentRisk(a) - this.inherentRisk(b);
      else if (field === "residual") cmp = this.residualScore(a) - this.residualScore(b);
      return this.sortDir() === "asc" ? cmp : -cmp;
    });
  });

  protected readonly heatmapData = computed(() => {
    const cells: { prob: number; imp: number; count: number; level: RiskLevel }[] = [];
    const counts: Record<string, number> = {};
    for (const row of this.rows()) {
      const key = `${row.probability}-${row.impact}`;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    for (const prob of this.heatmapValues) {
      for (const imp of this.scaleValues) {
        const score = prob * imp;
        cells.push({
          prob,
          imp,
          count: counts[`${prob}-${imp}`] ?? 0,
          level: this.riskLevel(score),
        });
      }
    }
    return cells;
  });

  constructor() {
    this.loadAssets();
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
        next: (entries) => this.rows.set(entries.map((entry) => this.fromDto(entry))),
        error: () => this.toast.showError("Error", "No se pudo cargar la matriz de riesgos"),
      });
  }

  protected loadAssets(): void {
    this.loadingAssets.set(true);
    this.assetService
      .list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingAssets.set(false)),
      )
      .subscribe({
        next: (assets) => this.assets.set(assets),
        error: () => this.toast.showError("Error", "No se pudieron cargar los activos"),
      });
  }

  protected saveRows(): void {
    const invalid = this.rows().some(
      (row) => !row.asset.trim() || !row.threat.trim() || !row.riskEvent.trim(),
    );
    if (invalid) {
      this.toast.showWarning("Validacion", "Completa activo, amenaza y evento de riesgo antes de guardar");
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
          this.toast.showSuccess("Matriz guardada", "La matriz de riesgos fue actualizada");
        },
        error: () => this.toast.showError("Error", "No se pudo guardar la matriz de riesgos"),
      });
  }

  protected onWizardCompleted(entry: RiskMatrixEntryPayload): void {
    this.saving.set(true);
    this.service
      .create(entry)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (created) => {
          this.rows.update((rows) => [...rows, this.fromDto(created)]);
          this.showWizard.set(false);
          this.toast.showSuccess("Riesgo registrado", "El riesgo fue creado correctamente");
        },
        error: () => this.toast.showError("Error", "No se pudo crear el riesgo"),
      });
  }

  protected addRow(): void {
    this.rows.update((rows) => [
      ...rows,
      {
        id: -Date.now(),
        asset: "",
        threat: "",
        vulnerability: "",
        riskEvent: "",
        consequence: "",
        probability: 1,
        impact: 1,
        treatment: "Aceptar",
        residualProbability: 1,
        residualImpact: 1,
        controls: [],
      },
    ]);
    this.activeTab.set("risks");
  }

  protected openAssetDialog(): void {
    this.currentAsset = this.emptyAsset();
    this.showAssetDialog.set(true);
  }

  protected saveAsset(): void {
    if (!this.currentAsset.name.trim() || !this.currentAsset.category.trim()) {
      this.toast.showWarning("Validacion", "Nombre y categoria son obligatorios");
      return;
    }

    this.savingAsset.set(true);
    this.assetService
      .create(this.currentAsset)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.savingAsset.set(false)),
      )
      .subscribe({
        next: () => {
          this.showAssetDialog.set(false);
          this.loadAssets();
          this.toast.showSuccess("Activo creado", "El activo fue registrado");
        },
        error: () => this.toast.showError("Error", "No se pudo guardar el activo"),
      });
  }

  protected selectAsset(row: RiskRow, assetId: string): void {
    const id = Number(assetId);
    const asset = this.assets().find((item) => item.id === id);
    row.informationAssetId = asset?.id;
    row.asset = asset?.name ?? row.asset;
    if (asset) row.impact = Math.max(asset.confidentiality, asset.integrity, asset.availability);
    this.syncTreatment(row);
    this.touchRows();
  }

  protected addControl(row: RiskRow): void {
    row.controls.push({
      description: "",
      control_type: "P",
      automation_level: "A",
      frequency: "PT",
    });
    this.touchRows();
  }

  protected removeControl(row: RiskRow, index: number): void {
    row.controls.splice(index, 1);
    this.touchRows();
  }

  protected confirmRemoveRow(row: RiskRow): void {
    this.confirmService.confirm({
      message: "Seguro que deseas eliminar este riesgo?",
      header: "Confirmar eliminacion",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        if (row.id > 0) {
          this.service.delete(row.id).subscribe({
            next: () => {
              this.rows.update((rows) => rows.filter((item) => item.id !== row.id));
              this.toast.showSuccess("Eliminado", "Riesgo eliminado");
            },
            error: () => this.toast.showError("Error", "No se pudo eliminar el riesgo"),
          });
        } else {
          this.rows.update((rows) => rows.filter((item) => item.id !== row.id));
        }
      },
    });
  }

  protected sortBy(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDir.update((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      this.sortField.set(field);
      this.sortDir.set("asc");
    }
  }

  protected sortIndicator(field: SortField): string {
    if (this.sortField() !== field) return "";
    return this.sortDir() === "asc" ? " ▲" : " ▼";
  }

  protected syncTreatment(row: RiskRow): void {
    const treatments = this.treatmentsFor(row);
    row.treatment = treatments.includes(row.treatment) ? row.treatment : (treatments[0] ?? "");
    this.touchRows();
  }

  protected touchRows(): void {
    this.rows.update((rows) => [...rows]);
  }

  protected threatOrVulnerability(row: RiskRow): string {
    return row.threat || row.vulnerability;
  }

  protected updateThreatOrVulnerability(row: RiskRow, value: string): void {
    row.threat = value;
    row.vulnerability = "";
    this.touchRows();
  }

  protected inherentRisk(row: RiskRow): number {
    return this.normalizedScore(row.probability, row.impact);
  }

  protected residualScore(row: RiskRow): number {
    return this.normalizedScore(row.residualProbability, row.residualImpact);
  }

  protected riskReduction(row: RiskRow): number {
    return Math.max(this.inherentRisk(row) - this.residualScore(row), 0);
  }

  protected riskLevel(score: number): RiskLevel {
    if (score >= 1 && score <= 4) return "Bajo";
    if (score >= 5 && score <= 9) return "Moderado";
    if (score >= 10 && score <= 19) return "Alto";
    if (score >= 20) return "Extremo";
    return "Verifique valores";
  }

  protected riskClass(score: number): string {
    return this.riskLevel(score).toLowerCase().replace(/\s+/g, "-");
  }

  protected treatmentsFor(row: RiskRow): string[] {
    return TREATMENTS_BY_LEVEL[this.riskLevel(this.inherentRisk(row))];
  }

  protected controlSummary(row: RiskRow): string {
    if (!row.controls.length) return "Sin controles";
    return row.controls.map((control) => control.description || "Control pendiente").join(" | ");
  }

  protected assetCriticality(asset: InformationAsset): number {
    return Math.max(asset.confidentiality, asset.integrity, asset.availability);
  }

  protected exportMatrix(format: string): void {
    const rows = this.rows();
    if (!rows.length) {
      this.toast.showWarning("Validacion", "No hay datos para exportar");
      return;
    }
    if (format === "pdf") this.exportAsPdf(rows);
    else if (format === "xlsx") this.exportAsCsv(rows);
    else if (format === "txt") this.exportAsTxt(rows);
    else if (format === "png") this.exportAsImage(rows);
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour("admin-matriz-riesgos");
  }

  private fromDto(entry: RiskMatrixEntryDto): RiskRow {
    return {
      id: entry.id,
      informationAssetId: entry.information_asset_id,
      asset: entry.asset,
      threat: entry.threat,
      vulnerability: entry.vulnerability ?? "",
      riskEvent: entry.risk_event ?? "",
      consequence: entry.consequence,
      probability: entry.probability,
      impact: entry.impact,
      treatment: entry.treatment,
      residualProbability: entry.residual_probability,
      residualImpact: entry.residual_impact,
      controls: (entry.controls ?? []).map((control) => ({
        id: control.id,
        description: control.description,
        control_type: control.control_type,
        automation_level: control.automation_level,
        frequency: control.frequency,
      })),
    };
  }

  private toPayload(row: RiskRow): RiskMatrixEntryPayload {
    return {
      information_asset_id: row.informationAssetId,
      asset: row.asset,
      threat: row.threat,
      vulnerability: row.vulnerability,
      risk_event: row.riskEvent,
      consequence: row.consequence,
      probability: Number(row.probability),
      impact: Number(row.impact),
      treatment: row.treatment,
      residual_probability: Number(row.residualProbability),
      residual_impact: Number(row.residualImpact),
      controls: row.controls.map((control) => ({
        description: control.description,
        control_type: control.control_type,
        automation_level: control.automation_level,
        frequency: control.frequency,
      })),
    };
  }

  private normalizedScore(probability: number, impact: number): number {
    return Number(probability || 0) * Number(impact || 0);
  }

  private emptyAsset(): InformationAssetPayload {
    return {
      name: "",
      description: "",
      category: "Manual",
      confidentiality: 1,
      integrity: 1,
      availability: 1,
    };
  }

  private exportAsPdf(rows: RiskRow[]): void {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      this.toast.showError("Error", "No se pudo abrir la ventana de impresion");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(this.exportHtml(rows));
    printWindow.document.close();
  }

  private exportAsCsv(rows: RiskRow[]): void {
    const headers = [
      "No.",
      "Activo",
      "Amenaza",
      "Vulnerabilidad",
      "Evento de riesgo",
      "Consecuencia",
      "Probabilidad",
      "Impacto",
      "Riesgo inherente",
      "Nivel inherente",
      "Tratamiento",
      "Controles",
      "Probabilidad residual",
      "Impacto residual",
      "Riesgo residual",
      "Nivel residual",
    ];
    const lines = rows.map((row, index) =>
      [
        index + 1,
        row.asset,
        row.threat,
        row.vulnerability,
        row.riskEvent,
        row.consequence,
        row.probability,
        row.impact,
        this.inherentRisk(row),
        this.riskLevel(this.inherentRisk(row)),
        row.treatment,
        this.controlSummary(row),
        row.residualProbability,
        row.residualImpact,
        this.residualScore(row),
        this.riskLevel(this.residualScore(row)),
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(";"),
    );
    this.downloadBlob([headers.join(";"), ...lines].join("\n"), "text/csv;charset=utf-8", "csv");
  }

  private exportAsTxt(rows: RiskRow[]): void {
    const text = rows
      .map((row, index) => {
        const inherent = this.inherentRisk(row);
        const residual = this.residualScore(row);
        return [
          `${index + 1}. ACTIVO: ${row.asset}`,
          `AMENAZA: ${row.threat}`,
          `VULNERABILIDAD: ${row.vulnerability || "N/A"}`,
          `EVENTO: ${row.riskEvent}`,
          `CONSECUENCIA: ${row.consequence || "N/A"}`,
          `INHERENTE: P${row.probability} x I${row.impact} = ${inherent} (${this.riskLevel(inherent)})`,
          `CONTROLES: ${this.controlSummary(row)}`,
          `RESIDUAL: P${row.residualProbability} x I${row.residualImpact} = ${residual} (${this.riskLevel(residual)})`,
        ].join("\n");
      })
      .join("\n\n");
    this.downloadBlob(text, "text/plain;charset=utf-8", "txt");
  }

  private exportAsImage(rows: RiskRow[]): void {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 1400;
    canvas.height = 160 + rows.length * 54;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#111827";
    ctx.font = "bold 26px Arial";
    ctx.fillText("Matriz de Analisis de Riesgos - ZooConnect", 32, 48);
    ctx.font = "13px Arial";
    ctx.fillText(`Generado el ${new Date().toLocaleDateString()} | Total: ${rows.length}`, 32, 74);

    const headers = ["No.", "Activo", "Amenaza", "Evento", "Inherente", "Controles", "Residual"];
    const widths = [50, 210, 210, 290, 120, 320, 120];
    let x = 32;
    let y = 110;
    ctx.fillStyle = "#1f2937";
    ctx.fillRect(32, y - 28, 1320, 38);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    headers.forEach((header, i) => {
      ctx.fillText(header, x + 8, y - 5);
      x += widths[i];
    });

    ctx.font = "12px Arial";
    rows.forEach((row, index) => {
      y += 54;
      x = 32;
      ctx.fillStyle = index % 2 === 0 ? "#f8fafc" : "#ffffff";
      ctx.fillRect(32, y - 32, 1320, 46);
      ctx.fillStyle = "#111827";
      const values = [
        index + 1,
        row.asset,
        row.threat,
        row.riskEvent,
        `${this.inherentRisk(row)} ${this.riskLevel(this.inherentRisk(row))}`,
        this.controlSummary(row),
        `${this.residualScore(row)} ${this.riskLevel(this.residualScore(row))}`,
      ];
      values.forEach((value, i) => {
        ctx.fillText(this.truncate(String(value), i === 5 ? 42 : 28), x + 8, y - 5);
        x += widths[i];
      });
    });

    const link = document.createElement("a");
    link.download = `Matriz_Riesgos_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  private exportHtml(rows: RiskRow[]): string {
    const body = rows
      .map((row, index) => {
        const inherent = this.inherentRisk(row);
        const residual = this.residualScore(row);
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${this.escapeHtml(row.asset)}</td>
            <td>${this.escapeHtml(row.threat)}</td>
            <td>${this.escapeHtml(row.vulnerability)}</td>
            <td>${this.escapeHtml(row.riskEvent)}</td>
            <td>${this.escapeHtml(row.consequence)}</td>
            <td>${row.probability}</td>
            <td>${row.impact}</td>
            <td>${inherent} (${this.riskLevel(inherent)})</td>
            <td>${this.escapeHtml(this.controlSummary(row))}</td>
            <td>${row.residualProbability}</td>
            <td>${row.residualImpact}</td>
            <td>${residual} (${this.riskLevel(residual)})</td>
          </tr>
        `;
      })
      .join("");

    return `
      <!doctype html>
      <html>
      <head>
        <title>Matriz de Riesgos</title>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; margin: 24px; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          p { margin: 0 0 16px; color: #64748b; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th, td { border: 1px solid #cbd5e1; padding: 6px; vertical-align: top; }
          th { background: #1f2937; color: #fff; }
        </style>
      </head>
      <body>
        <h1>Matriz de Analisis de Riesgos</h1>
        <p>ZooConnect | ${new Date().toLocaleDateString()} | ${rows.length} riesgos</p>
        <table>
          <thead>
            <tr>
              <th>No.</th><th>Activo</th><th>Amenaza</th><th>Vulnerabilidad</th>
              <th>Evento</th><th>Consecuencia</th><th>P</th><th>I</th>
              <th>Inherente</th><th>Controles</th><th>PR</th><th>IR</th><th>Residual</th>
            </tr>
          </thead>
          <tbody>${body}</tbody>
        </table>
        <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
      </body>
      </html>
    `;
  }

  private downloadBlob(content: string, type: string, extension: string): void {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.download = `Matriz_Riesgos_${new Date().toISOString().slice(0, 10)}.${extension}`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private truncate(value: string, max: number): string {
    return value.length > max ? `${value.slice(0, max - 3)}...` : value;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}
