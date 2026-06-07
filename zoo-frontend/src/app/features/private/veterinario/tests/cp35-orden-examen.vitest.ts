/** CP35: Verificar la emisión de una Orden de Examen Clínico. */
import { describe, expect, it } from "vitest";
import { ExamenAdapter } from "../adapters/historiales/examenes.adapter";

describe("CP35 — Orden de examen", () => {
  it("debe mapear la emisión de una Orden de Examen Clínico", () => {
    const payload = ExamenAdapter.toCreateOrdenPayload({
      tipoExamenId: 7,
      instrucciones: "Ayuno de 12 horas antes del examen",
    });

    expect(payload).toEqual({
      tipo_examen_id: 7,
      instrucciones: "Ayuno de 12 horas antes del examen",
    });
  });
});
