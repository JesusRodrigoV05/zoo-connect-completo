import { test, expect } from "@playwright/test";
import {
  goToVetHistoriales,
  loginAndOpenVetPanel,
  selectPrimeNgOption,
  waitForHistorialFormData,
} from "../helpers/clinica";

/**
 * CP32 — Verificar que el veterinario puede registrar una consulta clínica.
 */
test.describe("CP32 — Consulta clínica", () => {
  test("el veterinario registra un historial clínico completo", async ({ page }) => {
    await loginAndOpenVetPanel(page);
    await goToVetHistoriales(page);

    await page.getByRole("button", { name: "Nuevo Historial" }).click();
    await expect(page).toHaveURL(/\/vet\/historiales\/crear/);
    await waitForHistorialFormData(page);

    await selectPrimeNgOption(page, page.locator("#animal"), "gorila");
    await selectPrimeNgOption(page, page.locator("#tipo"));
    await page.locator("#peso input").fill("120");
    await page.locator("#temp input").fill("38.5");
    await page.getByRole("button", { name: "Diagnósticos Iniciales" }).click();
    await page.locator('input[formcontrolname="diagnostico_presuntivo"]').fill("Anemia leve (E2E)");
    await page.getByRole("button", { name: "Guardar Historial" }).click();
    await expect(page).toHaveURL(/\/vet\/historiales\/lista/, { timeout: 30_000 });

    await expect(page.getByRole("button", { name: "Nuevo Historial" })).toBeVisible();
    await expect(page.locator("tr").filter({ hasText: "En Curso" }).first()).toBeVisible();
  });
});
