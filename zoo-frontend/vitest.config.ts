import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    // Entorno Node.js: pruebas de lógica pura (adapters, models) sin DOM
    environment: 'node',
    // Patrón para encontrar los archivos de prueba
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    // Reporte de resultados
    reporter: ['verbose'],
    setupFiles: ['./src/setup-vitest.ts'],
    
    alias: {
      '@app': path.resolve(process.cwd(), 'src/app'),
      '@adapters': path.resolve(process.cwd(), 'src/app/core/adapters'),
      '@models': path.resolve(process.cwd(), 'src/app/core/models'),
      '@env': path.resolve(process.cwd(), 'src/environment/environment.ts'),
    },

    // Cobertura con v8
    coverage: {
      provider: 'v8',
      include: ['src/app/features/private/admin/adapters/**'],
      reporter: ['text', 'lcov'],
    },
  },
});