import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env';
import { JSEncrypt } from 'jsencrypt';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private http = inject(HttpClient);
  private publicKey: string | null = null;
  private readonly apiUrl = environment.apiUrl;

  /**
   * Obtiene la llave pública del día desde el servidor.
   * La cachea en memoria para la sesión actual.
   */
  async getPublicKey(): Promise<string> {
    if (this.publicKey) return this.publicKey;

    try {
      const response = await firstValueFrom(
        this.http.get<{ public_key: string }>(`${this.apiUrl}/auth/public-key`)
      );
      this.publicKey = response.public_key;
      return this.publicKey;
    } catch (error) {
      console.error('Error obteniendo la llave RSA:', error);
      throw new Error('No se pudo establecer una conexión segura con el servidor.');
    }
  }

  /**
   * Cifra un texto (como una contraseña) usando RSA.
   */
  async encrypt(text: string): Promise<string> {
    const key = await this.getPublicKey();
    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(key);
    
    const encrypted = encryptor.encrypt(text);
    if (!encrypted) {
      throw new Error('Error al cifrar los datos.');
    }
    
    return encrypted;
  }
}
