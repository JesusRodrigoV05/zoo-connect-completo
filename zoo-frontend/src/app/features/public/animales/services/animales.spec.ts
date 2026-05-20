import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule, HttpTestingController, } from "@angular/common/http/testing";
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
            // Arrange
            const mockResponse = { items: [], total: 0, page: 1, size: 10, totalPages: 0 };

            // Act
            service.getAllAnimals().subscribe((result) => {
                expect(result.items).toEqual([]);
                expect(result.total).toBe(0);
            });

            // Assert
            const req = httpMock.expectOne((request) => {
                const page = request.params.get("page");
                const size = request.params.get("size");
                return page === "1" && size === "10";
            });

            req.flush(mockResponse);
        });

        it("envia request con page y size personalizados", () => {
            // Arrange
            const mockResponse = { items: [], total: 0, page: 3, size: 25, totalPages: 0 };

            // Act
            service.getAllAnimals(3, 25).subscribe((result) => {
                expect(result.page).toBe(3);
                expect(result.size).toBe(25);
            });

            // Assert
            const req = httpMock.expectOne((request) => {
                const page = request.params.get("page");
                const size = request.params.get("size");
                return page === "3" && size === "25";
            });

            req.flush(mockResponse);
        });

        it("corrige page negativa a page=1", () => {
            // Arrange
            const mockResponse = { items: [], total: 0, page: 1, size: 10, totalPages: 0 };

            // Act
            service.getAllAnimals(-5, 10).subscribe((result) => {
                expect(result.page).toBe(1);
            });

            // Assert
            const req = httpMock.expectOne((request) => {
                return request.params.get("page") === "1";
            });

            req.flush(mockResponse);
        });

        it("corrige page=0 a page=1", () => {
            // Arrange
            const mockResponse = { items: [], total: 0, page: 1, size: 10, totalPages: 0 };

            // Act
            service.getAllAnimals(0, 10).subscribe((result) => {
                expect(result.page).toBe(1);
            });

            // Assert
            const req = httpMock.expectOne((request) => {
                return request.params.get("page") === "1";
            });

            req.flush(mockResponse);
        });

        it("corrige size negativa a size=10", () => {
            // Arrange
            const mockResponse = { items: [], total: 0, page: 1, size: 10, totalPages: 0 };

            // Act
            service.getAllAnimals(1, -1).subscribe((result) => {
                expect(result.size).toBe(10);
            });

            // Assert
            const req = httpMock.expectOne((request) => {
                return request.params.get("size") === "10";
            });

            req.flush(mockResponse);
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

            const req = httpMock.expectOne((request) => request.url === service.animalesUrl &&
                request.params.get("page") === "1" &&
                request.params.get("size") === "10");
            req.flush({ items: backendItems, total: 2, page: 1, size: 10, totalPages: 1 });
        });

        it("error HTTP → devuelve Error('Error al obtener los animales')", async () => {
            service.getAllAnimals().subscribe({
                next: () => { throw new Error("should have failed"); },
                error: (err) => {
                    expect(err.message).toBe("Error al obtener los animales");
                },
            });

            const req = httpMock.expectOne((request) => request.url === service.animalesUrl &&
                request.params.get("page") === "1" &&
                request.params.get("size") === "10");
            req.flush("Server error", { status: 500, statusText: "Internal Server Error" });
        });
    });

    describe("getAnimalById", () => {
        it("envia GET a /animals/animals/:id con el ID correcto", () => {
            // Arrange
            const backendAnimal = buildBackendAnimal({ id_animal: 42, nombre_animal: "Simba" });

            // Act
            service.getAnimalById(42).subscribe((animal) => {
                expect(animal.id_animal).toBe(42);
                expect(animal.nombre).toBe("Simba");
            });

            // Assert
            const req = httpMock.expectOne(`${service.animalesUrl}/42`);
            expect(req.request.method).toBe("GET");
            req.flush(backendAnimal);
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
