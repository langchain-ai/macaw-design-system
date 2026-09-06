import { fileURLToPath } from 'node:url';

import svgr from 'vite-plugin-svgr';
import { defineConfig } from 'vitest/config';

import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    globals: true,
    css: true,
    maxWorkers: 2,
    setupFiles: ['./vitest.setup.ts'],
    testTimeout: 30_000,
    exclude: ['**/node_modules/**', '**/dist/**', '**/storybook-static/**'],
  },
});
