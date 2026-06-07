/** CP32: Verificar que el veterinario puede registrar una consulta clínica. */
import { describe, expect, it } from "vitest";
import { HistorialAdapter } from "../adapters/historiales/historial.adapter";

describe("CP32 — Consulta clínica", () => {
  it("debe mapear el registro de una consulta clínica con constantes vitales", () => {
    const payload = HistorialAdapter.toCreatePayload({
      animalId: 5,
      tipoAtencionId: 2,
      anamnesis: "Decaimiento y falta de apetito",
      peso: 120.5,
      temperatura: 38.2,
      frecuenciaCardiaca: 80,
      frecuenciaRespiratoria: 22,
      examenFisico: "Mucosas pálidas",
      diagnosticoPresuntivo: "Anemia leve",
      diagnosticoDefinitivo: "",
      abierto: true,
    });

    expect(payload).toEqual({
      anamnesis: "Decaimiento y falta de apetito",
      peso_actual: 120.5,
      temperatura: 38.2,
      frecuencia_cardiaca: 80,
      frecuencia_respiratoria: 22,
      examen_fisico_obs: "Mucosas pálidas",
      diagnostico_presuntivo: "Anemia leve",
      diagnostico_definitivo: "",
      animal_id: 5,
      tipo_atencion_id: 2,
    });
  });
});
