import { describe, expect, it } from 'vitest';

import { cn } from '../cn';

describe('cn typography tokens', () => {
  it('keeps the last typography size token', () => {
    expect(cn('text-type-xs', 'text-type-md')).toBe('text-type-md');
  });

  it('deduplicates typography size tokens against legacy font sizes', () => {
    expect(cn('text-type-md', 'text-sm')).toBe('text-sm');
    expect(cn('text-sm', 'text-type-md')).toBe('text-type-md');
  });

  it('keeps the last typography line-height token', () => {
    expect(cn('leading-type-xs', 'leading-type-md')).toBe('leading-type-md');
  });
});
