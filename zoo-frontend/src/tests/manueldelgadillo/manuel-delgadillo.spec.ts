import { TipoAtencionAdapter } from "@features/private/veterinario/adapters/historiales/veterinario-config.adapter";
import { HistorialAdapter } from "@features/private/veterinario/adapters/historiales/historial.adapter";
import { RecetaAdapter } from "@features/private/veterinario/adapters/historiales/receta.adapter";
import { ExamenAdapter } from "@features/private/veterinario/adapters/historiales/examenes.adapter";

describe("Pruebas unitarias — Manuel Delgadillo", () => {
  it("CP31: TipoAtencionAdapter.toCreatePayload mapea un tipo de atención válido", () => {
    // 1) Preparación
    const nombre = "Tratamiento Ortopédico";
    const descripcion = "Atención especializada en huesos y articulaciones";

    // 2) Lógica
    const result = TipoAtencionAdapter.toCreatePayload({ nombre, descripcion });

    // 3) Assert
    expect(result).toEqual({
      nombre_tipo_atencion: "Tratamiento Ortopédico",
      descripcion: "Atención especializada en huesos y articulaciones",
    });
  });

  it("CP32: HistorialAdapter.toCreatePayload mapea una consulta clínica con constantes vitales", () => {
    // 1) Preparación
    const historial = {
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
    };

    // 2) Lógica
    const result = HistorialAdapter.toCreatePayload(historial);

    // 3) Assert
    expect(result).toEqual({
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

  it("CP33: RecetaAdapter.toCreatePayload incluye tareas automáticas al crear receta", () => {
    // 1) Preparación
    const receta = {
      productoId: 10,
      unidadMedidaId: 3,
      dosis: 5,
      frecuencia: "Diariamente",
      duracionDias: 7,
      instrucciones: "Con comida",
      generarTarea: true,
      frecuenciaCron: "0 8 * * *",
      usuarioAsignadoId: 4,
    };

    // 2) Lógica
    const result = RecetaAdapter.toCreatePayload(receta);

    // 3) Assert
    expect(result.generar_tarea_automatica).toBe(true);
    expect(result.frecuencia_cron).toBe("0 8 * * *");
    expect(result.usuario_asignado_id).toBe(4);
    expect(result.dosis).toBe(5);
    expect(result.instrucciones_administracion).toBe("Con comida");
  });

  it("CP35: ExamenAdapter.toCreateOrdenPayload mapea una orden de examen clínico", () => {
    // 1) Preparación
    const orden = {
      tipoExamenId: 7,
      instrucciones: "Ayuno de 12 horas antes del examen",
    };

    // 2) Lógica
    const result = ExamenAdapter.toCreateOrdenPayload(orden);

    // 3) Assert
    expect(result).toEqual({
      tipo_examen_id: 7,
      instrucciones: "Ayuno de 12 horas antes del examen",
    });
  });

  it("CP45: HistorialAdapter.toUpdatePayload mapea el cierre del historial clínico", () => {
    // 1) Preparación
    const cierre = {
      abierto: false,
      diagnosticoDefinitivo: "Recuperación completa",
    };

    // 2) Lógica
    const result = HistorialAdapter.toUpdatePayload(cierre);

    // 3) Assert
    expect(result.estado).toBe(false);
    expect(result.diagnostico_definitivo).toBe("Recuperación completa");
  });
});
