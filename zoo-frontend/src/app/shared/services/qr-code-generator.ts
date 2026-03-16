import { inject, Injectable } from '@angular/core';
import QRCode from 'qrcode';
import { ShowToast } from './show-toast';

interface QRCodeOptions {
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  type: string;
  margin: number;
  width: number;
  color: {
    dark: string;
    light: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class QrCodeGenerator {
  private readonly showToast = inject(ShowToast);

  async generarQr(
    url: string,
    nombreArchivo: string = 'codigo-qr.png'
  ): Promise<void> {
    try {
      const opcionesQR: QRCodeOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        margin: 1,
        width: 300,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      };

      const dataUrl = await QRCode.toDataURL(
        url,
        opcionesQR as QRCode.QRCodeToDataURLOptions
      );

      if (typeof dataUrl !== 'string') {
        throw new Error(
          'Error al generar el código QR: formato de datos inválido'
        );
      }

      const enlace = document.createElement('a');
      enlace.href = dataUrl;
      enlace.download = nombreArchivo;

      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
    } catch (error) {
      this.showToast.showError(
        'Error al generar el código QR',
        error instanceof Error
          ? error.message
          : 'No se pudo generar el código QR solicitado.'
      );
      throw error;
    }
  }
}
