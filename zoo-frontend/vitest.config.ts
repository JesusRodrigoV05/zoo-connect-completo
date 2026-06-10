/// <reference types="vitest" />
import path from "node:path";
import { defineConfig } from "vite";
import angular from "@analogjs/vite-plugin-angular";

export default defineConfig({
  plugins: [angular()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test-setup.ts"],
    include: [
      "src/**/*.vitest.ts",
      "src/tests/**/*.spec.ts",
      "src/app/**/*.spec.ts",
    ],
    reporters: ["verbose"],
  },
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/app"),
      "@models": path.resolve(__dirname, "./src/app/core/models"),
      "@guards": path.resolve(__dirname, "./src/app/core/guards"),
      "@adapters": path.resolve(__dirname, "./src/app/core/adapters"),
      "@stores": path.resolve(__dirname, "./src/app/core/stores"),
      "@directive": path.resolve(__dirname, "./src/app/core/directives"),
      "@features": path.resolve(__dirname, "./src/app/features"),
      "@shared": path.resolve(__dirname, "./src/app/shared"),
      "@env": path.resolve(__dirname, "./src/environment/environment.ts"),
    },
  },
});
