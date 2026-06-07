import { test, expect } from "@playwright/test";
import {
  activeDialog,
  createHistorialClinico,
  loginAndOpenVetPanel,
  openFirstHistorialEnCurso,
  selectPrimeNgOption,
} from "../helpers/clinica";

/**
 * CP33 — Verificar la creación de una receta con generación de tareas automáticas.
 */
test.describe("CP33 — Receta con tareas automáticas", () => {
  test("el veterinario prescribe medicamento con recordatorios", async ({ page }) => {
    await loginAndOpenVetPanel(page);
    await createHistorialClinico(page);
    await openFirstHistorialEnCurso(page);

    await page.getByRole("button", { name: "Agregar Medicamento" }).click();

    const dialog = activeDialog(page);
    await expect(dialog.getByText("Nueva Receta Médica")).toBeVisible();

    await page.waitForResponse(
      (response) => response.url().includes("/inventario/productos") && response.ok(),
      { timeout: 30_000 },
    ).catch(() => undefined);
    await selectPrimeNgOption(page, dialog.locator("p-select").first(), /Antibiotico E2E/i);
    await dialog.locator('p-inputnumber[formcontrolname="dosis"] input').fill("5");
    await selectPrimeNgOption(page, dialog.locator("p-select").nth(1));
    await dialog.locator('input[formcontrolname="frecuencia"]').fill("Con comida");
    await dialog.locator('textarea[formcontrolname="instrucciones"]').fill("Administrar con alimento (E2E)");

    await dialog.locator("p-toggleswitch").click();
    await expect(dialog.getByText("Programar Recordatorios")).toBeVisible();
    await selectPrimeNgOption(page, dialog.locator("p-select").nth(2), /Diariamente/);

    await dialog.getByRole("button", { name: "Guardar" }).click();

    await expect(page.getByText("Receta Creada")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator("p-table").getByText("Administrar con alimento (E2E)")).toBeVisible();
  });
});
