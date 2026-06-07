import { test, expect } from "@playwright/test";
import {
  activeDialog,
  createHistorialClinico,
  loginAndOpenVetPanel,
  openFirstHistorialEnCurso,
  selectPrimeNgOption,
} from "../helpers/clinica";

/**
 * CP35 — Verificar la emisión de una Orden de Examen Clínico.
 */
test.describe("CP35 — Orden de examen", () => {
  test("el veterinario solicita un examen complementario", async ({ page }) => {
    await loginAndOpenVetPanel(page);
    await createHistorialClinico(page);
    await openFirstHistorialEnCurso(page);

    await page.getByRole("tab", { name: /Exámenes/ }).click();
    await page.getByRole("button", { name: "Solicitar Examen" }).click();

    const dialog = activeDialog(page);
    await expect(
      dialog.getByText("Solicitar Examen de Laboratorio/Imagen"),
    ).toBeVisible();

    await selectPrimeNgOption(page, dialog.locator("p-select").first(), /Radiografia E2E/i);
    await dialog
      .locator('textarea[formcontrolname="instrucciones"]')
      .fill("Ayuno de 12 horas antes del examen (E2E)");

    await dialog.getByRole("button", { name: "Solicitar Examen" }).last().click();

    await expect(page.getByText("Orden de examen creada")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("p-table").getByText("Solicitado")).toBeVisible();
  });
});
