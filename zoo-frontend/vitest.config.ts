import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "src/**/*.vitest.ts",
      "src/tests/manueldelgadillo/**/*.spec.ts",
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
