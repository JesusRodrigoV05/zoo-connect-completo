import { Page, Locator } from '@playwright/test';

export class AnimalDetailPage {
  readonly page: Page;
  readonly animalName: Locator;
  readonly scientificName: Locator;
  readonly commonName: Locator;
  readonly statusBadge: Locator;
  readonly ageValue: Locator;
  readonly genderValue: Locator;
  readonly description: Locator;
  readonly favoriteButton: Locator;
  readonly backButton: Locator;
  readonly habitatName: Locator;
  readonly habitatConditions: Locator;
  readonly taxonomyBox: Locator;
  readonly loader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.animalName = page.locator('.animal-name');
    this.scientificName = page.locator('.scientific-name');
    this.commonName = page.locator('.common-name');
    this.statusBadge = page.locator('.status-badge');
    this.ageValue = page.locator('.stat-group .value').first();
    this.genderValue = page.locator('.stat-group .value').nth(1);
    this.description = page.locator('.narrative-text');
    this.favoriteButton = page.locator('.fav-btn');
    this.backButton = page.locator('.back-nav-btn');
    this.habitatName = page.locator('.habitat-card h3');
    this.habitatConditions = page.locator('.weather-info .value');
    this.taxonomyBox = page.locator('.taxonomy-box');
    this.loader = page.locator('zoo-loader');
  }

  async navigate(id: number) {
    await this.page.goto(`/animales/${id}`);
  }

  async getAnimalName() {
    return this.animalName.textContent();
  }

  async getScientificName() {
    return this.scientificName.textContent();
  }

  async getCommonName() {
    return this.commonName.textContent();
  }

  async getStatusBadge() {
    return this.statusBadge.textContent();
  }

  async getStatusBadgeClasses() {
    return this.statusBadge.getAttribute('class');
  }

  async getAge() {
    return this.ageValue.textContent();
  }

  async getGender() {
    return this.genderValue.textContent();
  }

  async getDescription() {
    return this.description.textContent();
  }

  async getHabitatName() {
    return this.habitatName.textContent();
  }

  async getHabitatConditions() {
    return this.habitatConditions.textContent();
  }

  async clickFavorite() {
    await this.favoriteButton.click();
  }

  async isFavoriteActive() {
    const classes = await this.favoriteButton.getAttribute('class');
    return classes?.includes('active') ?? false;
  }

  async clickBack() {
    await this.backButton.click();
  }

  async isLoaderVisible() {
    return this.loader.isVisible();
  }

  async waitForContentToLoad() {
    await this.animalName.waitFor({ state: 'visible' });
  }

  async getTaxonomyEntry(label: string) {
    const li = this.taxonomyBox.locator('li', { hasText: label });
    return li.textContent();
  }
}
