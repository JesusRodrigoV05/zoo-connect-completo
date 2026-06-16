import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, Output, signal } from "@angular/core";
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
import { InformationAsset, InformationAssetService } from "../../../../services/information-asset.service";
import { AuditoriaService } from "../../../../../admin/services/auditoria";
import { Auditoria } from "@models/auditoria/auditoria.model";
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

  // Wizard State
  protected activeStep = signal(1);
  protected selectedAssetId = signal<number | null>(null);
  protected threat = signal("");
  protected consequence = signal("");
  protected probability = signal(1);
  protected impact = signal(1);
  protected treatment = signal("Aceptar");
  protected control = signal("");
  protected controlType = signal("P");
  protected automationLevel = signal("M");
  protected frequency = signal("M");

  protected readonly controlTypes = [
    { label: "P - Preventivo", value: "P" },
    { label: "D - Detectivo", value: "D" },
    { label: "C - Correctivo", value: "C" },
    { label: "Di - Disuasivo", value: "Di" },
  ];

  constructor() {
    this.loadAssets();
  }

  private loadAssets(): void {
    this.loadingAssets.set(true);
    this.assetService.list()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingAssets.set(false))
      )
      .subscribe(data => this.assets.set(data));
  }

  protected onAssetSelect(assetId: number): void {
    this.selectedAssetId.set(assetId);
    const asset = this.assets().find(a => a.id === assetId);
    if (asset) {
      // Pre-populate impact based on max CID
      this.impact.set(Math.max(asset.confidentiality, asset.integrity, asset.availability));
      this.loadIncidents(asset.name);
    }
  }

  private loadIncidents(assetName: string): void {
    this.loadingIncidents.set(true);
    this.auditService.getAuditLogs(1, 10, "security", { search: assetName })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingIncidents.set(false))
      )
      .subscribe(res => {
        this.incidents.set(res.items);
        if (res.items.length > 0) {
          this.threat.set(`Posible ${res.items[0].event} detectado en auditoría`);
          // Suggest higher probability if incidents found
          this.probability.set(Math.min(5, res.items.length));
        }
      });
  }

  protected get riskScore(): number {
    return this.probability() * this.impact();
  }

  protected get riskLevel(): string {
    const score = this.riskScore;
    if (score >= 20) return "Extremo";
    if (score >= 10) return "Alto";
    if (score >= 5) return "Moderado";
    return "Bajo";
  }

  protected finish(): void {
    const asset = this.assets().find(a => a.id === this.selectedAssetId());
    const payload: RiskMatrixEntryPayload = {
      information_asset_id: this.selectedAssetId()!,
      asset: asset?.name || "",
      threat: this.threat(),
      consequence: this.consequence(),
      probability: this.probability(),
      impact: this.impact(),
      treatment: this.treatment(),
      control: this.control(),
      control_type: this.controlType(),
      automation_level: this.automationLevel(),
      frequency: this.frequency(),
      residual_probability: Math.max(1, this.probability() - 1), // Simple automation suggestion
      residual_impact: this.impact(),
    };
    this.completed.emit(payload);
  }
}
