import { describe, expect, it } from 'vitest';

import { getChartTickValues, getNearestChartValue } from '../chartValues';

describe('chart value utilities', () => {
  it('finds the nearest value by its rendered position', () => {
    const positions = new Map([
      ['A', 100],
      ['B', 300],
      ['C', 500],
    ]);

    expect(
      getNearestChartValue(['A', 'B', 'C'], 260, (value) =>
        positions.get(value)
      )
    ).toBe('B');
  });

  it('ignores values without a rendered position', () => {
    expect(
      getNearestChartValue(['hidden', 'visible'], 10, (value) =>
        value === 'visible' ? 20 : undefined
      )
    ).toBe('visible');
  });

  it('selects evenly spaced ticks while retaining both ends', () => {
    expect(getChartTickValues([0, 10, 20], 5)).toEqual([0, 10, 20]);
    expect(getChartTickValues([0, 10, 20, 30, 40, 50, 60], 5)).toEqual([
      0, 20, 30, 50, 60,
    ]);
    expect(getChartTickValues(['A', 'B', 'C', 'D', 'E'], 3)).toEqual([
      'A',
      'C',
      'E',
    ]);
    expect(getChartTickValues([0, 10, 20], 1)).toEqual([0]);
  });
});
