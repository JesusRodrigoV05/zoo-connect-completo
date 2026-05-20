import { test, expect } from '@playwright/test';
import { AnimalDetailPage } from '../pages/animal-detail.page';
import { createBackendAnimal } from '../fixtures/animales';

test.describe('Detalle de Animal', () => {
  let page: AnimalDetailPage;

  test.beforeEach(async ({ page: pwPage }) => {
    page = new AnimalDetailPage(pwPage);

    await pwPage.route('**/favorite_animals/favorites*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ items: [] }),
      });
    });
  });

  test('carga de detalle — muestra toda la información del animal', async ({
    page: pwPage,
  }) => {
    const animal = createBackendAnimal({
      id_animal: 1,
      nombre_animal: 'Simba',
      age: 6,
      genero: true,
      estado_operativo: 'Saludable',
      descripcion: 'Un majestuoso león africano.',
    });

    await pwPage.route('**/animals/animals/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(animal),
      });
    });

    await page.navigate(1);
    await page.waitForContentToLoad();

    expect(await page.getAnimalName()).toBe('Simba');
  });

  test('estado operativo — badge tiene clase healthy cuando es Saludable', async ({
    page: pwPage,
  }) => {
    const animal = createBackendAnimal({
      id_animal: 2,
      estado_operativo: 'Saludable',
    });

    await pwPage.route('**/animals/animals/2', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(animal),
      });
    });

    await page.navigate(2);
    await page.waitForContentToLoad();

    const badgeClasses = await page.getStatusBadgeClasses();
    expect(badgeClasses).toContain('healthy');
  });

  test('género — muestra Macho o Hembra según el valor', async ({
    page: pwPage,
  }) => {
    const macho = createBackendAnimal({ id_animal: 3, genero: true });
    const hembra = createBackendAnimal({ id_animal: 4, genero: false });

    await pwPage.route('**/animals/animals/3', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(macho),
      });
    });

    await pwPage.route('**/animals/animals/4', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hembra),
      });
    });

    await page.navigate(3);
    await page.waitForContentToLoad();
    expect(await page.getGender()).toContain('Macho');

    await page.navigate(4);
    await page.waitForContentToLoad();
    expect(await page.getGender()).toContain('Hembra');
  });

  test('botón volver — regresa a la página anterior', async ({
    page: pwPage,
  }) => {
    const animal = createBackendAnimal({ id_animal: 5 });

    await pwPage.route('**/animals/animals/5', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(animal),
      });
    });

    await pwPage.goto('/animales');
    await pwPage.waitForLoadState('networkidle');

    await page.navigate(5);
    await page.waitForContentToLoad();

    await page.clickBack();

    await expect(pwPage).toHaveURL(/\/animales$/);
  });
});
