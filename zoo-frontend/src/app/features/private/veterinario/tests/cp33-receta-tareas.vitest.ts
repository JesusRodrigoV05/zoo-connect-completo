/** CP33: Verificar la creación de una receta con generación de tareas automáticas. */
import { describe, expect, it } from "vitest";
import { RecetaAdapter } from "../adapters/historiales/receta.adapter";

describe("CP33 — Receta con tareas automáticas", () => {
  it("debe incluir programación de recordatorios al crear una receta", () => {
    const payload = RecetaAdapter.toCreatePayload({
      productoId: 10,
      unidadMedidaId: 3,
      dosis: 5,
      frecuencia: "Diariamente",
      duracionDias: 7,
      instrucciones: "Con comida",
      generarTarea: true,
      frecuenciaCron: "0 8 * * *",
      usuarioAsignadoId: 4,
    });

    expect(payload.generar_tarea_automatica).toBe(true);
    expect(payload.frecuencia_cron).toBe("0 8 * * *");
    expect(payload.usuario_asignado_id).toBe(4);
    expect(payload.dosis).toBe(5);
    expect(payload.instrucciones_administracion).toBe("Con comida");
  });
});
