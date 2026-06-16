import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ConfirmDialog } from "primeng/confirmdialog";
import { ConfirmationService } from "primeng/api";
import { MainContainer } from "@app/shared/components/main-container";
import { OnboardingService } from "@app/shared/services/onboarding.service";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { ShowToast } from "@app/shared/services";
import { RiskWizard } from "./components/risk-wizard/risk-wizard";
import { DialogModule } from "primeng/dialog";
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
  informationAssetId?: number;
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
  imports: [
    CommonModule, 
    FormsModule, 
    ButtonModule, 
    TooltipModule, 
    ConfirmDialog, 
    MainContainer,
    RiskWizard,
    DialogModule
  ],
  templateUrl: "./matriz-riesgos.html",
  styleUrl: "./matriz-riesgos.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MatrizRiesgos {
  private readonly service = inject(RiskMatrixService);
  private readonly toast = inject(ShowToast);
  private readonly confirmService = inject(ConfirmationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly onboarding = inject(OnboardingService);

  protected readonly controlTypes = CONTROL_TYPES;
  protected readonly automationLevels = AUTOMATION_LEVELS;
  protected readonly frequencies = FREQUENCIES;
  protected readonly scaleValues = [5, 4, 3, 2, 1];
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly showWizard = signal(false);
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

  protected onWizardCompleted(payload: RiskMatrixEntryPayload): void {
    this.showWizard.set(false);
    this.saving.set(true);
    this.service
      .create(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false))
      )
      .subscribe({
        next: (entry) => {
          this.rows.update((rows) => [...rows, this.fromDto(entry)]);
          this.toast.showSuccess("Éxito", "Riesgo analizado y agregado a la matriz");
        },
        error: () => this.toast.showError("Error", "No se pudo guardar el análisis de riesgo"),
      });
  }

  protected exportMatrix(format: string): void {
    const data = this.rows();
    if (!data.length) {
      this.toast.showWarning("Validación", "No hay datos en la matriz para exportar");
      return;
    }

    if (format === "pdf") {
      this.exportAsPdf(data);
    } else if (format === "xlsx") {
      this.exportAsExcel(data);
    } else if (format === "txt") {
      this.exportAsTxt(data);
    } else if (format === "png") {
      this.exportAsImage(data);
    }
  }

  protected startGuidedTour(): void {
    this.onboarding.startTour("admin-matriz-riesgos");
  }

  private exportAsPdf(rows: RiskRow[]): void {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      this.toast.showError("Error", "No se pudo abrir la ventana de impresión. Habilita las ventanas emergentes.");
      return;
    }

    const summary = this.riskSummary();

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Matriz de Riesgos - ZooConnect</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 30px; color: #1e293b; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px; }
          h1 { margin: 0; font-size: 24px; color: #1e293b; }
          .meta { font-size: 13px; color: #64748b; margin-top: 5px; }
          .summary-badges { display: flex; gap: 10px; }
          .badge { padding: 6px 12px; border-radius: 4px; font-weight: bold; font-size: 12px; }
          .bajo { background-color: #dcfce7; color: #166534; }
          .moderado { background-color: #fef9c3; color: #854d0e; }
          .alto { background-color: #ffedd5; color: #9a3412; }
          .extremo { background-color: #fee2e2; color: #991b1b; }
          
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10px; }
          th { background-color: #1e293b; color: white; padding: 8px; text-align: left; font-weight: bold; }
          td { border-bottom: 1px solid #e2e8f0; padding: 8px; vertical-align: top; max-width: 150px; word-wrap: break-word; }
          tr:nth-child(even) { background-color: #f8fafc; }
          
          .center { text-align: center; }
          .risk-cell { padding: 4px 8px; border-radius: 3px; font-weight: bold; display: inline-block; }
          
          @media print {
            body { margin: 15px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Matriz de Análisis de Riesgos</h1>
            <div class="meta">ZooConnect | Generado el ${new Date().toLocaleDateString()} | Total: ${rows.length} riesgos</div>
          </div>
          <div class="summary-badges">
            <span class="badge bajo">Bajo: ${summary["Bajo"]}</span>
            <span class="badge moderado">Moderado: ${summary["Moderado"]}</span>
            <span class="badge alto">Alto: ${summary["Alto"]}</span>
            <span class="badge extremo">Extremo: ${summary["Extremo"]}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">N°</th>
              <th>Activo de Información</th>
              <th>Amenaza</th>
              <th>Consecuencia</th>
              <th style="width: 30px;" class="center">P.I.</th>
              <th style="width: 30px;" class="center">I.I.</th>
              <th style="width: 80px;" class="center">R. Inherente</th>
              <th>Controles a implementar</th>
              <th style="width: 40px;" class="center">Tipo</th>
              <th style="width: 50px;" class="center">Nivel</th>
              <th style="width: 60px;" class="center">Frecuencia</th>
              <th style="width: 30px;" class="center">P.R.</th>
              <th style="width: 30px;" class="center">I.R.</th>
              <th style="width: 80px;" class="center">R. Residual</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((row, idx) => {
              const inherentScore = this.inherentRisk(row);
              const inherentLvl = this.riskLevel(inherentScore);
              const residualScore = this.residualScore(row);
              const residualLvl = this.riskLevel(residualScore);
              
              return `
                <tr>
                  <td class="center">${idx + 1}</td>
                  <td>${row.asset}</td>
                  <td>${row.threat}</td>
                  <td>${row.consequence || ""}</td>
                  <td class="center">${row.probability}</td>
                  <td class="center">${row.impact}</td>
                  <td class="center">
                    <span class="risk-cell ${inherentLvl.toLowerCase()}">${inherentScore} (${inherentLvl})</span>
                  </td>
                  <td>${row.control || ""}</td>
                  <td class="center">${row.type}</td>
                  <td class="center">${row.automationLevel}</td>
                  <td class="center">${row.frequency}</td>
                  <td class="center">${row.residualProbability}</td>
                  <td class="center">${row.residualImpact}</td>
                  <td class="center">
                    <span class="risk-cell ${residualLvl.toLowerCase()}">${residualScore} (${residualLvl})</span>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>

        <div style="text-align: center; margin-top: 30px; font-size: 10px; color: #94a3b8;" class="meta">
          ZooConnect - Confidencial. Generado automáticamente para impresión.
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  }

  private exportAsExcel(rows: RiskRow[]): void {
    let csv = "\uFEFF"; // UTF-8 BOM
    
    const headers = [
      "No.",
      "Activo de Informacion",
      "Amenaza / Vulnerabilidad",
      "Riesgo y Consecuencia",
      "Probabilidad Inherent",
      "Impacto Inherent",
      "Puntuacion Inherent",
      "Nivel Inherent",
      "Tratamiento",
      "Controles a Implementar",
      "Tipo Control",
      "Nivel Control",
      "Frecuencia Control",
      "Probabilidad Residual",
      "Impacto Residual",
      "Puntuacion Residual",
      "Nivel Residual"
    ];
    
    csv += headers.join(";") + "\n";

    rows.forEach((row, idx) => {
      const line = [
        idx + 1,
        `"${row.asset.replace(/"/g, '""')}"`,
        `"${row.threat.replace(/"/g, '""')}"`,
        `"${(row.consequence || "").replace(/"/g, '""')}"`,
        row.probability,
        row.impact,
        this.inherentRisk(row),
        this.riskLevel(this.inherentRisk(row)),
        `"${row.treatment}"`,
        `"${(row.control || "").replace(/"/g, '""')}"`,
        row.type,
        row.automationLevel,
        row.frequency,
        row.residualProbability,
        row.residualImpact,
        this.residualScore(row),
        this.riskLevel(this.residualScore(row))
      ];
      csv += line.join(";") + "\n";
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.download = `Matriz_Riesgos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  private exportAsTxt(rows: RiskRow[]): void {
    let txt = "================================================================================\n";
    txt += "                     MATRIZ DE ANÁLISIS DE RIESGOS - ZOOCONNECT\n";
    txt += ` Generado el: ${new Date().toLocaleDateString()} | Total de riesgos: ${rows.length}\n`;
    txt += "================================================================================\n\n";

    rows.forEach((row, idx) => {
      txt += `${idx + 1}. ACTIVO: ${row.asset}\n`;
      txt += `   AMENAZA: ${row.threat}\n`;
      txt += `   CONSECUENCIA: ${row.consequence || "N/A"}\n`;
      txt += `   EVALUACIÓN RIESGO INHERENTE:\n`;
      txt += `     - Probabilidad: ${row.probability} | Impacto: ${row.impact}\n`;
      txt += `     - Puntuación: ${this.inherentRisk(row)} | Nivel: ${this.riskLevel(this.inherentRisk(row))}\n`;
      txt += `     - Tratamiento: ${row.treatment}\n`;
      txt += `   MITIGACIÓN:\n`;
      txt += `     - Controles: ${row.control || "Ninguno"}\n`;
      txt += `     - Tipo: ${row.type} | Automatización: ${row.automationLevel} | Frecuencia: ${row.frequency}\n`;
      txt += `   RIESGO RESIDUAL:\n`;
      txt += `     - Probabilidad: ${row.residualProbability} | Impacto: ${row.residualImpact}\n`;
      txt += `     - Puntuación: ${this.residualScore(row)} | Nivel: ${this.riskLevel(this.residualScore(row))}\n`;
      txt += "--------------------------------------------------------------------------------\n\n";
    });

    const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.download = `Matriz_Riesgos_${new Date().toISOString().slice(0, 10)}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  private exportAsImage(rows: RiskRow[]): void {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const padding = 30;
    const headerHeight = 120;
    const rowHeight = 60;
    const tableTop = padding + headerHeight;
    const totalHeight = tableTop + (rows.length + 1) * rowHeight + padding + 40;

    canvas.width = 1200;
    canvas.height = totalHeight;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title border
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + 70);
    ctx.stroke();

    // Title text
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 24px Arial, sans-serif";
    ctx.fillText("Matriz de Análisis de Riesgos - ZooConnect", padding + 15, padding + 25);

    ctx.fillStyle = "#64748b";
    ctx.font = "14px Arial, sans-serif";
    ctx.fillText(`Generado el: ${new Date().toLocaleDateString()} | Total de riesgos registrados: ${rows.length}`, padding + 15, padding + 50);

    // Legend
    const summary = this.riskSummary();
    ctx.font = "bold 12px Arial, sans-serif";
    
    let legendX = 650;
    const drawBadge = (label: string, count: number, bgColor: string, textColor: string) => {
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(legendX, padding + 15, 110, 30, 6);
      ctx.fill();
      
      ctx.fillStyle = textColor;
      ctx.fillText(`${label}: ${count}`, legendX + 15, padding + 34);
      legendX += 120;
    };

    drawBadge("Bajo", summary["Bajo"] || 0, "#dcfce7", "#166534");
    drawBadge("Moderado", summary["Moderado"] || 0, "#fef9c3", "#854d0e");
    drawBadge("Alto", summary["Alto"] || 0, "#ffedd5", "#9a3412");
    drawBadge("Extremo", summary["Extremo"] || 0, "#fee2e2", "#991b1b");

    // Table settings
    const cols = [
      { name: "N°", width: 40, align: "center" as const },
      { name: "Activo", width: 160, align: "left" as const },
      { name: "Amenaza", width: 160, align: "left" as const },
      { name: "Consecuencia", width: 180, align: "left" as const },
      { name: "P.I.", width: 40, align: "center" as const },
      { name: "I.I.", width: 40, align: "center" as const },
      { name: "R. Inherent", width: 100, align: "center" as const },
      { name: "Controles", width: 180, align: "left" as const },
      { name: "P.R.", width: 40, align: "center" as const },
      { name: "I.R.", width: 40, align: "center" as const },
      { name: "R. Residual", width: 100, align: "center" as const },
    ];

    let startX = padding;
    
    // Draw Header Background
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(padding, tableTop, 1140, rowHeight);

    // Draw Headers
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial, sans-serif";
    startX = padding;
    for (const col of cols) {
      const textX = col.align === "center" ? startX + col.width / 2 : startX + 10;
      ctx.textAlign = col.align;
      ctx.fillText(col.name, textX, tableTop + rowHeight / 2 + 5);
      startX += col.width;
    }

    // Draw Rows
    ctx.font = "12px Arial, sans-serif";
    
    let currentY = tableTop + rowHeight;
    rows.forEach((row, idx) => {
      ctx.fillStyle = idx % 2 === 0 ? "#f8fafc" : "#ffffff";
      ctx.fillRect(padding, currentY, 1140, rowHeight);
      
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, currentY + rowHeight);
      ctx.lineTo(padding + 1140, currentY + rowHeight);
      ctx.stroke();

      startX = padding;
      ctx.fillStyle = "#334155";

      cols.forEach((col, colIdx) => {
        ctx.textAlign = col.align;
        const textX = col.align === "center" ? startX + col.width / 2 : startX + 10;
        const textY = currentY + rowHeight / 2 + 4;

        if (colIdx === 0) {
          ctx.fillText((idx + 1).toString(), textX, textY);
        } else if (colIdx === 1) {
          this.drawWrappedText(ctx, row.asset, textX, textY - 8, col.width - 20, 15);
        } else if (colIdx === 2) {
          this.drawWrappedText(ctx, row.threat, textX, textY - 8, col.width - 20, 15);
        } else if (colIdx === 3) {
          this.drawWrappedText(ctx, row.consequence || "", textX, textY - 8, col.width - 20, 15);
        } else if (colIdx === 4) {
          ctx.fillText(row.probability.toString(), textX, textY);
        } else if (colIdx === 5) {
          ctx.fillText(row.impact.toString(), textX, textY);
        } else if (colIdx === 6) {
          const score = this.inherentRisk(row);
          const lvl = this.riskLevel(score);
          const colors = this.getRiskColor(lvl);
          
          ctx.fillStyle = colors.bg;
          ctx.beginPath();
          ctx.roundRect(startX + 5, currentY + 12, col.width - 10, 36, 4);
          ctx.fill();
          
          ctx.fillStyle = colors.text;
          ctx.font = "bold 12px Arial, sans-serif";
          ctx.fillText(`${score} (${lvl})`, textX, textY);
          ctx.font = "12px Arial, sans-serif";
          ctx.fillStyle = "#334155";
        } else if (colIdx === 7) {
          this.drawWrappedText(ctx, row.control || "Sin control", textX, textY - 8, col.width - 20, 15);
        } else if (colIdx === 8) {
          ctx.fillText(row.residualProbability.toString(), textX, textY);
        } else if (colIdx === 9) {
          ctx.fillText(row.residualImpact.toString(), textX, textY);
        } else if (colIdx === 10) {
          const score = this.residualScore(row);
          const lvl = this.riskLevel(score);
          const colors = this.getRiskColor(lvl);
          
          ctx.fillStyle = colors.bg;
          ctx.beginPath();
          ctx.roundRect(startX + 5, currentY + 12, col.width - 10, 36, 4);
          ctx.fill();
          
          ctx.fillStyle = colors.text;
          ctx.font = "bold 12px Arial, sans-serif";
          ctx.fillText(`${score} (${lvl})`, textX, textY);
          ctx.font = "12px Arial, sans-serif";
          ctx.fillStyle = "#334155";
        }

        startX += col.width;
      });

      currentY += rowHeight;
    });

    ctx.textAlign = "center";
    ctx.fillStyle = "#94a3b8";
    ctx.font = "italic 11px Arial, sans-serif";
    ctx.fillText("Generado automáticamente por el Sistema de Gestión de Riesgos de ZooConnect. Confidencial.", canvas.width / 2, totalHeight - 20);

    const link = document.createElement("a");
    link.download = `Matriz_Riesgos_${new Date().toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  private getRiskColor(level: RiskLevel): { bg: string; text: string } {
    switch (level) {
      case "Bajo": return { bg: "#dcfce7", text: "#15803d" };
      case "Moderado": return { bg: "#fef9c3", text: "#a16207" };
      case "Alto": return { bg: "#ffedd5", text: "#c2410c" };
      case "Extremo": return { bg: "#fee2e2", text: "#b91c1c" };
      default: return { bg: "#f1f5f9", text: "#475569" };
    }
  }

  private drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): void {
    const words = text.split(" ");
    let line = "";
    let testY = y;
    let linesCount = 0;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && n > 0) {
        if (linesCount < 2) {
          ctx.fillText(line, x, testY);
          line = words[n] + " ";
          testY += lineHeight;
          linesCount++;
        } else {
          ctx.fillText(line.trim() + "...", x, testY);
          line = "";
          break;
        }
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, testY);
    }
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
      informationAssetId: entry.information_asset_id,
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
      information_asset_id: row.informationAssetId,
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
