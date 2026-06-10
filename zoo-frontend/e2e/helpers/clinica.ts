import { expect, Locator, Page } from "@playwright/test";
import { goToVetPanel, loginAsVet } from "./auth";

export async function loginAndOpenVetPanel(page: Page) {
  await loginAsVet(page);
  await goToVetPanel(page);
  await expect(page).toHaveURL(/\/vet/);
}

export async function openVetDrawer(page: Page) {
  const drawerToggle = page.locator('[slot="nav-toggle"] button').first();
  await drawerToggle.waitFor({ state: "visible", timeout: 15_000 });
  await drawerToggle.click();
  await page.locator(".vet-menu-list").waitFor({ state: "visible" });
}

export async function closeVetDrawerIfOpen(page: Page) {
  const drawerMask = page.locator(".p-drawer-mask");
  if (await drawerMask.isVisible().catch(() => false)) {
    await page.keyboard.press("Escape");
    await drawerMask.waitFor({ state: "hidden", timeout: 10_000 });
  }
}

export async function goToVetHistoriales(page: Page) {
  if (!page.url().includes("/vet/historiales")) {
    await openVetDrawer(page);
    await page.locator(".vet-menu-list").getByText("Historiales Clínicos").click();
    await closeVetDrawerIfOpen(page);
  }

  await expect(page).toHaveURL(/\/vet\/historiales/);
  await expect(page.getByRole("button", { name: "Historiales Clínicos" })).toBeVisible({
    timeout: 20_000,
  });
}

export async function goToTiposAtencion(page: Page) {
  await goToVetHistoriales(page);
  await page.getByRole("button", { name: "Tipos de Atención" }).click();
  await expect(page.getByRole("heading", { name: "Tipos de Atención" })).toBeVisible();
}

export async function waitForHistorialFormData(page: Page) {
  await page
    .waitForResponse(
      (response) => response.url().includes("/animals/animals") && response.ok(),
      { timeout: 30_000 },
    )
    .catch(() => undefined);
  await page
    .waitForResponse(
      (response) => response.url().includes("/tipos-atencion") && response.ok(),
      { timeout: 30_000 },
    )
    .catch(() => undefined);
}

export async function selectPrimeNgOption(
  page: Page,
  trigger: Locator,
  optionName?: string | RegExp,
) {
  await trigger.scrollIntoViewIfNeeded();
  await trigger.getByRole("button", { name: "dropdown trigger" }).click();

  const option = optionName
    ? page.getByRole("option", { name: optionName }).first()
    : page.getByRole("option").first();

  await option.waitFor({ state: "visible", timeout: 20_000 });
  await option.click();
  await page.keyboard.press("Escape");
}

export async function createHistorialClinico(page: Page) {
  await goToVetHistoriales(page);
  await page.getByRole("button", { name: "Nuevo Historial" }).click();
  await expect(page).toHaveURL(/\/vet\/historiales\/crear/);
  await expect(page.getByRole("heading", { name: "Nuevo Historial Clínico" })).toBeVisible();
  await waitForHistorialFormData(page);

  await selectPrimeNgOption(page, page.locator("#animal"));
  await selectPrimeNgOption(page, page.locator("#tipo"));

  await page.locator("#peso input").fill("120");
  await page.locator("#temp input").fill("38.5");

  await page.getByRole("button", { name: "Constantes Vitales & Anamnesis" }).click();
  await page.locator('textarea[formcontrolname="anamnesis"]').fill("Paciente con decaimiento (E2E)");

  await page.getByRole("button", { name: "Diagnósticos Iniciales" }).click();
  await page.locator('input[formcontrolname="diagnostico_presuntivo"]').fill("Anemia leve (E2E)");

  await page.getByRole("button", { name: "Guardar Historial" }).click();
  await expect(page).toHaveURL(/\/vet\/historiales\/lista/, { timeout: 30_000 });
  await expect(page.getByText("Historial clínico iniciado")).toBeVisible({
    timeout: 15_000,
  });
}

export async function openFirstHistorialEnCurso(page: Page) {
  await goToVetHistoriales(page);
  await page.locator("p-table tbody tr").first().waitFor({ state: "visible", timeout: 30_000 });

  const row = page.locator("tr").filter({ hasText: "En Curso" }).first();
  await expect(row).toBeVisible({ timeout: 15_000 });
  await row.locator("button .pi-chevron-right").click();
  await page.waitForURL(/\/vet\/historiales\/\d+/, { timeout: 30_000 });
  await expect(page.getByText("En Curso")).toBeVisible();
}

export function activeDialog(page: Page) {
  return page.locator(".p-dialog, .p-dynamic-dialog").last();
}
