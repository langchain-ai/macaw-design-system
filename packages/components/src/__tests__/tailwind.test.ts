import { readFileSync } from 'node:fs';
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
const preset = require('../../tailwind.preset.cjs');

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
    expect(preset.content).toEqual([]);
  });

  it('preserves high-contrast outlines and the v3 slider shadow', async () => {
    const base = dirname(require.resolve('../../tailwind.preset.cjs'));
    const { css } = await postcss([tailwindcss({ base })]).process(
      '@import "tailwindcss" source(none); @config "./tailwind.preset.cjs"; @source inline("focus-visible:outline-hidden shadow-slider-thumb");',
      { from: `${base}/consumer.css` }
    );
    expect(css).toContain('@media (forced-colors: active)');
    expect(css).toContain('outline: 2px solid transparent');
    expect(css).toContain('outline-offset: 2px');
    expect(css).toContain(
      '0 1px 3px 0 var(--tw-shadow-color, rgb(0 0 0 / 0.1)), 0 1px 2px -1px var(--tw-shadow-color, rgb(0 0 0 / 0.1))'
    );
    expect(cn('shadow-slider-thumb', 'shadow-none')).toBe('shadow-none');
  });

  it('compiles shimmer without globally registering Tailwind gradient properties', async () => {
    const file =
      require.resolve('../components/ThinkingState/ThinkingState.module.css');
    const { css } = await postcss([tailwindcss()]).process(
      readFileSync(file, 'utf8'),
      { from: file }
    );
    expect(css).toContain('linear-gradient(');
    expect(css).toContain('var(--text-tertiary) 35%');
    expect(css).toContain('var(--macaw-shimmer-highlight) 50%');
    expect(css).toContain('var(--text-tertiary) 65%');
    expect(css).toContain(
      '--macaw-shimmer-highlight: var(--text-brand-primary)'
    );
    expect(css).not.toContain('--tw-gradient-');
    expect(css).not.toContain('in oklab');
    expect(css).toContain('@media (prefers-reduced-motion: reduce)');
    expect(css).toContain('color: CanvasText');
  });

  it('merges v4 utilities and semantic spacing overrides', () => {
    expect(cn('px-space-4', 'px-space-2')).toBe('px-space-2');
    expect(cn('bg-surface-level-1/50', 'bg-elevated/75')).toBe(
      'bg-elevated/75'
    );
    expect(cn('size-4', 'size-6')).toBe('size-6');
  });
});
