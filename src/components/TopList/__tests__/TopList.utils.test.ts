import { describe, expect, it } from 'vitest';

import type { TopListItem } from '../TopList.types';
import { limitTopListItems, sortTopListItems } from '../TopList.utils';

const items: readonly TopListItem[] = [
  { id: 'alpha', label: 'Alpha', value: 12 },
  { id: 'beta', label: 'Beta', value: 30 },
  { id: 'other', label: 'Other', value: 20 },
];

describe('TopList utilities', () => {
  it('sorts by value without mutating the input', () => {
    expect(
      sortTopListItems(items, 'descending').map((item) => item.id)
    ).toEqual(['beta', 'other', 'alpha']);
    expect(sortTopListItems(items, 'ascending').map((item) => item.id)).toEqual(
      ['alpha', 'other', 'beta']
    );
    expect(items.map((item) => item.id)).toEqual(['alpha', 'beta', 'other']);
  });

  it('preserves source order when sorting is disabled', () => {
    expect(sortTopListItems(items, 'none')).toEqual(items);
  });

  it('preserves source order for equal values', () => {
    const tiedItems = items.map((item) => ({ ...item, value: 10 }));

    expect(
      sortTopListItems(tiedItems, 'descending').map((item) => item.id)
    ).toEqual(['alpha', 'beta', 'other']);
  });

  it('supports semantic ordering with a custom comparator', () => {
    const sorted = sortTopListItems(items, (left, right) => {
      if (left.id === 'other') return 1;
      if (right.id === 'other') return -1;
      return right.value - left.value;
    });

    expect(sorted.map((item) => item.id)).toEqual(['beta', 'alpha', 'other']);
  });

  it('applies a non-negative integer limit', () => {
    expect(limitTopListItems(items, 2.9)).toEqual(items.slice(0, 2));
    expect(limitTopListItems(items, -1)).toEqual([]);
    expect(limitTopListItems(items, undefined)).toBe(items);
  });
});
