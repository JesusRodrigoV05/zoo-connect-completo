// @vitest-environment jsdom
/**
 * Pruebas Unitarias - Gestión de Tareas (Frontend)
 * Framework: Angular TestBed / Vitest
 * Módulos bajo prueba: adapters/tareas.adapter.ts, services/tareas/admin-tipos-tarea.ts
 */

import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  provideHttpClientTesting,
  HttpTestingController,
} from "@angular/common/http/testing";
import {
  TipoTareaAdapter,
  TareaRecurrenteAdapter,
} from "../app/features/private/admin/adapters/tareas.adapter";
import {
  CreateTipoTarea,
  TareaRecurrente,
} from "../app/features/private/admin/models/tareas/tarea.model";
import { AdminTiposTarea } from "../app/features/private/admin/services/tareas/admin-tipos-tarea";

// =============================================================================
// BLOQUE 1: Pruebas de TipoTareaAdapter
// =============================================================================
describe("TipoTareaAdapter", () => {

  // ===========================================================================
  // TEST 1: TipoTareaAdapter.fromBackend mapea tipo de tarea a modelo frontend
  // ===========================================================================
  it("debe mapear correctamente los campos snake_case del backend a camelCase del frontend", () => {
    /*
      Verifica que el adaptador transforme un objeto de tipo de tarea 
      proveniente de la base de datos al formato tipado del frontend.
    */
    // 1. Preparación de la prueba
    const backend = {
      id_tipo_tarea: 1,
      nombre_tipo_tarea: "Alimentacion",
      descripcion_tipo_tarea: "Dar de comer a los animales",
      is_active: true,
    };

    // 2. Lógica de la prueba
    const result = TipoTareaAdapter.fromBackend(backend);

    // 3. Verificación del resultado esperado (Assert)
    expect(result.id).toBe(1);
    expect(result.nombre).toBe("Alimentacion");
    expect(result.descripcion).toBe("Dar de comer a los animales");
    expect(result.isActive).toBe(true);
  });

  // ===========================================================================
  // TEST 2: TipoTareaAdapter.toCreate transforma CreateTipoTarea a snake_case
  // ===========================================================================
  it("debe transformar el modelo de creación del frontend al formato snake_case requerido por el backend", () => {
    /*
      Verifica que el adaptador convierta el objeto estructurado del formulario
      en el payload plano con la nomenclatura que espera la API.
    */
    // 1. Preparación de la prueba
    const data: CreateTipoTarea = {
      nombre: "Alimentacion",
      descripcion: "Dar de comer",
    };

    // 2. Lógica de la prueba
    const result = TipoTareaAdapter.toCreate(data);

    // 3. Verificación del resultado esperado (Assert)
    expect(result.nombre_tipo_tarea).toBe("Alimentacion");
    expect(result.descripcion_tipo_tarea).toBe("Dar de comer");
  });
});

// =============================================================================
// BLOQUE 2: Pruebas de TareaRecurrenteAdapter
// =============================================================================
describe("TareaRecurrenteAdapter", () => {

  // ===========================================================================
  // TEST 3: TareaRecurrenteAdapter.fromBackend mapea tarea recurrente con tipo anidado
  // ===========================================================================
  it("debe mapear la tarea recurrente resolviendo correctamente la relación del objeto de tipo de tarea anidada", () => {
    /*
      Verifica que las propiedades de la tarea y de su sub-objeto (tipo_tarea)
      se conviertan de manera recursiva a camelCase sin perder información.
    */
    // 1. Preparación de la prueba
    const backend = {
      id_tarea_recurrente: 5,
      titulo_plantilla: "Limpieza matutina",
      descripcion_plantilla: "Limpiar habitats",
      tipo_tarea_id: 2,
      tipo_tarea: {
        id_tipo_tarea: 2,
        nombre_tipo_tarea: "Limpieza",
        descripcion_tipo_tarea: "Tareas de limpieza",
        is_active: true,
      },
      frecuencia_cron: "0 6 * * *",
      animal_id: null,
      habitat_id: 3,
      is_active: true,
    };

    // 2. Lógica de la prueba
    const result = TareaRecurrenteAdapter.fromBackend(backend);

    // 3. Verificación del resultado esperado (Assert)
    expect(result.id).toBe(5);
    expect(result.titulo).toBe("Limpieza matutina");
    expect(result.frecuenciaCron).toBe("0 6 * * *");
    expect(result.tipoTarea?.nombre).toBe("Limpieza");
    expect(result.habitatId).toBe(3);
  });
});

// =============================================================================
// BLOQUE 3: Pruebas del Servicio AdminTiposTarea (Llamadas HTTP)
// =============================================================================
describe("AdminTiposTarea Service", () => {

  // ===========================================================================
  // TEST 4: AdminTiposTarea.getTipos obtiene y mapea lista de tipos de tarea
  // ===========================================================================
  it("debe realizar una petición GET a la API y retornar la lista de tipos de tarea adaptada al frontend", () => {
    /*
      Verifica que el método getTipos consuma el endpoint correcto y aplique
      el mapeo correspondiente a toda la colección de elementos recibida.
    */
    // 1. Preparación de la prueba
    TestBed.configureTestingModule({
      providers: [
        AdminTiposTarea,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });
    const service = TestBed.inject(AdminTiposTarea);
    const httpMock = TestBed.inject(HttpTestingController);
    
    const backendData = [
      { id_tipo_tarea: 1, nombre_tipo_tarea: "Alimentacion", descripcion_tipo_tarea: "Comida", is_active: true },
      { id_tipo_tarea: 2, nombre_tipo_tarea: "Limpieza", descripcion_tipo_tarea: "Aseo", is_active: true },
    ];

    // 2. Lógica de la prueba
    let captured: any;
    service.getTipos().subscribe((r) => { captured = r; });
    
    const req = httpMock.expectOne((r) => r.url.includes("/tareas/tipos"));
    req.flush(backendData);

    // 3. Verificación del resultado esperado (Assert)
    expect(captured.length).toBe(2);
    expect(captured[0].id).toBe(1);
    expect(captured[0].nombre).toBe("Alimentacion");
    expect(captured[1].nombre).toBe("Limpieza");
    httpMock.verify();
  });

  // ===========================================================================
  // TEST 5: AdminTiposTarea.createTipo envia POST con snake_case y retorna tipo mapeado
  // ===========================================================================
  it("debe realizar una petición POST enviando el payload formateado y retornar el nuevo registro mapeado", () => {
    /*
      Verifica que al guardar un nuevo tipo de tarea, el cuerpo del mensaje viaje
      con las propiedades serializadas y la respuesta del servidor sea procesada.
    */
    // 1. Preparación de la prueba
    TestBed.configureTestingModule({
      providers: [
        AdminTiposTarea,
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    });
    const service = TestBed.inject(AdminTiposTarea);
    const httpMock = TestBed.inject(HttpTestingController);
    
    const newTipo: CreateTipoTarea = { nombre: "Cuarentena", descripcion: "Tareas de cuarentena" };
    const backendResponse = { id_tipo_tarea: 3, nombre_tipo_tarea: "Cuarentena", descripcion_tipo_tarea: "Tareas de cuarentena", is_active: true };

    // 2. Lógica de la prueba
    let captured: any;
    service.createTipo(newTipo).subscribe((r) => { captured = r; });
    
    const req = httpMock.expectOne((r) => r.method === "POST" && r.url.includes("/tareas/tipos"));
    req.flush(backendResponse);

    // 3. Verificación del resultado esperado (Assert)
    expect(captured.id).toBe(3);
    expect(captured.nombre).toBe("Cuarentena");
    expect(req.request.body.nombre_tipo_tarea).toBe("Cuarentena");
    expect(req.request.body.descripcion_tipo_tarea).toBe("Tareas de cuarentena");
    httpMock.verify();
  });
});