import { test, expect } from "@playwright/test";
import {
  createHistorialClinico,
  loginAndOpenVetPanel,
  openFirstHistorialEnCurso,
} from "../helpers/clinica";

/**
 * CP45 — Verificar el cierre del ciclo clínico.
 */
test.describe("CP45 — Cierre del ciclo clínico", () => {
  test("el veterinario finaliza un historial abierto", async ({ page }) => {
    await loginAndOpenVetPanel(page);
    await createHistorialClinico(page);
    await openFirstHistorialEnCurso(page);

    await expect(page.getByText("En Curso")).toBeVisible();
    await page.getByRole("button", { name: "Finalizar" }).click();

    await expect(
      page.getByText("¿Estás seguro de finalizar esta consulta?"),
    ).toBeVisible();
    await page.getByRole("button", { name: "Aceptar" }).click();

    await expect(page.getByText("Consulta Finalizada")).toBeVisible({ timeout: 20_000 });
    await expect(page.locator(".status-badge.closed")).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole("button", { name: "Finalizar" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Agregar Medicamento" })).toBeDisabled();
  });
});
