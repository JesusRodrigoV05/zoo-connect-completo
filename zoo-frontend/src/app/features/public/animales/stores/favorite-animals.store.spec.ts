import { TestBed, fakeAsync, flushMicrotasks } from "@angular/core/testing";
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

describe("Test #2: FavoriteStore — Optimistic update + rollback automático", () => {
  let store: InstanceType<typeof FavoriteStore>;
  let favoriteServiceSpy: jasmine.SpyObj<FavoriteAnimals>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj<FavoriteAnimals>("FavoriteAnimals", [
      "getFavoriteAnimals",
      "addFavoriteAnimal",
      "removeFavoriteAnimal",
    ]);

    spy.getFavoriteAnimals.and.returnValue(of([]));
    spy.addFavoriteAnimal.and.returnValue(of(undefined as any));
    spy.removeFavoriteAnimal.and.returnValue(of(undefined as any));

    TestBed.configureTestingModule({
      providers: [
        FavoriteStore,
        { provide: FavoriteAnimals, useValue: spy },
      ],
    });

    store = TestBed.inject(FavoriteStore);
    favoriteServiceSpy = TestBed.inject(FavoriteAnimals) as jasmine.SpyObj<FavoriteAnimals>;
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe("isAnimalFavorite", () => {
    it("devuelve false cuando el animal no esta en favoritos", () => {
      expect(store.isAnimalFavorite(1)).toBe(false);
    });

    it("devuelve true cuando el animal esta en favoritos", fakeAsync(() => {
      const animal = buildAnimal(1, "Simba");
      favoriteServiceSpy.addFavoriteAnimal.and.returnValue(of(animal));

      store.toggleFavorite(animal);
      flushMicrotasks();

      expect(store.isAnimalFavorite(1)).toBe(true);
    }));
  });

  describe("hasFavorites", () => {
    it("empieza en false sin favoritos", () => {
      expect(store.hasFavorites()).toBe(false);
    });

    it("cambia a true cuando se agrega un favorito", fakeAsync(() => {
      const animal = buildAnimal(1, "Simba");
      favoriteServiceSpy.addFavoriteAnimal.and.returnValue(of(animal));

      store.toggleFavorite(animal);
      flushMicrotasks();

      expect(store.hasFavorites()).toBe(true);
    }));

    it("vuelve a false cuando se elimina el ultimo favorito", fakeAsync(() => {
      const animal = buildAnimal(1, "Simba");
      favoriteServiceSpy.addFavoriteAnimal.and.returnValue(of(animal));
      favoriteServiceSpy.removeFavoriteAnimal.and.returnValue(of(undefined as any));

      store.toggleFavorite(animal);
      flushMicrotasks();
      expect(store.hasFavorites()).toBe(true);

      store.toggleFavorite(animal);
      flushMicrotasks();
      expect(store.hasFavorites()).toBe(false);
    }));
  });

  describe("toggleFavorite — agregar (no existe)", () => {
    it("optimistic add → HTTP success → queda en store", fakeAsync(() => {
      const animal = buildAnimal(1, "Simba");
      favoriteServiceSpy.addFavoriteAnimal.and.returnValue(of(animal));

      store.toggleFavorite(animal);
      flushMicrotasks();

      expect(store.isAnimalFavorite(1)).toBe(true);
      expect(store.entities().length).toBe(1);
      expect(favoriteServiceSpy.addFavoriteAnimal).toHaveBeenCalledWith(1);
    }));
  });

  describe("toggleFavorite — eliminar (ya existe)", () => {
    it("optimistic remove → HTTP success → se va del store", fakeAsync(() => {
      const animal = buildAnimal(1, "Simba");
      favoriteServiceSpy.addFavoriteAnimal.and.returnValue(of(animal));
      favoriteServiceSpy.removeFavoriteAnimal.and.returnValue(of(undefined as any));

      store.toggleFavorite(animal);
      flushMicrotasks();
      expect(store.isAnimalFavorite(1)).toBe(true);

      store.toggleFavorite(animal);
      flushMicrotasks();
      expect(store.isAnimalFavorite(1)).toBe(false);
      expect(store.entities().length).toBe(0);
      expect(favoriteServiceSpy.removeFavoriteAnimal).toHaveBeenCalledWith(1);
    }));
  });

  describe("toggleFavorite — rollback automatico", () => {
    it("agregar → HTTP falla → rollback automatico al estado anterior (vacío)", fakeAsync(() => {
      const animal = buildAnimal(1, "Simba");
      favoriteServiceSpy.addFavoriteAnimal.and.returnValue(
        throwError(() => new Error("Network error"))
      );

      store.toggleFavorite(animal);
      flushMicrotasks();

      expect(store.isAnimalFavorite(1)).toBe(false);
      expect(store.entities().length).toBe(0);
    }));

    it("eliminar → HTTP falla → rollback automatico (vuelve a favorito)", fakeAsync(() => {
      const animal = buildAnimal(1, "Simba");
      favoriteServiceSpy.addFavoriteAnimal.and.returnValue(of(animal));
      favoriteServiceSpy.removeFavoriteAnimal.and.returnValue(
        throwError(() => new Error("Network error"))
      );

      store.toggleFavorite(animal);
      flushMicrotasks();
      expect(store.isAnimalFavorite(1)).toBe(true);

      store.toggleFavorite(animal);
      flushMicrotasks();

      expect(store.isAnimalFavorite(1)).toBe(true);
      expect(store.entities().length).toBe(1);
    }));
  });

  describe("loadFavorites", () => {
    it("carga favoritos desde el servicio y los pone en el store", fakeAsync(() => {
      const animals = [buildAnimal(1, "Simba"), buildAnimal(2, "Nala")];
      favoriteServiceSpy.getFavoriteAnimals.and.returnValue(of(animals));

      store.loadFavorites();
      flushMicrotasks();

      expect(store.entities().length).toBe(2);
      expect(store.isAnimalFavorite(1)).toBe(true);
      expect(store.isAnimalFavorite(2)).toBe(true);
      expect(store.hasFavorites()).toBe(true);
    }));

    it("setea error cuando falla la carga", fakeAsync(() => {
      favoriteServiceSpy.getFavoriteAnimals.and.returnValue(
        throwError(() => new Error("Failed to load"))
      );

      store.loadFavorites();
      flushMicrotasks();

      expect(store.error()).toContain("Failed to load");
      expect(store.isLoading()).toBe(false);
    }));
  });
});
