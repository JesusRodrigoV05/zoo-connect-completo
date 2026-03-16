import { CreateOpcion, OpcionPregunta, UpdateOpcion } from "@models/encuestas";
import { BackendOpcion } from "./encuesta.adapter";

export interface BackendCreateOpcionRequest {
  texto_opcion: string;
  orden: number;
}

export class OpcionAdapter {
  static fromBackend(backendData: BackendOpcion): OpcionPregunta {
    return {
      idOpcion: backendData.id_opcion,
      textoOpcion: backendData.texto_opcion,
      orden: backendData.orden,
    };
  }

  static toBackendCreate(data: CreateOpcion): BackendCreateOpcionRequest {
    return {
      texto_opcion: data.textoOpcion,
      orden: data.orden,
    };
  }

  static toBackendUpdate(data: UpdateOpcion): BackendCreateOpcionRequest {
    return {
      texto_opcion: data.textoOpcion!,
      orden: data.orden!,
    };
  }
}
