import { describe, expect, it } from 'vitest';

import { getCheckedState } from '../getCheckedState';

describe('getCheckedState', () => {
  it('returns true when all are selected', () => {
    expect(getCheckedState(true, true)).toBe(true);
    expect(getCheckedState(true, false)).toBe(true);
  });

  it('returns "indeterminate" when some but not all are selected', () => {
    expect(getCheckedState(false, true)).toBe('indeterminate');
  });

  it('returns false when none are selected', () => {
    expect(getCheckedState(false, false)).toBe(false);
  });
});
