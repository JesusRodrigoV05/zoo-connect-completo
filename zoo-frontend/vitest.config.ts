import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Entorno Node.js: pruebas de lógica pura (adapters, models) sin DOM
    environment: 'node',
    // Patrón para encontrar los archivos de prueba
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    // Reporte de resultados
    reporter: ['verbose'],
    // Cobertura con v8
    coverage: {
      provider: 'v8',
      include: ['src/app/features/private/admin/adapters/**'],
      reporter: ['text', 'lcov'],
    },
  },
});
