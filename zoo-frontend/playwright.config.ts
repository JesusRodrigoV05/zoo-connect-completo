import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env.e2e" });

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:4200";

export default defineConfig({
  globalSetup: "./e2e/global-setup.ts",
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: true,
    timeout: 180_000,
  },
  use: {
    baseURL,
    headless: process.env.E2E_HEADLESS === "true",
    launchOptions: {
      slowMo: 500,
    },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
