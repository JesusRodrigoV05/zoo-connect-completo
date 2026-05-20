import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of, throwError } from "rxjs";
import { AdminAnimales } from "@app/features/private/admin/services/admin-animales";
import { AdminAnimalesMultimedia } from "@app/features/private/admin/services/media/admin-animales-media";
import { ShowToast } from "@app/shared/services/show-toast";
import { EspecieStore } from "@stores/especies.store";
import { HabitatStore } from "@stores/habitat.store";
import { Animal, EstadoOperativo } from "@models/animales";
import CrearAnimal from "./crear-animal";

function buildAnimal(overrides?: Partial<Animal>): Animal {
  return {
    id_animal: 1,
    nombre: "Simba",
    genero: true,
    fecha_nacimiento: "2020-01-15",
    fecha_ingreso: "2021-03-01",
    procedencia: "Sabana",
    estado_operativo: EstadoOperativo.SALUDABLE,
    es_publico: true,
    descripcion: "Leon macho",
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
    ...overrides,
  };
}

describe("CP 22 y CP 18: CrearAnimal — Validación y registro", () => {
  let component: CrearAnimal;
  let fixture: ComponentFixture<CrearAnimal>;
  let adminAnimalesSpy: MockedObject<AdminAnimales>;
  let adminMediaSpy: MockedObject<AdminAnimalesMultimedia>;
  let toastSpy: MockedObject<ShowToast>;
  let especieStoreSpy: MockedObject<InstanceType<typeof EspecieStore>>;
  let habitatStoreSpy: MockedObject<InstanceType<typeof HabitatStore>>;
  let routerSpy: MockedObject<Router>;

  async function setup(params: { id?: string } = {}) {
    adminAnimalesSpy = {
      createAnimal: vi.fn(),
      getAnimalById: vi.fn(),
      updateAnimal: vi.fn(),
      getAllAnimals: vi.fn(),
      deleteAnimal: vi.fn(),
    } as unknown as MockedObject<AdminAnimales>;
    adminMediaSpy = {
      getAllMediaForAnimal: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, size: 10, totalPages: 0 })),
      uploadAnimalMedia: vi.fn(),
      deleteAnimalMedia: vi.fn(),
      getAllAnimalMedia: vi.fn(),
    } as unknown as MockedObject<AdminAnimalesMultimedia>;
    toastSpy = {
      showError: vi.fn(),
      showSuccess: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
      showContrast: vi.fn(),
      showSecondary: vi.fn(),
      clear: vi.fn(),
    } as unknown as MockedObject<ShowToast>;
    especieStoreSpy = {
      loadEspecies: vi.fn(),
      especies: vi.fn(() => []),
      activeEspecies: vi.fn(() => []),
      isLoading: vi.fn(() => false),
      error: vi.fn(() => null),
      totalCount: vi.fn(() => 0),
    } as unknown as MockedObject<InstanceType<typeof EspecieStore>>;
    habitatStoreSpy = {
      loadHabitats: vi.fn(),
      habitats: vi.fn(() => []),
      activeHabitats: vi.fn(() => []),
      isLoading: vi.fn(() => false),
      error: vi.fn(() => null),
    } as unknown as MockedObject<InstanceType<typeof HabitatStore>>;
    routerSpy = {
      navigate: vi.fn().mockResolvedValue(true),
    } as unknown as MockedObject<Router>;

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, CrearAnimal],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AdminAnimales, useValue: adminAnimalesSpy },
        { provide: AdminAnimalesMultimedia, useValue: adminMediaSpy },
        { provide: ShowToast, useValue: toastSpy },
        { provide: EspecieStore, useValue: especieStoreSpy },
        { provide: HabitatStore, useValue: habitatStoreSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(params) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearAnimal);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture };
  }

  describe("CP 22: Validación de campos obligatorios", () => {
    it("formulario vacío → invalido y muestra error al intentar enviar", async () => {
      // 1) Preparación
      const { component } = await setup();
      component["formSubmitted"].set(false);

      // 2) Lógica
      component["animalForm"].reset();
      component["formSubmitted"].set(true);
      component["onSubmit"]();

      // 3) Assert
      expect(component["animalForm"].invalid).toBe(true);
      expect(component["isInvalid"]("nombre")).toBe(true);
      expect(component["isInvalid"]("especie_id")).toBe(true);
      expect(component["isInvalid"]("habitat_id")).toBe(true);
      expect(toastSpy.showError).toHaveBeenCalledWith(
        "Formulario inválido",
        expect.stringMatching(/Revise los campos/i),
      );
    });

    it("solo nombre completado → sigue siendo invalido", async () => {
      // 1) Preparación
      const { component } = await setup();
      component["formSubmitted"].set(false);

      // 2) Lógica
      component["animalForm"].patchValue({ nombre: "Simba" });
      component["formSubmitted"].set(true);
      component["onSubmit"]();

      // 3) Assert
      expect(component["animalForm"].invalid).toBe(true);
      expect(component["isInvalid"]("especie_id")).toBe(true);
      expect(component["isInvalid"]("habitat_id")).toBe(true);
      expect(component["isInvalid"]("fecha_nacimiento")).toBe(true);
      expect(toastSpy.showError).toHaveBeenCalled();
    });

    it("nombre con menos de 2 caracteres → invalido", async () => {
      // 1) Preparación
      const { component } = await setup();

      // 2) Lógica
      component["animalForm"].patchValue({ nombre: "A" });
      component["formSubmitted"].set(true);

      // 3) Assert
      expect(component["animalForm"].get("nombre")?.invalid).toBe(true);
      expect(component["animalForm"].get("nombre")?.errors?.["minlength"]).toBeTruthy();
    });

    it("descripcion con menos de 10 caracteres → invalido", async () => {
      // 1) Preparación
      const { component } = await setup();

      // 2) Lógica
      component["animalForm"].patchValue({ descripcion: "Corto" });
      component["formSubmitted"].set(true);

      // 3) Assert
      expect(component["animalForm"].get("descripcion")?.invalid).toBe(true);
      expect(component["animalForm"].get("descripcion")?.errors?.["minlength"]).toBeTruthy();
    });
  });

  describe("CP 18: Registro de animal con datos completos", () => {
    it("formulario válido → llama createAnimal con datos correctos", async () => {
      // 1) Preparación
      const { component } = await setup();
      const newAnimal = buildAnimal({ id_animal: 42, nombre: "Simba" });
      adminAnimalesSpy.createAnimal.mockReturnValue(of(newAnimal));

      component["animalForm"].patchValue({
        nombre: "Simba",
        genero: true,
        fecha_nacimiento: "2020-01-15",
        fecha_ingreso: "2021-03-01",
        procedencia: "Sabana",
        estado_operativo: EstadoOperativo.SALUDABLE,
        es_publico: true,
        descripcion: "Un león majestuoso de la sabana africana",
        especie_id: 1,
        habitat_id: 2,
      });

      // 2) Lógica
      component["onSubmit"]();

      // 3) Assert
      expect(adminAnimalesSpy.createAnimal).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Simba",
          genero: true,
          procedencia: "Sabana",
          estado_operativo: EstadoOperativo.SALUDABLE,
          descripcion: "Un león majestuoso de la sabana africana",
          especie_id: 1,
          habitat_id: 2,
        }),
      );
      expect(toastSpy.showSuccess).toHaveBeenCalledWith(
        "Éxito",
        "Animal creado exitosamente.",
      );
      expect(component["createdAnimalId"]()).toBe(42);
      expect(component["isEditMode"]()).toBe(true);
    });

    it("formulario válido → muestra error si HTTP falla", async () => {
      // 1) Preparación
      const { component } = await setup();
      adminAnimalesSpy.createAnimal.mockReturnValue(
        throwError(() => new Error("Error de red")),
      );

      component["animalForm"].patchValue({
        nombre: "Simba",
        genero: true,
        fecha_nacimiento: "2020-01-15",
        fecha_ingreso: "2021-03-01",
        procedencia: "Sabana",
        estado_operativo: EstadoOperativo.SALUDABLE,
        es_publico: true,
        descripcion: "Un león majestuoso de la sabana africana",
        especie_id: 1,
        habitat_id: 2,
      });

      // 2) Lógica
      component["onSubmit"]();

      // 3) Assert
      expect(toastSpy.showError).toHaveBeenCalledWith(
        "Error",
        expect.stringMatching(/Error de red/i),
      );
    });
  });
});
