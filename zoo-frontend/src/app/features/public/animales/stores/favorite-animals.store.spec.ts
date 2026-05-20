import type { MockedObject } from "vitest";
import { TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { Animal, EstadoOperativo } from "@models/animales";
import { FavoriteStore } from "./favorite-animals.store";
import { FavoriteAnimals } from "../services/favorite-animals";

function buildAnimal(id: number, name: string): Animal {
    return {
        id_animal: id,
        nombre: name,
        genero: true,
        fecha_nacimiento: "2020-01-15",
        fecha_ingreso: "2021-03-01",
        procedencia: "Sabana",
        estado_operativo: EstadoOperativo.SALUDABLE,
        es_publico: true,
        descripcion: "Animal de prueba",
        especie_id: 1,
        habitat_id: 1,
        especie: {
            idEspecie: 1,
            nombreCientifico: "Panthera leo",
            nombreComun: "Leon",
            filo: "Chordata",
            clase: "Mammalia",
            orden: "Carnivora",
            familia: "Felidae",
            descripcion: "Gran felino",
            isActive: true,
        },
        habitat: {
            id: 1,
            nombre: "Sabana",
            tipo: "Tropical",
            descripcion: "Sabana africana",
            condicionesClimaticas: "Calido",
            isActive: true,
        },
        media: [],
        age: 4,
    };
}

async function flush(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 0));
}

async function waitReady(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 10));
}

describe("Test #2: FavoriteStore — Optimistic update + rollback automático", () => {
    let store: InstanceType<typeof FavoriteStore>;
    let favoriteServiceSpy: MockedObject<FavoriteAnimals>;

    beforeEach(() => {
        const spy = {
            getFavoriteAnimals: vi.fn().mockName("FavoriteAnimals.getFavoriteAnimals").mockReturnValue(of([])),
            addFavoriteAnimal: vi.fn().mockName("FavoriteAnimals.addFavoriteAnimal").mockReturnValue(of(undefined as any)),
            removeFavoriteAnimal: vi.fn().mockName("FavoriteAnimals.removeFavoriteAnimal").mockReturnValue(of(undefined as any)),
        };

        TestBed.configureTestingModule({
            providers: [
                FavoriteStore,
                { provide: FavoriteAnimals, useValue: spy },
            ],
        });

        store = TestBed.inject(FavoriteStore);
        favoriteServiceSpy = TestBed.inject(FavoriteAnimals) as unknown as MockedObject<FavoriteAnimals>;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("isAnimalFavorite", () => {
        it("devuelve false cuando el animal no esta en favoritos", () => {
            expect(store.isAnimalFavorite(1)).toBe(false);
        });

        it("devuelve true cuando el animal esta en favoritos", async () => {
            const animal = buildAnimal(1, "Simba");
            favoriteServiceSpy.addFavoriteAnimal.mockReturnValue(of(animal));

            store.toggleFavorite(animal);
            await flush();

            expect(store.isAnimalFavorite(1)).toBe(true);
        });
    });

    describe("hasFavorites", () => {
        it("empieza en false sin favoritos", () => {
            expect(store.hasFavorites()).toBe(false);
        });

        it("cambia a true cuando se agrega un favorito", async () => {
            const animal = buildAnimal(1, "Simba");
            favoriteServiceSpy.addFavoriteAnimal.mockReturnValue(of(animal));

            store.toggleFavorite(animal);
            await flush();

            expect(store.hasFavorites()).toBe(true);
        });

        it("vuelve a false cuando se elimina el ultimo favorito", async () => {
            const animal = buildAnimal(1, "Simba");
            favoriteServiceSpy.addFavoriteAnimal.mockReturnValue(of(animal));
            favoriteServiceSpy.removeFavoriteAnimal.mockReturnValue(of(undefined as any));

            store.toggleFavorite(animal);
            await flush();
            expect(store.hasFavorites()).toBe(true);

            store.toggleFavorite(animal);
            await flush();
            expect(store.hasFavorites()).toBe(false);
        });
    });

    describe("toggleFavorite — agregar (no existe)", () => {
        it("optimistic add → HTTP success → queda en store", async () => {
            const animal = buildAnimal(1, "Simba");
            favoriteServiceSpy.addFavoriteAnimal.mockReturnValue(of(animal));

            store.toggleFavorite(animal);
            await flush();

            expect(store.isAnimalFavorite(1)).toBe(true);
            expect(store.entities().length).toBe(1);
            expect(favoriteServiceSpy.addFavoriteAnimal).toHaveBeenCalledWith(1);
        });
    });

    describe("toggleFavorite — eliminar (ya existe)", () => {
        it("optimistic remove → HTTP success → se va del store", async () => {
            const animal = buildAnimal(1, "Simba");
            favoriteServiceSpy.addFavoriteAnimal.mockReturnValue(of(animal));
            favoriteServiceSpy.removeFavoriteAnimal.mockReturnValue(of(undefined as any));

            store.toggleFavorite(animal);
            await flush();
            expect(store.isAnimalFavorite(1)).toBe(true);

            store.toggleFavorite(animal);
            await flush();
            expect(store.isAnimalFavorite(1)).toBe(false);
            expect(store.entities().length).toBe(0);
            expect(favoriteServiceSpy.removeFavoriteAnimal).toHaveBeenCalledWith(1);
        });
    });

    describe("toggleFavorite — rollback automatico", () => {
        it("agregar → HTTP falla → rollback automatico al estado anterior (vacío)", async () => {
            const animal = buildAnimal(1, "Simba");
            favoriteServiceSpy.addFavoriteAnimal.mockReturnValue(throwError(() => new Error("Network error")));

            store.toggleFavorite(animal);
            await flush();

            expect(store.isAnimalFavorite(1)).toBe(false);
            expect(store.entities().length).toBe(0);
        });

        it("eliminar → HTTP falla → rollback automatico (vuelve a favorito)", async () => {
            const animal = buildAnimal(1, "Simba");
            favoriteServiceSpy.addFavoriteAnimal.mockReturnValue(of(animal));
            favoriteServiceSpy.removeFavoriteAnimal.mockReturnValue(throwError(() => new Error("Network error")));

            store.toggleFavorite(animal);
            await flush();
            expect(store.isAnimalFavorite(1)).toBe(true);

            store.toggleFavorite(animal);
            await flush();

            expect(store.isAnimalFavorite(1)).toBe(true);
            expect(store.entities().length).toBe(1);
        });
    });

    describe("loadFavorites", () => {
        it("carga favoritos desde el servicio y los pone en el store", async () => {
            const animals = [buildAnimal(1, "Simba"), buildAnimal(2, "Nala")];
            favoriteServiceSpy.getFavoriteAnimals.mockReturnValue(of(animals));

            store.loadFavorites();
            await flush();

            expect(store.entities().length).toBe(2);
            expect(store.isAnimalFavorite(1)).toBe(true);
            expect(store.isAnimalFavorite(2)).toBe(true);
            expect(store.hasFavorites()).toBe(true);
        });

        it("setea error cuando falla la carga", async () => {
            favoriteServiceSpy.getFavoriteAnimals.mockReturnValue(throwError(() => new Error("Failed to load")));

            store.loadFavorites();
            await flush();

            expect(store.error()).toContain("Failed to load");
            expect(store.isLoading()).toBe(false);
        });
    });
});
