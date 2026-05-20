import type { MockedObject } from "vitest";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, convertToParamMap, Router } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { of, throwError } from "rxjs";
import { AdminEspecies } from "@app/features/private/admin/services/admin-especies";
import { ShowToast } from "@app/shared/services/show-toast";
import { Especie } from "@app/core/models/animales/especie.model";
import CrearEspecie from "./crear-especie";

function buildEspecie(overrides?: Partial<Especie>): Especie {
  return {
    idEspecie: 1,
    nombreCientifico: "Panthera leo",
    nombreComun: "Leon",
    filo: "Chordata",
    clase: "Mammalia",
    orden: "Carnivora",
    familia: "Felidae",
    descripcion: "Gran felino africano",
    isActive: true,
    ...overrides,
  };
}

describe("CP 17: CrearEspecie — Registra y gestiona especies", () => {
  let component: CrearEspecie;
  let fixture: ComponentFixture<CrearEspecie>;
  let adminEspeciesSpy: MockedObject<AdminEspecies>;
  let toastSpy: MockedObject<ShowToast>;
  let routerSpy: MockedObject<Router>;

  async function setup(params: { id?: string } = {}) {
    adminEspeciesSpy = {
      createSpecies: vi.fn(),
      getSpeciesById: vi.fn(),
      updateSpecies: vi.fn(),
      deleteSpecies: vi.fn(),
      getAllSpecies: vi.fn(),
      patchSpecies: vi.fn(),
      toggleSpeciesStatus: vi.fn(),
    } as unknown as MockedObject<AdminEspecies>;
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
      imports: [HttpClientTestingModule, CrearEspecie],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AdminEspecies, useValue: adminEspeciesSpy },
        { provide: ShowToast, useValue: toastSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(params) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearEspecie);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return { component, fixture };
  }

  describe("CP 17: Registro de especie con datos completos", () => {
    it("formulario válido → llama createSpecies con todos los campos taxonomicos", async () => {
      // 1) Preparación
      const { component } = await setup();
      const newEspecie = buildEspecie({ idEspecie: 42, nombreComun: "Leon" });
      adminEspeciesSpy.createSpecies.mockReturnValue(of(newEspecie));

      component["especieForm"].patchValue({
        nombreCientifico: "Panthera leo",
        nombreComun: "Leon",
        filo: "Chordata",
        clase: "Mammalia",
        orden: "Carnivora",
        familia: "Felidae",
        descripcion: "Gran felino africano cazador",
      });
      component.activo = true;

      // 2) Lógica
      component["onSubmit"]();

      // 3) Assert
      expect(adminEspeciesSpy.createSpecies).toHaveBeenCalledWith(
        expect.objectContaining({
          nombreCientifico: "Panthera leo",
          nombreComun: "Leon",
          filo: "Chordata",
          clase: "Mammalia",
          orden: "Carnivora",
          familia: "Felidae",
          descripcion: "Gran felino africano cazador",
        }),
      );
      expect(toastSpy.showSuccess).toHaveBeenCalledWith(
        "Éxito",
        expect.stringMatching(/Leon.*creada/i),
      );
    });

    it("formulario vacío → invalido y muestra error", async () => {
      // 1) Preparación
      const { component } = await setup();
      component["formSubmitted"].set(false);

      // 2) Lógica
      component["especieForm"].reset();
      component["formSubmitted"].set(true);
      component["onSubmit"]();

      // 3) Assert
      expect(component["especieForm"].invalid).toBe(true);
      expect(component["isInvalid"]("nombreCientifico")).toBe(true);
      expect(component["isInvalid"]("nombreComun")).toBe(true);
      expect(component["isInvalid"]("filo")).toBe(true);
      expect(component["isInvalid"]("clase")).toBe(true);
      expect(component["isInvalid"]("orden")).toBe(true);
      expect(component["isInvalid"]("familia")).toBe(true);
      expect(component["isInvalid"]("descripcion")).toBe(true);
      expect(toastSpy.showError).toHaveBeenCalledWith(
        "Formulario inválido",
        expect.stringMatching(/complete todos los campos/i),
      );
    });

    it("nombreCientifico con menos de 3 caracteres → invalido (minLength 3)", async () => {
      // 1) Preparación
      const { component } = await setup();

      // 2) Lógica
      component["especieForm"].patchValue({ nombreCientifico: "Pa" });
      component["formSubmitted"].set(true);

      // 3) Assert
      expect(component["especieForm"].get("nombreCientifico")?.invalid).toBe(true);
      expect(component["especieForm"].get("nombreCientifico")?.errors?.["minlength"]).toBeTruthy();
    });

    it("descripcion con menos de 10 caracteres → invalido (minLength 10)", async () => {
      // 1) Preparación
      const { component } = await setup();

      // 2) Lógica
      component["especieForm"].patchValue({ descripcion: "Corta" });
      component["formSubmitted"].set(true);

      // 3) Assert
      expect(component["especieForm"].get("descripcion")?.invalid).toBe(true);
      expect(component["especieForm"].get("descripcion")?.errors?.["minlength"]).toBeTruthy();
    });

    it("error HTTP 409 → muestra mensaje de especie duplicada", async () => {
      // 1) Preparación
      const { component } = await setup();
      adminEspeciesSpy.createSpecies.mockReturnValue(
        throwError({ status: 409, message: "Conflict" }),
      );

      component["especieForm"].patchValue({
        nombreCientifico: "Panthera leo",
        nombreComun: "Leon",
        filo: "Chordata",
        clase: "Mammalia",
        orden: "Carnivora",
        familia: "Felidae",
        descripcion: "Gran felino africano cazador",
      });
      component.activo = true;

      // 2) Lógica
      component["onSubmit"]();

      // 3) Assert
      expect(toastSpy.showError).toHaveBeenCalledWith(
        "Error",
        expect.stringMatching(/existe.*nombre cient.fico/i),
      );
    });

    it("error HTTP 400 → muestra mensaje de datos invalidos", async () => {
      // 1) Preparación
      const { component } = await setup();
      adminEspeciesSpy.createSpecies.mockReturnValue(
        throwError({ status: 400, message: "Bad Request" }),
      );

      component["especieForm"].patchValue({
        nombreCientifico: "Panthera leo",
        nombreComun: "Leon",
        filo: "Chordata",
        clase: "Mammalia",
        orden: "Carnivora",
        familia: "Felidae",
        descripcion: "Gran felino africano cazador",
      });
      component.activo = true;

      // 2) Lógica
      component["onSubmit"]();

      // 3) Assert
      expect(toastSpy.showError).toHaveBeenCalledWith(
        "Error",
        expect.stringMatching(/datos inv.lidos/i),
      );
    });
  });
});
