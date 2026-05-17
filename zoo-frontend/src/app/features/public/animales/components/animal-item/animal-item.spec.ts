import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter, Router } from "@angular/router";
import { Animal, EstadoOperativo } from "@models/animales";
import { AnimalItem } from "./animal-item";

function buildAnimal(overrides?: Partial<Animal>): Animal {
  return {
    id_animal: 42,
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
    media: [
      {
        id_media: 1,
        tipo_medio: true,
        url: "https://example.com/simba.jpg",
        titulo: "Simba",
        descripcion: "Foto",
        public_id: "simba_001",
      },
    ],
    age: 4,
    ...overrides,
  };
}

describe("Test #4: AnimalItem component — Computed signals + navegación + edge cases", () => {
  let component: AnimalItem;
  let fixture: ComponentFixture<AnimalItem>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimalItem],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalItem);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it("animalImage() devuelve media[0].url cuando el animal CON media", () => {
    fixture.componentRef.setInput("animal", buildAnimal());
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css("img"));
    expect(img.nativeElement.src).toContain("https://example.com/simba.jpg");
  });

  it("animalImage() devuelve placeholder cuando animal SIN media", () => {
    fixture.componentRef.setInput("animal", buildAnimal({ media: [] }));
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css("img"));
    expect(img.nativeElement.src).toContain("assets/placeholder-zoo.jpg");
  });

  it("animalImage() devuelve placeholder cuando media es undefined", () => {
    fixture.componentRef.setInput("animal", buildAnimal({ media: undefined as any }));
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css("img"));
    expect(img.nativeElement.src).toContain("assets/placeholder-zoo.jpg");
  });

  it("renderiza el nombre del animal en el DOM", () => {
    fixture.componentRef.setInput("animal", buildAnimal({ nombre: "Nala" }));
    fixture.detectChanges();

    const heading = fixture.debugElement.query(By.css("h3"));
    expect(heading.nativeElement.textContent).toContain("Nala");
  });

  it("renderiza el nombre comun de la especie", () => {
    fixture.componentRef.setInput("animal", buildAnimal({
      especie: {
        idEspecie: 2,
        nombreCientifico: "Loxodonta africana",
        nombreComun: "Elefante Africano",
        filo: "Chordata",
        clase: "Mammalia",
        orden: "Proboscidea",
        familia: "Elephantidae",
        descripcion: "Elefante",
        isActive: true,
      },
    }));
    fixture.detectChanges();

    const speciesBadge = fixture.debugElement.query(By.css(".species-badge"));
    expect(speciesBadge.nativeElement.textContent).toContain("Elefante Africano");
  });

  it("click en la card navega a /animales/:id con el id correcto", fakeAsync(() => {
    const navigateSpy = spyOn(router, "navigate");
    fixture.componentRef.setInput("animal", buildAnimal({ id_animal: 99 }));
    fixture.detectChanges();

    const card = fixture.debugElement.query(By.css(".animal-card"));
    card.triggerEventHandler("click", null);
    flushMicrotasks();

    expect(navigateSpy).toHaveBeenCalledWith(["/animales", 99]);
  }));

  it("view-transition-name se genera con el id del animal", () => {
    fixture.componentRef.setInput("animal", buildAnimal({ id_animal: 123 }));
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css("img"));
    const vtn = img.nativeElement.getAttribute("ng-reflect-view-transition-name")
      ?? img.nativeElement.style.viewTransitionName;
    expect(vtn).toBe("animal-img-123");
  });
});
