/** CP31: Verificar la creación de una nueva categoría de Tipo de Atención. */
import { describe, expect, it } from "vitest";
import { TipoAtencionAdapter } from "../adapters/historiales/veterinario-config.adapter";

describe("CP31 — Tipo de Atención", () => {
  it("debe mapear la creación de un Tipo de Atención válido", () => {
    const payload = TipoAtencionAdapter.toCreatePayload({
      nombre: "Tratamiento Ortopédico",
      descripcion: "Atención especializada en huesos y articulaciones",
    });

    expect(payload).toEqual({
      nombre_tipo_atencion: "Tratamiento Ortopédico",
      descripcion: "Atención especializada en huesos y articulaciones",
    });
  });
});
