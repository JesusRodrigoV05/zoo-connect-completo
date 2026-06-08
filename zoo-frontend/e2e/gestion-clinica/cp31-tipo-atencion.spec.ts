import { test, expect } from "@playwright/test";
import { goToTiposAtencion, loginAndOpenVetPanel } from "../helpers/clinica";

/**
 * CP31 — Verificar la creación de una nueva categoría de Tipo de Atención.
 */
test.describe("CP31 — Tipo de Atención", () => {
  test("el veterinario crea un nuevo tipo de atención", async ({ page }) => {
    const nombre = `Tratamiento Ortopédico E2E ${Date.now()}`;

    await loginAndOpenVetPanel(page);
    await goToTiposAtencion(page);
    await page.getByRole("button", { name: "Nuevo" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText("Nuevo Tipo de Atención")).toBeVisible();

    await dialog.locator("#nombre").fill(nombre);
    await dialog.locator("#descripcion").fill("Atención especializada en huesos y articulaciones (E2E)");

    await dialog.getByRole("button", { name: "Guardar" }).click();

    await expect(page.getByText("Tipo de atención creado")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("cell", { name: nombre })).toBeVisible();
  });
});
