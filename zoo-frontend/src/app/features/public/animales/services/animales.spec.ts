import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { GetAnimales } from "./animales";
import { BackendAnimalResponse } from "@adapters/animales";
import { Animal, EstadoOperativo } from "@models/animales";

function buildBackendAnimal(overrides?: Partial<BackendAnimalResponse>): BackendAnimalResponse {
  return {
    id_animal: 1,
    nombre_animal: "Simba",
    genero: true,
    fecha_nacimiento: "2020-01-15",
    fecha_ingreso: "2021-03-01",
    procedencia_animal: "Sabana",
    estado_operativo: EstadoOperativo.SALUDABLE,
    es_publico: true,
    descripcion: "Leon",
    especie_id: 1,
    habitat_id: 1,
    especie: {
      id_especie: 1,
      nombre_cientifico: "Panthera leo",
      nombre_especie: "Leon",
      filo: "Chordata",
      clase: "Mammalia",
      orden: "Carnivora",
      familia: "Felidae",
      descripcion_especie: "Gran felino",
      is_active: true,
    },
    habitat: {
      id_habitat: 1,
      nombre_habitat: "Sabana",
      tipo_habitat: "Tropical",
      descripcion_habitat: "Sabana africana",
      condiciones_climaticas: "Calido",
      is_active: true,
    },
    media: [],
    age: 4,
    ...overrides,
  };
}

describe("Test #3: GetAnimales service — HTTP + adapter + error handling + validación", () => {
  let service: GetAnimales;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GetAnimales],
    });

    service = TestBed.inject(GetAnimales);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("getAllAnimals", () => {
    it("envia request con page=1, size=10 por defecto", () => {
      service.getAllAnimals().subscribe();

      const req = httpMock.expectOne((request) => {
        const page = request.params.get("page");
        const size = request.params.get("size");
        return page === "1" && size === "10";
      });

      req.flush({ items: [], total: 0, page: 1, size: 10, totalPages: 0 });
    });

    it("envia request con page y size personalizados", () => {
      service.getAllAnimals(3, 25).subscribe();

      const req = httpMock.expectOne((request) => {
        const page = request.params.get("page");
        const size = request.params.get("size");
        return page === "3" && size === "25";
      });

      req.flush({ items: [], total: 0, page: 3, size: 25, totalPages: 0 });
    });

    it("corrige page negativa a page=1", () => {
      service.getAllAnimals(-5, 10).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.params.get("page") === "1";
      });

      req.flush({ items: [], total: 0, page: 1, size: 10, totalPages: 0 });
    });

    it("corrige page=0 a page=1", () => {
      service.getAllAnimals(0, 10).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.params.get("page") === "1";
      });

      req.flush({ items: [], total: 0, page: 1, size: 10, totalPages: 0 });
    });

    it("corrige size negativa a size=10", () => {
      service.getAllAnimals(1, -1).subscribe();

      const req = httpMock.expectOne((request) => {
        return request.params.get("size") === "10";
      });

      req.flush({ items: [], total: 0, page: 1, size: 10, totalPages: 0 });
    });

    it("transforma la respuesta backend con AnimalAdapter.fromBackend", () => {
      const backendItems = [
        buildBackendAnimal({ id_animal: 1, nombre_animal: "Simba" }),
        buildBackendAnimal({ id_animal: 2, nombre_animal: "Nala" }),
      ];

      service.getAllAnimals().subscribe((result) => {
        expect(result.items.length).toBe(2);
        expect(result.items[0].nombre).toBe("Simba");
        expect(result.items[0].id_animal).toBe(1);
        expect(result.items[1].nombre).toBe("Nala");
        expect(result.items[1].especie.nombreComun).toBe("Leon");
        expect(result.items[1].habitat.nombre).toBe("Sabana");
      });

      const req = httpMock.expectOne(service.animalesUrl);
      req.flush({ items: backendItems, total: 2, page: 1, size: 10, totalPages: 1 });
    });

    it("error HTTP → devuelve Error('Error al obtener los animales')", (done) => {
      service.getAllAnimals().subscribe({
        next: () => fail("should have failed"),
        error: (err) => {
          expect(err.message).toBe("Error al obtener los animales");
          done();
        },
      });

      const req = httpMock.expectOne(service.animalesUrl);
      req.flush("Server error", { status: 500, statusText: "Internal Server Error" });
    });
  });

  describe("getAnimalById", () => {
    it("envia GET a /animals/animals/:id con el ID correcto", () => {
      service.getAnimalById(42).subscribe();

      const req = httpMock.expectOne(`${service.animalesUrl}/42`);
      expect(req.request.method).toBe("GET");
      req.flush(buildBackendAnimal({ id_animal: 42 }));
    });

    it("transforma la respuesta individual con AnimalAdapter.fromBackend", () => {
      const backendAnimal = buildBackendAnimal({
        id_animal: 99,
        nombre_animal: "Mufasa",
        genero: true,
        estado_operativo: EstadoOperativo.EN_TRATAMIENTO,
      });

      service.getAnimalById(99).subscribe((animal) => {
        expect(animal.id_animal).toBe(99);
        expect(animal.nombre).toBe("Mufasa");
        expect(animal.genero).toBe(true);
        expect(animal.estado_operativo).toBe(EstadoOperativo.EN_TRATAMIENTO);
        expect(animal.especie.nombreCientifico).toBe("Panthera leo");
        expect(animal.habitat.tipo).toBe("Tropical");
      });

      const req = httpMock.expectOne(`${service.animalesUrl}/99`);
      req.flush(backendAnimal);
    });
  });
});
