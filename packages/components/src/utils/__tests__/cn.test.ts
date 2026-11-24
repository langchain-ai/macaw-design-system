import { describe, expect, it } from 'vitest';

import { cn } from '../cn';

describe('cn', () => {
  it('keeps bg-canvas-dotted alongside a surface color', () => {
    expect(cn('bg-canvas-dotted bg-surface-level-1')).toBe(
      'bg-canvas-dotted bg-surface-level-1'
    );
    expect(cn('bg-surface-level-1', 'bg-canvas-dotted')).toBe(
      'bg-surface-level-1 bg-canvas-dotted'
    );
  });

  it('still dedupes conflicting surface colors', () => {
    expect(
      cn('bg-canvas-dotted bg-surface-level-1', 'bg-surface-level-2')
    ).toBe('bg-canvas-dotted bg-surface-level-2');
  });
});
