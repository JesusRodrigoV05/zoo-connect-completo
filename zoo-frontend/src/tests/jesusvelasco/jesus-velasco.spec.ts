import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { AnimalAdapter, BackendAnimalResponse } from "@adapters/animales";
import { Animal, CreateAnimal, EstadoOperativo } from "@models/animales";
import { FavoriteAnimals } from "@app/features/public/animales/services/favorite-animals";
import { GetAnimales } from "@app/features/public/animales/services/animales";

describe("Pruebas unitarias — Jesús Velasco", () => {

  it("AnimalAdapter.fromBackend mapea todos los campos correctamente", () => {
    // 1) Preparación
    const backend: BackendAnimalResponse = {
      id_animal: 1, nombre_animal: "Simba", genero: true,
      fecha_nacimiento: "2020-01-15", fecha_ingreso: "2021-03-01",
      procedencia_animal: "Sabana", estado_operativo: EstadoOperativo.SALUDABLE,
      es_publico: true, descripcion: "Leon macho", especie_id: 1, habitat_id: 1,
      especie: { id_especie: 1, nombre_cientifico: "Panthera leo", nombre_especie: "Leon",
        filo: "Chordata", clase: "Mammalia", orden: "Carnivora", familia: "Felidae",
        descripcion_especie: "Gran felino", is_active: true },
      habitat: { id_habitat: 1, nombre_habitat: "Sabana", tipo_habitat: "Tropical",
        descripcion_habitat: "Sabana africana", condiciones_climaticas: "Calido", is_active: true },
      media: [], age: 4,
    };
    // 2) Lógica
    const result = AnimalAdapter.fromBackend(backend);
    // 3) Assert
    expect(result.nombre).toBe("Simba");
    expect(result.especie.nombreComun).toBe("Leon");
    expect(result.habitat.nombre).toBe("Sabana");
  });

  it("AnimalAdapter.toCreateRequest omite id_animal y transforma nombres", () => {
    // 1) Preparación
    const animal: CreateAnimal = {
      nombre: "Nala", genero: false,
      fecha_nacimiento: "2021-06-01", fecha_ingreso: "2022-01-01",
      procedencia: "Kenia", estado_operativo: EstadoOperativo.EN_TRATAMIENTO,
      es_publico: false, descripcion: "Leona", especie_id: 1, habitat_id: 2,
    };
    // 2) Lógica
    const result = AnimalAdapter.toCreateRequest(animal);
    // 3) Assert
    expect(result).not.toHaveProperty("id_animal");
    expect(result.nombre_animal).toBe("Nala");
    expect(result.procedencia_animal).toBe("Kenia");
  });

  it("FavoriteAnimals.getFavoriteAnimals obtiene y mapea favoritos", () => {
    // 1) Preparación
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FavoriteAnimals],
    });
    const service = TestBed.inject(FavoriteAnimals);
    const httpMock = TestBed.inject(HttpTestingController);

    // 2) Lógica
    let captured: any;
    service.getFavoriteAnimals().subscribe((r) => { captured = r; });
    const req = httpMock.expectOne(service.animalesUrl);
    req.flush({
      items: [{ animal: { id_animal: 1, nombre_animal: "Simba", genero: true,
        fecha_nacimiento: "2020-01-15", fecha_ingreso: "2021-03-01",
        procedencia_animal: "Sabana", estado_operativo: EstadoOperativo.SALUDABLE,
        es_publico: true, descripcion: "Leon", especie_id: 1, habitat_id: 1,
        especie: { id_especie: 1, nombre_cientifico: "Panthera leo", nombre_especie: "Leon",
          filo: "Chordata", clase: "Mammalia", orden: "Carnivora", familia: "Felidae",
          descripcion_especie: "Gran felino", is_active: true },
        habitat: { id_habitat: 1, nombre_habitat: "Sabana", tipo_habitat: "Tropical",
          descripcion_habitat: "Sabana africana", condiciones_climaticas: "Calido", is_active: true },
        media: [], age: 4 } }],
      total: 1, page: 1, size: 10, totalPages: 1,
    });
    httpMock.verify();

    // 3) Assert
    expect(captured.length).toBe(1);
    expect(captured[0].nombre).toBe("Simba");
  });

  it("GetAnimales.getAllAnimals corrige page=0 a page=1", () => {
    // 1) Preparación
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GetAnimales],
    });
    const service = TestBed.inject(GetAnimales);
    const httpMock = TestBed.inject(HttpTestingController);

    // 2) Lógica
    let captured: any;
    service.getAllAnimals(0, 10).subscribe((r) => { captured = r; });
    const req = httpMock.expectOne((r) => r.params.get("page") === "1");
    req.flush({ items: [], total: 0, page: 1, size: 10, totalPages: 0 });
    httpMock.verify();

    // 3) Assert
    expect(captured.page).toBe(1);
  });

  it("GetAnimales.getAllAnimals envuelve error HTTP con mensaje específico", () => {
    // 1) Preparación
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GetAnimales],
    });
    const service = TestBed.inject(GetAnimales);
    const httpMock = TestBed.inject(HttpTestingController);

    // 2) Lógica
    let captured: any;
    service.getAllAnimals(1, 10).subscribe({
      next: () => { throw new Error("Debería haber fallado"); },
      error: (err) => { captured = err; },
    });
    const req = httpMock.expectOne((r) => r.params.get("page") === "1");
    req.flush("Server error", { status: 500, statusText: "Internal Server Error" });
    httpMock.verify();

    // 3) Assert
    expect(captured.message).toBe("Error al obtener los animales");
  });

});
