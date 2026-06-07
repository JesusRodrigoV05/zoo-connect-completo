/** CP45: Verificar el cierre del ciclo clínico. */
import { describe, expect, it } from "vitest";
import { HistorialAdapter } from "../adapters/historiales/historial.adapter";

describe("CP45 — Cierre del ciclo clínico", () => {
  it("debe mapear el cierre del historial clínico (estado finalizado)", () => {
    const payload = HistorialAdapter.toUpdatePayload({
      abierto: false,
      diagnosticoDefinitivo: "Recuperación completa",
    });

    expect(payload.estado).toBe(false);
    expect(payload.diagnostico_definitivo).toBe("Recuperación completa");
  });
});
