import { expect, Page } from "@playwright/test";

export const VET_EMAIL = process.env.E2E_VET_EMAIL ?? "vet@zconnect.com";
export const VET_PASSWORD = process.env.E2E_VET_PASSWORD ?? "vetABC123!";

async function dismissOverlays(page: Page) {
  const toastClose = page.locator(".p-toast-message-icon-close");
  if (await toastClose.first().isVisible().catch(() => false)) {
    await toastClose.first().click();
  }

  const alertDialog = page.getByRole("alertdialog");
  if (await alertDialog.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
  }
}

export async function loginAsVet(page: Page) {
  await page.context().clearCookies();
  await page.goto("/login");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByText("Inicia sesión para continuar").waitFor({ timeout: 60_000 });
  await page.locator(".login-content form").waitFor({ state: "visible", timeout: 60_000 });
  await page.locator(".login-form-container").scrollIntoViewIfNeeded();

  const emailInput = page.getByRole("textbox", { name: "Usuario" });
  await emailInput.waitFor({ state: "visible", timeout: 60_000 });
  await emailInput.click();
  await emailInput.pressSequentially(VET_EMAIL, { delay: 40 });
  await expect(emailInput).toHaveValue(VET_EMAIL, { timeout: 10_000 });

  const passwordInput = page.locator("#Contraseña input, p-password input").first();
  await passwordInput.waitFor({ state: "visible" });
  await passwordInput.click();
  await passwordInput.pressSequentially(VET_PASSWORD, { delay: 40 });

  const loginRequest = page.waitForResponse(
    (response) => response.url().includes("/auth/login") && response.ok(),
    { timeout: 60_000 },
  );
  const profileLoaded = page.waitForResponse(
    (response) => response.url().includes("/auth/me") && response.ok(),
    { timeout: 60_000 },
  );

  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await loginRequest;
  const profileResponse = await profileLoaded;
  const profile = await profileResponse.json();

  expect(profile.role_id).toBe(4);
  await page.waitForURL(/\/inicio/, { timeout: 60_000 });
  await dismissOverlays(page);
}

export async function goToVetPanel(page: Page) {
  await dismissOverlays(page);

  if (/\/vet/.test(page.url())) {
    return;
  }

  const profileButton = page.locator("zoo-profile-button .avatar-button");
  await profileButton.waitFor({ state: "visible", timeout: 30_000 });

  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (/\/vet/.test(page.url())) {
      break;
    }
    await profileButton.click();

    const vetPanelItem = page
      .locator("li.p-menuitem, [role='menuitem']")
      .filter({ hasText: "Panel Veterinario" });

    await expect(vetPanelItem).toBeVisible({ timeout: 10_000 });
    await expect(page.locator(".user-info .user-role")).toHaveText(/Veterinario/i);
    await page.getByRole("menuitem", { name: "Panel Veterinario" }).click();

    try {
      await expect(page).toHaveURL(/\/vet/, { timeout: 15_000 });
      break;
    } catch {
      await page.keyboard.press("Escape");
      await dismissOverlays(page);
    }
  }

  await expect(page).toHaveURL(/\/vet/, { timeout: 45_000 });
  await page
    .locator(".veterinario-layout, .loading-state")
    .first()
    .waitFor({ state: "visible", timeout: 45_000 });

  await dismissOverlays(page);
}
