import { createRequire } from 'node:module';
import { dirname } from 'node:path';

import { describe, expect, it } from 'vitest';

import tailwindcss from '@tailwindcss/postcss';

import { cn } from '../utils/cn';

const require = createRequire(import.meta.url);
const postcss = require(
  require.resolve('postcss', {
    paths: [require.resolve('@tailwindcss/postcss')],
  })
);

describe('Tailwind v4 integration', () => {
  it('compiles consumer semantic tokens, opacity, dark mode, and containers', async () => {
    const base = dirname(require.resolve('../../tailwind.preset.cjs'));
    const result = await postcss([tailwindcss({ base })]).process(
      '@import "tailwindcss"; @config "./tailwind.preset.cjs"; @source inline("bg-surface-level-2/50 text-primary px-space-4 focus-visible:ring-focus dark:bg-elevated @container @sm:flex animate-in");',
      { from: `${base}/consumer.css` }
    );
    const css = result.css;
    expect(css).toContain('var(--bg-surface-level-2)');
    expect(css).toContain('color-mix(');
    expect(css).toContain('var(--text-primary)');
    expect(css).toContain('padding-inline: 1rem');
    expect(css).toContain('var(--border-focus)');
    expect(css).toContain('.dark');
    expect(css).toContain('container-type: inline-size');
    expect(css).toContain('@container');
    expect(css).toContain('animation-name: enter');
  });

  it('merges v4 utilities and semantic spacing overrides', () => {
    expect(cn('px-space-4', 'px-space-2')).toBe('px-space-2');
    expect(cn('bg-surface-level-1/50', 'bg-elevated/75')).toBe(
      'bg-elevated/75'
    );
    expect(cn('size-4', 'size-6')).toBe('size-6');
    expect(cn('shadow-slider-thumb', 'shadow-none')).toBe('shadow-none');
  });
});
