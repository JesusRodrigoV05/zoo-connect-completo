import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of, throwError } from "rxjs";
import { AdminHabitat } from "@app/features/private/admin/services/admin-habitat";
import { AdminHabitatsMedia } from "@app/features/private/admin/services/media/admin-habitats-media";
import { ShowToast } from "@app/shared/services/show-toast";
import { Habitat } from "@app/core/models/habitat";
import CrearHabitat from "./crear-habitat";

function buildHabitat(overrides?: Partial<Habitat>): Habitat {
  return {
    id: 1,
    nombre: "Sabana Africana",
    tipo: "Tropical",
    descripcion: "Sabana africana con clima calido",
    condicionesClimaticas: "Calido y seco",
    isActive: true,
    ...overrides,
  };
}

describe("CP 16: CrearHabitat — Registra y gestiona hábitats", () => {
  let component: CrearHabitat;
  let fixture: ComponentFixture<CrearHabitat>;
  let adminHabitatSpy: MockedObject<AdminHabitat>;
  let adminMediaSpy: MockedObject<AdminHabitatsMedia>;
  let toastSpy: MockedObject<ShowToast>;
  let routerSpy: MockedObject<Router>;

  async function setup(params: { id?: string } = {}) {
    adminHabitatSpy = {
      createHabitat: vi.fn(),
      getHabitatById: vi.fn(),
      updateHabitat: vi.fn(),
      deleteHabitat: vi.fn(),
      getAllHabitats: vi.fn(),
      validateHabitatData: vi.fn(),
      searchHabitatsByName: vi.fn(),
    } as unknown as MockedObject<AdminHabitat>;
    adminMediaSpy = {
      getAllMediaForHabitat: vi.fn().mockReturnValue(of({ items: [], total: 0, page: 1, size: 10, totalPages: 0 })),
      uploadHabitatMedia: vi.fn(),
      deleteHabitatMedia: vi.fn(),
    } as unknown as MockedObject<AdminHabitatsMedia>;
    toastSpy = {
      showError: vi.fn(),
      showSuccess: vi.fn(),
      showWarning: vi.fn(),
      showInfo: vi.fn(),
      showContrast: vi.fn(),
      showSecondary: vi.fn(),
      clear: vi.fn(),
    } as unknown as MockedObject<ShowToast>;
    routerSpy = {
      navigate: vi.fn().mockResolvedValue(true),
    } as unknown as MockedObject<Router>;

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, NoopAnimationsModule, CrearHabitat],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AdminHabitat, useValue: adminHabitatSpy },
        { provide: AdminHabitatsMedia, useValue: adminMediaSpy },
        { provide: ShowToast, useValue: toastSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(params) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearHabitat);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture };
  }

  describe("CP 16: Registro de hábitat con datos completos", () => {
    it("formulario válido → llama createHabitat con nombre, tipo, descripcion y condiciones", async () => {
      // 1) Preparación
      const { component } = await setup();
      const newHabitat = buildHabitat({ id: 42, nombre: "Sabana Africana" });
      adminHabitatSpy.createHabitat.mockReturnValue(of(newHabitat));

      component["habitatForm"].patchValue({
        nombre: "Sabana Africana",
        tipo: "Tropical",
        descripcion: "Sabana africana con clima calido y vegetacion dispersa",
        condicionesClimaticas: "Calido y seco",
      });
      component.activo = true;

      // 2) Lógica
      component["onSubmit"]();

      // 3) Assert
      expect(adminHabitatSpy.createHabitat).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: "Sabana Africana",
          tipo: "Tropical",
          descripcion: "Sabana africana con clima calido y vegetacion dispersa",
          condicionesClimaticas: "Calido y seco",
        }),
      );
      expect(toastSpy.showSuccess).toHaveBeenCalledWith(
        "Éxito",
        "Hábitat creado exitosamente",
      );
      expect(component["createdHabitatId"]()).toBe(42);
      expect(component["isEditMode"]()).toBe(true);
    });

    it("formulario vacío → invalido y muestra error", async () => {
      // 1) Preparación
      const { component } = await setup();
      component["formSubmitted"].set(false);

      // 2) Lógica
      component["habitatForm"].reset();
      component["formSubmitted"].set(true);
      component["onSubmit"]();

      // 3) Assert
      expect(component["habitatForm"].invalid).toBe(true);
      expect(component["isInvalid"]("nombre")).toBe(true);
      expect(component["isInvalid"]("tipo")).toBe(true);
      expect(component["isInvalid"]("descripcion")).toBe(true);
      expect(component["isInvalid"]("condicionesClimaticas")).toBe(true);
      expect(toastSpy.showError).toHaveBeenCalledWith(
        "Error",
        expect.stringMatching(/completa todos los campos/i),
      );
    });

    it("nombre con 1 caracter → invalido (minLength 2)", async () => {
      // 1) Preparación
      const { component } = await setup();

      // 2) Lógica
      component["habitatForm"].patchValue({ nombre: "S" });
      component["formSubmitted"].set(true);

      // 3) Assert
      expect(component["habitatForm"].get("nombre")?.invalid).toBe(true);
      expect(component["habitatForm"].get("nombre")?.errors?.["minlength"]).toBeTruthy();
    });

    it("descripcion con menos de 10 caracteres → invalido", async () => {
      // 1) Preparación
      const { component } = await setup();

      // 2) Lógica
      component["habitatForm"].patchValue({ descripcion: "Corta" });
      component["formSubmitted"].set(true);

      // 3) Assert
      expect(component["habitatForm"].get("descripcion")?.invalid).toBe(true);
      expect(component["habitatForm"].get("descripcion")?.errors?.["minlength"]).toBeTruthy();
    });

    it("condicionesClimaticas con menos de 5 caracteres → invalido", async () => {
      // 1) Preparación
      const { component } = await setup();

      // 2) Lógica
      component["habitatForm"].patchValue({ condicionesClimaticas: "Cal" });
      component["formSubmitted"].set(true);

      // 3) Assert
      expect(component["habitatForm"].get("condicionesClimaticas")?.invalid).toBe(true);
      expect(component["habitatForm"].get("condicionesClimaticas")?.errors?.["minlength"]).toBeTruthy();
    });

    it("error HTTP → muestra toast de error", async () => {
      // 1) Preparación
      const { component } = await setup();
      adminHabitatSpy.createHabitat.mockReturnValue(
        throwError(() => new Error("Error de red")),
      );

      component["habitatForm"].patchValue({
        nombre: "Sabana Africana",
        tipo: "Tropical",
        descripcion: "Sabana africana con clima calido y vegetacion dispersa",
        condicionesClimaticas: "Calido y seco",
      });
      component.activo = true;

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
