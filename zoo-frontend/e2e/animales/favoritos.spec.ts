import { test, expect } from '@playwright/test';
import { AnimalDetailPage } from '../pages/animal-detail.page';
import { createBackendAnimal } from '../fixtures/animales';

test.describe('Favoritos', () => {
  let page: AnimalDetailPage;

  test.beforeEach(async ({ page: pwPage }) => {
    page = new AnimalDetailPage(pwPage);
  });

  test('agregar favorito — corazón se pone rojo al hacer click', async ({
    page: pwPage,
  }) => {
    const animal = createBackendAnimal({ id_animal: 1 });

    await pwPage.route('**/animals/animals/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(animal),
      });
    });

    await pwPage.route('**/favorite_animals/favorites*', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ animal }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        });
      }
    });

    await page.navigate(1);
    await page.waitForContentToLoad();

    const initiallyActive = await page.isFavoriteActive();
    expect(initiallyActive).toBe(false);

    await page.clickFavorite();
    await pwPage.waitForTimeout(500);

    const afterClickActive = await page.isFavoriteActive();
    expect(afterClickActive).toBe(true);
  });

  test('quitar favorito — corazón vuelve a outline al hacer click', async ({
    page: pwPage,
  }) => {
    const animal = createBackendAnimal({ id_animal: 2 });

    await pwPage.route('**/animals/animals/2', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(animal),
      });
    });

    await pwPage.route('**/favorite_animals/favorites*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [{ animal }] }),
        });
      } else if (method === 'DELETE') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    });

    await page.navigate(2);
    await page.waitForContentToLoad();

    await page.clickFavorite();
    await pwPage.waitForTimeout(500);

    const afterClickActive = await page.isFavoriteActive();
    expect(afterClickActive).toBe(false);
  });

  test('rollback en error — corazón NO cambia si falla el POST', async ({
    page: pwPage,
  }) => {
    const animal = createBackendAnimal({ id_animal: 3 });

    await pwPage.route('**/animals/animals/3', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(animal),
      });
    });

    await pwPage.route('**/favorite_animals/favorites*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        });
      } else if (method === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    });

    await page.navigate(3);
    await page.waitForContentToLoad();

    const initiallyActive = await page.isFavoriteActive();
    expect(initiallyActive).toBe(false);

    await page.clickFavorite();
    await pwPage.waitForTimeout(500);

    const afterErrorActive = await page.isFavoriteActive();
    expect(afterErrorActive).toBe(false);
  });

  test('persistencia entre vistas — favorito se mantiene al volver y entrar de nuevo', async ({
    page: pwPage,
  }) => {
    const animal = createBackendAnimal({ id_animal: 4 });

    let favoritesList: any[] = [];
    await pwPage.route('**/animals/animals/4', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(animal),
      });
    });

    await pwPage.route('**/favorite_animals/favorites*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: favoritesList }),
        });
      } else if (method === 'POST') {
        favoritesList.push({ animal });
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ animal }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    });

    await page.navigate(4);
    await page.waitForContentToLoad();

    await page.clickFavorite();
    await pwPage.waitForTimeout(500);

    const firstCheck = await page.isFavoriteActive();
    expect(firstCheck).toBe(true);

    await page.navigate(4);
    await page.waitForContentToLoad();

    const secondCheck = await page.isFavoriteActive();
    expect(secondCheck).toBe(true);
  });
});
