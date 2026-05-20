import { test, expect } from '@playwright/test';
import { AnimalDetailPage } from '../pages/animal-detail.page';
import { createBackendAnimal } from '../fixtures/animales';

test.describe('Favoritos', () => {
  let page: AnimalDetailPage;

  test.beforeEach(async ({ page: pwPage }) => {
    page = new AnimalDetailPage(pwPage);

    await pwPage.route('**/favorite_animals/favorites*', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ items: [] }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({}),
        });
      }
    });
  });

  test('botón favorito — visible en la página de detalle', async ({
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

    await page.navigate(1);
    await page.waitForContentToLoad();

    await expect(page.favoriteButton).toBeVisible();
  });

  test('estado inicial — corazón NO está activo para animal nuevo', async ({
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

    await page.navigate(2);
    await page.waitForContentToLoad();

    const initiallyActive = await page.isFavoriteActive();
    expect(initiallyActive).toBe(false);
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
        await route.continue();
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
});
