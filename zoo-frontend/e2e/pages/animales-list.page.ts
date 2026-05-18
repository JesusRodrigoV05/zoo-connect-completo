import { Page, Locator } from '@playwright/test';

export class AnimalesListPage {
  readonly page: Page;
  readonly animalCards: Locator;
  readonly loadingSpinner: Locator;
  readonly endMessage: Locator;
  readonly loadingTrigger: Locator;

  constructor(page: Page) {
    this.page = page;
    this.animalCards = page.locator('app-animal-item');
    this.loadingSpinner = page.locator('.pi-spin.pi-spinner');
    this.endMessage = page.locator('.end-message');
    this.loadingTrigger = page.locator('.loading-trigger');
  }

  async navigate() {
    await this.page.goto('/animales');
  }

  async getAnimalCards() {
    return this.animalCards;
  }

  async getCardCount() {
    return this.animalCards.count();
  }

  async getCardByIndex(index: number) {
    return this.animalCards.nth(index);
  }

  async getAnimalNameFromCard(index: number) {
    const card = this.animalCards.nth(index);
    return card.locator('h3').textContent();
  }

  async getAnimalSpeciesFromCard(index: number) {
    const card = this.animalCards.nth(index);
    return card.locator('.species-badge').textContent();
  }

  async clickAnimal(index: number) {
    await this.animalCards.nth(index).click();
  }

  async scrollToBottom() {
    await this.loadingTrigger.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500);
  }

  async isLoadingVisible() {
    return this.loadingSpinner.isVisible();
  }

  async waitForLoadingToFinish() {
    await this.loadingSpinner.waitFor({ state: 'hidden' });
  }

  async getEndMessageText() {
    return this.endMessage.textContent();
  }

  async isEndMessageVisible() {
    return this.endMessage.isVisible();
  }

  async getPageTitle() {
    return this.page.locator('.page-header h1').textContent();
  }
}
