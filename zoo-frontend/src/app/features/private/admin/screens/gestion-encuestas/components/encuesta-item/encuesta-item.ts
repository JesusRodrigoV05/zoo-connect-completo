import { DatePipe } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { Encuesta } from "@models/encuestas/encuesta.model";
import { CardModule } from "primeng/card";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";
import { ActivatedRoute } from "@angular/router";
import { QrDownloadButton } from "@app/shared/components/qr-download-button";

@Component({
  selector: "zoo-encuesta-item",
  imports: [
    DatePipe,
    CardModule,
    ButtonModule,
    TooltipModule,
    QrDownloadButton,
  ],
  templateUrl: "./encuesta-item.html",
  styleUrl: "./encuesta-item.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EncuestaItem {
  readonly encuesta = input.required<Encuesta>();

  readonly onEdit = output<Encuesta>();
  readonly onView = output<Encuesta>();
  readonly onDelete = output<number>();

  readonly urlQR = computed(() => {
    const id = this.encuesta().idEncuesta;
    return `${window.location.origin}/encuestas/${id}`;
  });

  readonly fechaTexto = computed(() => {
    const enc = this.encuesta();
    return enc ? `${enc.fechaInicio} - ${enc.fechaFin}` : "";
  });
}
