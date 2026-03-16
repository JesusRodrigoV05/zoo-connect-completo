import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from "@angular/core";
import { QrCodeGenerator } from "@app/shared/services/qr-code-generator";
import { ButtonModule } from "primeng/button";
import { TooltipModule } from "primeng/tooltip";

@Component({
  selector: "zoo-qr-download-button",
  imports: [ButtonModule, TooltipModule],
  templateUrl: "./qr-download-button.html",
  styleUrl: "./qr-download-button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QrDownloadButton {
  private qrCodeService = inject(QrCodeGenerator);
  public isLoading = signal(false);

  url = input.required<string>();
  nombreArchivo = input("qr-pagina.png");

  async onDescargarQr(): Promise<void> {
    if (this.isLoading()) return;
    this.isLoading.set(true);

    try {
      await this.qrCodeService.generarQr(
        this.url(),
        this.nombreArchivo() + "-qr.png",
      );
    } catch (err) {
      console.error("Error desde el componente:", err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
