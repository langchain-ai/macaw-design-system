import { readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

import react from '@vitejs/plugin-react';

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url));
const sourceRoot = resolve(repositoryRoot, 'src');

function collectEntries(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    if (statSync(path).isDirectory()) {
      if (name === '__tests__' || name === 'stories' || name === 'styles') {
        return [];
      }
      return collectEntries(path);
    }

    if (
      !/\.(ts|tsx)$/.test(name) ||
      name.endsWith('.d.ts') ||
      name.endsWith('.stories.ts') ||
      name.endsWith('.stories.tsx') ||
      name.endsWith('.test.ts') ||
      name.endsWith('.test.tsx')
    ) {
      return [];
    }

    return [path];
  });
}

const entries = Object.fromEntries(
  collectEntries(sourceRoot)
    .filter((path) => !path.endsWith('/test-utils.tsx'))
    .map((path) => [
      relative(sourceRoot, path).replace(/\.(ts|tsx)$/, ''),
      path,
    ])
);

const isExternal = (id: string) =>
  !id.startsWith('.') && !id.startsWith('/') && !id.startsWith('\0');

export default defineConfig({
  plugins: [react(), svgr()],
  build: {
    target: 'es2022',
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    minify: false,
    lib: {
      entry: entries,
      formats: ['es'],
    },
    rolldownOptions: {
      external: isExternal,
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '_chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
