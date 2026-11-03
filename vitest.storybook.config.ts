import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    projects: ['light', 'dark'].map((theme) => ({
      plugins: [
        storybookTest({
          configDir: fileURLToPath(
            new URL('./packages/components/.storybook', import.meta.url)
          ),
          tags: { include: ['a11y-test'] },
          initialGlobals: { backgrounds: { value: theme } },
        }),
      ],
      test: {
        name: `a11y-${theme}`,
        browser: {
          enabled: true,
          headless: true,
          provider: playwright(),
          instances: [{ browser: 'chromium' }],
        },
        testTimeout: 30_000,
      },
    })),
  },
});
