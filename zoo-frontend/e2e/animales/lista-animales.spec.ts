import { test, expect } from '@playwright/test';
import { AnimalesListPage } from '../pages/animales-list.page';
import {
  createBackendAnimals,
  createPaginatedResponse,
} from '../fixtures/animales';

test.describe('Lista de Animales', () => {
  let page: AnimalesListPage;

  test.beforeEach(async ({ page: pwPage }) => {
    page = new AnimalesListPage(pwPage);
  });

  test('carga inicial — muestra 12 animales con nombre y especie', async ({
    page: pwPage,
  }) => {
    const animals = createBackendAnimals(12);
    const response = createPaginatedResponse(animals, 1, 25);

    await pwPage.route('**/animals/animals*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });

    await page.navigate();
    await pwPage.waitForLoadState('networkidle');

    const cards = page.animalCards;
    await expect(cards).toHaveCount(12);
  });

  test('infinite scroll — carga más animales al hacer scroll', async ({
    page: pwPage,
  }) => {
    await pwPage.route('**/animals/animals*', async (route) => {
      const url = new URL(route.request().url());
      const currentPage = parseInt(url.searchParams.get('page') || '1', 10);

      const isFirstPage = currentPage === 1;
      const items = createBackendAnimals(isFirstPage ? 12 : 12);
      const response = createPaginatedResponse(items, currentPage, 25);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });

    await page.navigate();
    await pwPage.waitForLoadState('networkidle');

    const initialCount = await page.getCardCount();
    expect(initialCount).toBe(12);

    await page.scrollToBottom();
    await pwPage.waitForLoadState('networkidle');

    const afterScrollCount = await page.getCardCount();
    expect(afterScrollCount).toBe(24);
  });

  test('fin de lista — muestra mensaje cuando no hay más datos', async ({
    page: pwPage,
  }) => {
    await pwPage.route('**/animals/animals*', async (route) => {
      const url = new URL(route.request().url());
      const currentPage = parseInt(url.searchParams.get('page') || '1', 10);

      const isFirstPage = currentPage === 1;
      const items = createBackendAnimals(isFirstPage ? 12 : 5);
      const response = createPaginatedResponse(
        items,
        currentPage,
        isFirstPage ? 17 : 17,
      );

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });

    await page.navigate();
    await pwPage.waitForLoadState('networkidle');

    await page.scrollToBottom();
    await pwPage.waitForLoadState('networkidle');

    await expect(page.endMessage).toBeVisible();
  });

  test('navegación al detalle — click en card navega a /animales/:id', async ({
    page: pwPage,
  }) => {
    const animals = createBackendAnimals(12);
    const response = createPaginatedResponse(animals, 1, 25);

    await pwPage.route('**/animals/animals*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response),
      });
    });

    await page.navigate();
    await pwPage.waitForLoadState('networkidle');

    await page.clickAnimal(0);

    await expect(pwPage).toHaveURL(/\/animales\/\d+/);
  });
});
