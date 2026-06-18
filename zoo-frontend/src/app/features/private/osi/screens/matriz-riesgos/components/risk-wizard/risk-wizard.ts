import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, Output, inject, signal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { StepperModule } from "primeng/stepper";
import { ButtonModule } from "primeng/button";
import { SelectModule } from "primeng/select";
import { InputTextModule } from "primeng/inputtext";
import { TextareaModule } from "primeng/textarea";
import { SliderModule } from "primeng/slider";
import { ListboxModule } from "primeng/listbox";
import { finalize } from "rxjs";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { Auditoria } from "@models/auditoria/auditoria.model";
import { AuditoriaService } from "../../../../../admin/services/auditoria";
import { InformationAsset, InformationAssetService } from "../../../../services/information-asset.service";
import { RiskMatrixEntryPayload } from "../../matriz-riesgos.service";

@Component({
  selector: "zoo-risk-wizard",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StepperModule,
    ButtonModule,
    SelectModule,
    InputTextModule,
    TextareaModule,
    SliderModule,
    ListboxModule,
  ],
  templateUrl: "./risk-wizard.html",
  styleUrl: "./risk-wizard.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RiskWizard {
  private readonly assetService = inject(InformationAssetService);
  private readonly auditService = inject(AuditoriaService);
  private readonly destroyRef = inject(DestroyRef);

  @Output() completed = new EventEmitter<RiskMatrixEntryPayload>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly assets = signal<InformationAsset[]>([]);
  protected readonly incidents = signal<Auditoria[]>([]);
  protected readonly loadingAssets = signal(false);
  protected readonly loadingIncidents = signal(false);

  protected activeStep = signal(1);
  protected selectedAssetId = signal<number | null>(null);
  protected threat = signal("");
  protected vulnerability = signal("");
  protected riskEvent = signal("");
  protected consequence = signal("");
  protected probability = signal(1);
  protected impact = signal(1);
  protected treatment = signal("Aceptar");
  protected control = signal("");
  protected controlType = signal("P");
  protected automationLevel = signal("A");
  protected frequency = signal("PT");
  protected residualProbability = signal(1);
  protected residualImpact = signal(1);

  protected readonly controlTypes = [
    { label: "P - Preventivo", value: "P" },
    { label: "D - Detectivo", value: "D" },
    { label: "C - Correctivo", value: "C" },
    { label: "Di - Disuasivo", value: "Di" },
  ];

  protected readonly automationLevels = [
    { label: "A - Automatico", value: "A" },
    { label: "S - Semiautomatico", value: "S" },
    { label: "M - Manual", value: "M" },
  ];

  protected readonly frequencies = [
    { label: "PT - Por evento/transaccion", value: "PT" },
    { label: "D - Diario", value: "D" },
    { label: "S - Semanal", value: "S" },
    { label: "M - Mensual", value: "M" },
    { label: "A - Anual", value: "A" },
    { label: "m - Masivo", value: "m" },
    { label: "s - Semestral", value: "s" },
  ];

  constructor() {
    this.loadAssets();
  }

  private loadAssets(): void {
    this.loadingAssets.set(true);
    this.assetService
      .list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingAssets.set(false)),
      )
      .subscribe((data) => this.assets.set(data));
  }

  protected onAssetSelect(assetId: number): void {
    this.selectedAssetId.set(assetId);
    const asset = this.assets().find((item) => item.id === assetId);
    if (!asset) return;

    this.impact.set(Math.max(asset.confidentiality, asset.integrity, asset.availability));
    this.residualImpact.set(Math.max(1, Math.max(asset.confidentiality, asset.integrity, asset.availability) - 1));
    this.loadIncidents(asset.name);
  }

  private loadIncidents(assetName: string): void {
    this.loadingIncidents.set(true);
    this.auditService
      .getAuditLogs(1, 10, "security", { search: assetName })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingIncidents.set(false)),
      )
      .subscribe((res) => {
        this.incidents.set(res.items);
        if (res.items.length > 0) {
          this.threat.set(`Posible ${res.items[0].event} detectado en auditoria`);
          this.riskEvent.set(`Evento observado en auditoria: ${res.items[0].action || res.items[0].event}`);
          this.probability.set(Math.min(5, res.items.length));
          this.residualProbability.set(Math.max(1, Math.min(5, res.items.length) - 1));
        }
      });
  }

  protected get riskScore(): number {
    return this.probability() * this.impact();
  }

  protected get riskLevel(): string {
    return this.levelFor(this.riskScore);
  }

  protected get residualScore(): number {
    return this.residualProbability() * this.residualImpact();
  }

  protected get residualLevel(): string {
    return this.levelFor(this.residualScore);
  }

  protected finish(): void {
    const asset = this.assets().find((item) => item.id === this.selectedAssetId());
    const controls = this.control().trim()
      ? [
          {
            description: this.control().trim(),
            control_type: this.controlType(),
            automation_level: this.automationLevel(),
            frequency: this.frequency(),
          },
        ]
      : [];

    const payload: RiskMatrixEntryPayload = {
      information_asset_id: this.selectedAssetId() ?? undefined,
      asset: asset?.name || "",
      threat: this.threat(),
      vulnerability: this.vulnerability(),
      risk_event: this.riskEvent(),
      consequence: this.consequence(),
      probability: this.probability(),
      impact: this.impact(),
      treatment: this.treatment(),
      residual_probability: this.residualProbability(),
      residual_impact: this.residualImpact(),
      controls,
    };
    this.completed.emit(payload);
  }

  private levelFor(score: number): string {
    if (score >= 20) return "Extremo";
    if (score >= 10) return "Alto";
    if (score >= 5) return "Moderado";
    return "Bajo";
  }
}
