import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { FavoriteAnimals } from "./favorite-animals";
import { AnimalAdapter, BackendAnimalResponse } from "@adapters/animales";
import { Animal, EstadoOperativo } from "@models/animales";

function buildBackendAnimal(id: number, name: string): BackendAnimalResponse {
  return {
    id_animal: id,
    nombre_animal: name,
    genero: true,
    fecha_nacimiento: "2020-01-15",
    fecha_ingreso: "2021-03-01",
    procedencia_animal: "Sabana",
    estado_operativo: EstadoOperativo.SALUDABLE,
    es_publico: true,
    descripcion: "Animal de prueba",
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
  };
}

describe("FavoriteAnimals service", () => {
  let service: FavoriteAnimals;
  let httpMock: HttpTestingController;
  const apiUrl = "https://api.zoo.com";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [FavoriteAnimals],
    });

    service = TestBed.inject(FavoriteAnimals);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe("getFavoriteAnimals", () => {
    it("obtiene favoritos con formato items[].animal y los mapea correctamente", () => {
      const animal1 = buildBackendAnimal(1, "Simba");
      const animal2 = buildBackendAnimal(2, "Nala");
      const mockResponse = {
        items: [
          { animal: animal1 },
          { animal: animal2 },
        ],
        total: 2,
        page: 1,
        size: 10,
        totalPages: 1,
      };

      service.getFavoriteAnimals().subscribe((result) => {
        expect(result.length).toBe(2);
        expect(result[0].nombre).toBe("Simba");
        expect(result[0].id_animal).toBe(1);
        expect(result[1].nombre).toBe("Nala");
        expect(result[1].id_animal).toBe(2);
      });

      const req = httpMock.expectOne(service.animalesUrl);
      expect(req.request.method).toBe("GET");
      req.flush(mockResponse);
    });

    it("maneja respuesta directa como array (sin wrapper items)", () => {
      const animal1 = buildBackendAnimal(1, "Simba");
      const mockResponse = [animal1];

      service.getFavoriteAnimals().subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].nombre).toBe("Simba");
      });

      const req = httpMock.expectOne(service.animalesUrl);
      req.flush(mockResponse);
    });

    it("devuelve array vacio cuando no hay favoritos", () => {
      const mockResponse = { items: [], total: 0, page: 1, size: 10, totalPages: 0 };

      service.getFavoriteAnimals().subscribe((result) => {
        expect(result).toEqual([]);
      });

      const req = httpMock.expectOne(service.animalesUrl);
      req.flush(mockResponse);
    });

    it("propaga error HTTP correctamente", () => {
      service.getFavoriteAnimals().subscribe({
        next: () => fail("should have failed"),
        error: (err) => {
          expect(err.status).toBe(500);
        },
      });

      const req = httpMock.expectOne(service.animalesUrl);
      req.flush("Server error", { status: 500, statusText: "Internal Server Error" });
    });
  });

  describe("addFavoriteAnimal", () => {
    it("envia POST con animal_id al endpoint correcto", () => {
      const animal = buildBackendAnimal(5, "Mufasa");
      const mockResponse = { animal };

      service.addFavoriteAnimal(5).subscribe((result) => {
        expect(result.nombre).toBe("Mufasa");
        expect(result.id_animal).toBe(5);
      });

      const req = httpMock.expectOne(service.animalesUrl);
      expect(req.request.method).toBe("POST");
      expect(req.request.body).toEqual({ animal_id: 5 });
      req.flush(mockResponse);
    });

    it("maneja respuesta directa sin wrapper animal", () => {
      const animal = buildBackendAnimal(10, "Scar");

      service.addFavoriteAnimal(10).subscribe((result) => {
        expect(result.nombre).toBe("Scar");
        expect(result.id_animal).toBe(10);
      });

      const req = httpMock.expectOne(service.animalesUrl);
      req.flush(animal);
    });

    it("propaga error HTTP al agregar favorito", () => {
      service.addFavoriteAnimal(99).subscribe({
        next: () => fail("should have failed"),
        error: (err) => {
          expect(err.status).toBe(404);
        },
      });

      const req = httpMock.expectOne(service.animalesUrl);
      req.flush("Not found", { status: 404, statusText: "Not Found" });
    });
  });

  describe("removeFavoriteAnimal", () => {
    it("envia DELETE a la URL correcta con el ID del animal", () => {
      service.removeFavoriteAnimal(42).subscribe();

      const req = httpMock.expectOne(`${service.animalesUrl}42`);
      expect(req.request.method).toBe("DELETE");
      req.flush(null);
    });

    it("propaga error HTTP al eliminar favorito", () => {
      service.removeFavoriteAnimal(99).subscribe({
        next: () => fail("should have failed"),
        error: (err) => {
          expect(err.status).toBe(403);
        },
      });

      const req = httpMock.expectOne(`${service.animalesUrl}99`);
      req.flush("Forbidden", { status: 403, statusText: "Forbidden" });
    });
  });
});
