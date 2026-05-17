import { ComponentFixture, fakeAsync, flush, flushMicrotasks, TestBed, tick } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { By } from "@angular/platform-browser";
import { Animal, EstadoOperativo } from "@models/animales";
import { BackendAnimalResponse } from "@adapters/animales";
import { GetAnimales } from "../../services/animales";
import { InfiniteScroll } from "@directive/infinite-scroll";
import { MainContainer } from "@app/shared/components/main-container";
import { AnimalItem } from "../../components/animal-item";
import Animales from "./animales";

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

function buildPaginatedResponse(items: BackendAnimalResponse[], page: number, size: number, total: number) {
  return {
    items,
    total,
    page,
    size,
    totalPages: Math.ceil(total / size),
  };
}

describe("Test #1: AnimalesScreen — Paginación + infinite scroll + fakeAsync", () => {
  let component: Animales;
  let fixture: ComponentFixture<Animales>;
  let httpMock: HttpTestingController;

  function createPageItems(count: number, startId: number): BackendAnimalResponse[] {
    return Array.from({ length: count }, (_, i) =>
      buildBackendAnimal(startId + i, `Animal ${startId + i}`)
    );
  }

  function flushInitialRequest() {
    const req = httpMock.expectOne((request) =>
      request.url.includes("/animals/animals") &&
      request.params.get("page") === "1"
    );
    return req;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideRouter([]),
        GetAnimales,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Animales);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it("carga inicial → 12 animales, isLoading=false", fakeAsync(() => {
    const items = createPageItems(12, 1);
    flushInitialRequest().flush(buildPaginatedResponse(items, 1, 12, 100));
    tick();
    fixture.detectChanges();

    expect(component["animals"]().length).toBe(12);
    expect(component["isLoading"]()).toBe(false);
    expect(component["hasMoreData"]()).toBe(true);
  }));

  it("scroll → página 2, se acumulan 24, no se pierden anteriores", fakeAsync(() => {
    const page1 = createPageItems(12, 1);
    flushInitialRequest().flush(buildPaginatedResponse(page1, 1, 12, 100));
    tick();
    fixture.detectChanges();

    expect(component["animals"]().length).toBe(12);

    component.onScrollDown();
    tick();
    fixture.detectChanges();

    const req2 = httpMock.expectOne((request) =>
      request.params.get("page") === "2"
    );
    const page2 = createPageItems(12, 13);
    req2.flush(buildPaginatedResponse(page2, 2, 12, 100));
    tick();
    fixture.detectChanges();

    expect(component["animals"]().length).toBe(24);
    expect(component["animals"]()[0].nombre).toBe("Animal 1");
    expect(component["animals"]()[12].nombre).toBe("Animal 13");
  }));

  it("scroll mientras isLoading=true → NO hace request duplicado", fakeAsync(() => {
    const page1 = createPageItems(12, 1);
    flushInitialRequest().flush(buildPaginatedResponse(page1, 1, 12, 100));
    tick();
    fixture.detectChanges();

    component.onScrollDown();
    tick();

    component.onScrollDown();
    component.onScrollDown();
    component.onScrollDown();
    tick();
    fixture.detectChanges();

    const requests = httpMock.match((request) =>
      request.url.includes("/animals/animals") &&
      request.params.get("page") === "2"
    );
    expect(requests.length).toBe(1);

    requests[0].flush(buildPaginatedResponse(createPageItems(12, 13), 2, 12, 100));
    tick();
  }));

  it("backend devuelve menos de 12 → hasMoreData=false", fakeAsync(() => {
    const page1 = createPageItems(12, 1);
    flushInitialRequest().flush(buildPaginatedResponse(page1, 1, 12, 100));
    tick();
    fixture.detectChanges();

    component.onScrollDown();
    tick();

    const req2 = httpMock.expectOne((request) =>
      request.params.get("page") === "2"
    );
    const partialPage = createPageItems(5, 13);
    req2.flush(buildPaginatedResponse(partialPage, 2, 12, 100));
    tick();
    fixture.detectChanges();

    expect(component["hasMoreData"]()).toBe(false);
  }));

  it("error HTTP → isLoading vuelve a false", fakeAsync(() => {
    const page1 = createPageItems(12, 1);
    flushInitialRequest().flush(buildPaginatedResponse(page1, 1, 12, 100));
    tick();
    fixture.detectChanges();

    component.onScrollDown();
    tick();

    const req2 = httpMock.expectOne((request) =>
      request.params.get("page") === "2"
    );
    req2.flush("Server error", { status: 500, statusText: "Internal Server Error" });
    tick();
    fixture.detectChanges();

    expect(component["isLoading"]()).toBe(false);
  }));

  it("hasMoreData=false → no muestra loading trigger", fakeAsync(() => {
    const page1 = createPageItems(12, 1);
    flushInitialRequest().flush(buildPaginatedResponse(page1, 1, 12, 100));
    tick();
    fixture.detectChanges();

    component.onScrollDown();
    tick();

    const req2 = httpMock.expectOne((request) =>
      request.params.get("page") === "2"
    );
    const partialPage = createPageItems(3, 13);
    req2.flush(buildPaginatedResponse(partialPage, 2, 12, 100));
    tick();
    fixture.detectChanges();

    const trigger = fixture.debugElement.query(By.css(".loading-trigger"));
    const endMessage = fixture.debugElement.query(By.css(".end-message"));

    expect(trigger).toBeNull();
    expect(endMessage).not.toBeNull();
  }));

  it("renderiza AnimalItem por cada animal cargado", fakeAsync(() => {
    const items = createPageItems(12, 1);
    flushInitialRequest().flush(buildPaginatedResponse(items, 1, 12, 100));
    tick();
    fixture.detectChanges();

    const animalItems = fixture.debugElement.queryAll(By.directive(AnimalItem));
    expect(animalItems.length).toBe(12);
  }));
});
