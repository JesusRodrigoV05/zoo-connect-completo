import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import { JsonPipe } from "@angular/common";
import { DialogModule } from "primeng/dialog";
import { ButtonModule } from "primeng/button";
import { TagModule } from "primeng/tag";
import { Auditoria as AuditoriaModel } from "@models/auditoria";

@Component({
  selector: "zoo-audit-ip-details",
  standalone: true,
  imports: [DialogModule, ButtonModule, TagModule, JsonPipe],
  template: `
    <p-dialog
      header="Detalle de IP"
      [modal]="true"
      [visible]="visible()"
      (visibleChange)="visible.set($event)"
      [style]="{ width: 'min(720px, 94vw)' }"
      styleClass="audit-ip-dialog"
    >
      @if (auditLog(); as log) {
        <section class="ip-summary">
          <div>
            <span class="label">IP</span>
            <strong>{{ log.ip_address || "No registrada" }}</strong>
          </div>
          <div>
            <span class="label">Pais</span>
            <strong>{{ log.ip_country || "No disponible" }}</strong>
          </div>
          <div>
            <span class="label">ASN</span>
            <strong>{{ log.ip_asn || "No disponible" }}</strong>
          </div>
          <div>
            <span class="label">Organizacion</span>
            <strong>{{ log.ip_organization || "No disponible" }}</strong>
          </div>
        </section>

        @if (location(); as locationData) {
          <section class="detail-section">
            <h3>Ubicacion</h3>
            <dl>
              <div><dt>Ciudad</dt><dd>{{ locationData.city || "No disponible" }}</dd></div>
              <div><dt>Zona horaria</dt><dd>{{ locationData.timezone || "No disponible" }}</dd></div>
              <div><dt>Latitud</dt><dd>{{ locationData.latitude ?? "No disponible" }}</dd></div>
              <div><dt>Longitud</dt><dd>{{ locationData.longitude ?? "No disponible" }}</dd></div>
            </dl>
          </section>
        }

        @if (network(); as networkData) {
          <section class="detail-section">
            <h3>Red</h3>
            <dl>
              <div><dt>CIDR</dt><dd>{{ networkData.cidr || "No disponible" }}</dd></div>
              <div><dt>Host inicial</dt><dd>{{ networkData.hosts?.start || "No disponible" }}</dd></div>
              <div><dt>Host final</dt><dd>{{ networkData.hosts?.end || "No disponible" }}</dd></div>
              <div><dt>RIR</dt><dd>{{ networkData.autonomous_system?.rir || "No disponible" }}</dd></div>
              <div><dt>AS name</dt><dd>{{ networkData.autonomous_system?.name || "No disponible" }}</dd></div>
              <div><dt>Pais AS</dt><dd>{{ networkData.autonomous_system?.country || "No disponible" }}</dd></div>
            </dl>
          </section>
        }

        @if (log.ip_guide_data?.lookup_error) {
          <p-tag severity="warn" [value]="'ip.guide: ' + log.ip_guide_data?.lookup_error"></p-tag>
        }

        <section class="detail-section">
          <h3>Respuesta completa de ip.guide</h3>
          <pre>{{ (log.ip_guide_data || emptyIpGuideData) | json }}</pre>
        </section>
      }

      <ng-template pTemplate="footer">
        <p-button label="Cerrar" icon="pi pi-times" severity="secondary" (onClick)="visible.set(false)" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .ip-summary {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .ip-summary > div,
    .detail-section {
      border: 1px solid var(--p-surface-border);
      border-radius: var(--p-border-radius);
      background: var(--p-surface-card);
      padding: 0.875rem;
    }

    .label {
      display: block;
      color: var(--p-text-muted-color);
      font-size: 0.75rem;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
    }

    .detail-section {
      margin-top: 1rem;
    }

    h3 {
      margin: 0 0 0.75rem;
      font-size: 1rem;
    }

    dl {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem 1rem;
      margin: 0;
    }

    dt {
      color: var(--p-text-muted-color);
      font-size: 0.75rem;
    }

    dd {
      margin: 0.2rem 0 0;
      overflow-wrap: anywhere;
    }

    pre {
      max-height: 260px;
      overflow: auto;
      margin: 0;
      padding: 0.75rem;
      border-radius: var(--p-border-radius);
      background: var(--p-surface-ground);
      font-size: 0.8125rem;
      white-space: pre-wrap;
    }

    @media (max-width: 640px) {
      .ip-summary,
      dl {
        grid-template-columns: 1fr;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditIpDetails {
  readonly visible = model(false);
  readonly auditLog = input<AuditoriaModel | null>(null);
  readonly emptyIpGuideData = {};

  protected readonly location = computed(() => this.auditLog()?.ip_guide_data?.location ?? null);
  protected readonly network = computed(() => this.auditLog()?.ip_guide_data?.network ?? null);
}
