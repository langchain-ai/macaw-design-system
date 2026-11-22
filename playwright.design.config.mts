import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'playwright/test';

const root = fileURLToPath(new URL('.', import.meta.url));
const snapshots = process.env.MACAW_VISUAL_BASELINE;
if (
  !snapshots ||
  !isAbsolute(snapshots) ||
  !relative(root, snapshots).startsWith('..')
) {
  throw new Error(
    'Set MACAW_VISUAL_BASELINE to an absolute directory outside the repository.'
  );
}

export default defineConfig({
  testDir: './tests/visual',
  workers: 1,
  retries: 0,
  reporter: 'list',
  outputDir: resolve(tmpdir(), 'macaw-visual-results'),
  snapshotPathTemplate: `${snapshots}/{projectName}/{arg}{ext}`,
  use: {
    baseURL: process.env.MACAW_STORYBOOK_URL ?? 'http://127.0.0.1:5264',
    viewport: { width: 1024, height: 768 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  },
  projects: ['light', 'dark'].map((name) => ({
    name,
    use: { colorScheme: name as 'light' | 'dark' },
  })),
});
