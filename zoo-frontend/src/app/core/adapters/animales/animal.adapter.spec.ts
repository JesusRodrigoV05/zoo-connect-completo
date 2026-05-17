import { AnimalAdapter, BackendAnimalResponse } from "@adapters/animales";
import { Animal, CreateAnimal, EstadoOperativo, MediaAnimal } from "@models/animales";
import { Especie } from "@models/animales/especie.model";
import { Habitat } from "@models/habitat";

function buildBackendAnimal(overrides?: Partial<BackendAnimalResponse>): BackendAnimalResponse {
  return {
    id_animal: 1,
    nombre_animal: "Simba",
    genero: true,
    fecha_nacimiento: "2020-01-15",
    fecha_ingreso: "2021-03-01",
    procedencia_animal: "Sabana Africana",
    estado_operativo: EstadoOperativo.SALUDABLE,
    es_publico: true,
    descripcion: "Leon macho adulto",
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
      descripcion_especie: "Gran felino africano",
      is_active: true,
    },
    habitat: {
      id_habitat: 1,
      nombre_habitat: "Sabana",
      tipo_habitat: "Tropical",
      descripcion_habitat: "Sabana africana",
      condiciones_climaticas: "Calido y seco",
      is_active: true,
    },
    media: [
      {
        id_media_animal: 1,
        tipo_medio: true,
        url_animal: "https://example.com/simba.jpg",
        titulo_media_animal: "Simba portrait",
        descripcion_media_animal: "Foto de Simba",
        public_id: "simba_001",
      },
    ],
    age: 4,
    ...overrides,
  };
}

function buildExpectedAnimal(overrides?: Partial<Animal>): Animal {
  return {
    id_animal: 1,
    nombre: "Simba",
    genero: true,
    fecha_nacimiento: "2020-01-15",
    fecha_ingreso: "2021-03-01",
    procedencia: "Sabana Africana",
    estado_operativo: EstadoOperativo.SALUDABLE,
    es_publico: true,
    descripcion: "Leon macho adulto",
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
      descripcion: "Gran felino africano",
      isActive: true,
    },
    habitat: {
      id: 1,
      nombre: "Sabana",
      tipo: "Tropical",
      descripcion: "Sabana africana",
      condicionesClimaticas: "Calido y seco",
      isActive: true,
    },
    media: [
      {
        id_media: 1,
        tipo_medio: true,
        url: "https://example.com/simba.jpg",
        titulo: "Simba portrait",
        descripcion: "Foto de Simba",
        public_id: "simba_001",
      },
    ],
    age: 4,
    ...overrides,
  };
}

describe("Test #5: AnimalAdapter — Mapeo bidireccional completo", () => {
  describe("fromBackend", () => {
    it("mapea todos los campos correctamente incluyendo especie/habitat anidados y media", () => {
      const backend = buildBackendAnimal();
      const result = AnimalAdapter.fromBackend(backend);
      const expected = buildExpectedAnimal();

      expect(result).toEqual(expected);
    });

    it("mapea correctamente multiple media items", () => {
      const backend = buildBackendAnimal({
        media: [
          {
            id_media_animal: 1,
            tipo_medio: true,
            url_animal: "https://example.com/simba1.jpg",
            titulo_media_animal: "Foto 1",
            descripcion_media_animal: "Desc 1",
            public_id: "simba_001",
          },
          {
            id_media_animal: 2,
            tipo_medio: false,
            url_animal: "https://example.com/simba2.mp4",
            titulo_media_animal: "Video 1",
            descripcion_media_animal: "Desc 2",
            public_id: "simba_002",
          },
        ],
      });

      const result = AnimalAdapter.fromBackend(backend);

      expect(result.media.length).toBe(2);
      expect(result.media[0].url).toBe("https://example.com/simba1.jpg");
      expect(result.media[1].url).toBe("https://example.com/simba2.mp4");
      expect(result.media[1].tipo_medio).toBe(false);
    });

    it("mapea array vacio de media cuando backend envia []", () => {
      const backend = buildBackendAnimal({ media: [] });
      const result = AnimalAdapter.fromBackend(backend);

      expect(result.media).toEqual([]);
    });
  });

  describe("toCreateRequest", () => {
    it("omite campos calculados: id_animal, especie, habitat, media, age", () => {
      const animal: CreateAnimal = {
        nombre: "Simba",
        genero: true,
        fecha_nacimiento: "2020-01-15",
        fecha_ingreso: "2021-03-01",
        procedencia: "Sabana",
        estado_operativo: EstadoOperativo.SALUDABLE,
        es_publico: true,
        descripcion: "Leon",
        especie_id: 1,
        habitat_id: 1,
      };

      const result = AnimalAdapter.toCreateRequest(animal);

      expect(Object.keys(result)).not.toContain("id_animal");
      expect(result).toEqual({
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
      });
    });

    it("transforma nombres de campos frontend a formato backend", () => {
      const animal: CreateAnimal = {
        nombre: "Nala",
        genero: false,
        fecha_nacimiento: "2021-06-01",
        fecha_ingreso: "2022-01-01",
        procedencia: "Kenia",
        estado_operativo: EstadoOperativo.EN_TRATAMIENTO,
        es_publico: false,
        descripcion: "Leona",
        especie_id: 1,
        habitat_id: 2,
      };

      const result = AnimalAdapter.toCreateRequest(animal);

      expect(result.nombre_animal).toBe("Nala");
      expect(result.procedencia_animal).toBe("Kenia");
      expect(result.genero).toBe(false);
      expect(result.es_publico).toBe(false);
    });
  });

  describe("toUpdateRequest", () => {
    it("mapea SOLO el campo proporcionado (patch real)", () => {
      const partial: Partial<CreateAnimal> = { nombre: "Nuevo Nombre" };

      const result = AnimalAdapter.toUpdateRequest(partial);

      expect(Object.keys(result)).toEqual(["nombre_animal"]);
      expect(result.nombre_animal).toBe("Nuevo Nombre");
    });

    it("NO incluye campos undefined", () => {
      const partial: Partial<CreateAnimal> = {
        nombre: "Mufasa",
        genero: undefined as any,
        descripcion: undefined as any,
      };

      const result = AnimalAdapter.toUpdateRequest(partial);

      expect(result.nombre_animal).toBe("Mufasa");
      expect(Object.keys(result)).not.toContain("genero");
      expect(Object.keys(result)).not.toContain("descripcion");
      expect(Object.keys(result).length).toBe(1);
    });

    it("mapea multiples campos cuando se proporcionan", () => {
      const partial: Partial<CreateAnimal> = {
        nombre: "Scar",
        estado_operativo: EstadoOperativo.EN_CUARENTENA,
        habitat_id: 3,
      };

      const result = AnimalAdapter.toUpdateRequest(partial);

      expect(result.nombre_animal).toBe("Scar");
      expect(result.estado_operativo).toBe(EstadoOperativo.EN_CUARENTENA);
      expect(result.habitat_id).toBe(3);
      expect(Object.keys(result).length).toBe(3);
    });
  });

  describe("getGeneroTexto", () => {
    it("devuelve Macho para genero true", () => {
      expect(AnimalAdapter.getGeneroTexto(true)).toBe("Macho");
    });

    it("devuelve Hembra para genero false", () => {
      expect(AnimalAdapter.getGeneroTexto(false)).toBe("Hembra");
    });
  });

  describe("getEstadoClass", () => {
    it("devuelve clase CSS correcta para cada estado conocido", () => {
      expect(AnimalAdapter.getEstadoClass(EstadoOperativo.SALUDABLE)).toBe("estado-saludable");
      expect(AnimalAdapter.getEstadoClass(EstadoOperativo.EN_TRATAMIENTO)).toBe("estado-tratamiento");
      expect(AnimalAdapter.getEstadoClass(EstadoOperativo.EN_CUARENTENA)).toBe("estado-cuarentena");
      expect(AnimalAdapter.getEstadoClass(EstadoOperativo.TRASLADADO)).toBe("estado-trasladado");
      expect(AnimalAdapter.getEstadoClass(EstadoOperativo.FALLECIDO)).toBe("estado-fallecido");
    });

    it("devuelve string vacio para estado desconocido", () => {
      expect(AnimalAdapter.getEstadoClass("Desconocido" as any)).toBe("");
    });
  });

  describe("getEstadoColor", () => {
    it("devuelve color correcto para cada estado conocido", () => {
      expect(AnimalAdapter.getEstadoColor(EstadoOperativo.SALUDABLE)).toBe("success");
      expect(AnimalAdapter.getEstadoColor(EstadoOperativo.EN_TRATAMIENTO)).toBe("info");
      expect(AnimalAdapter.getEstadoColor(EstadoOperativo.EN_CUARENTENA)).toBe("warn");
      expect(AnimalAdapter.getEstadoColor(EstadoOperativo.TRASLADADO)).toBe("secondary");
      expect(AnimalAdapter.getEstadoColor(EstadoOperativo.FALLECIDO)).toBe("danger");
    });

    it("devuelve secondary para estado desconocido", () => {
      expect(AnimalAdapter.getEstadoColor("Desconocido" as any)).toBe("secondary");
    });
  });
});
