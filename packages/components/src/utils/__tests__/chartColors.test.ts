import { describe, expect, it, vi } from 'vitest';

import { renderHook } from '@testing-library/react';

import {
  CHART_CATEGORICAL_FILL_COLORS,
  CHART_CATEGORICAL_LINE_COLORS,
  CHART_COMPARISON_COLORS,
  CHART_OTHER_COLOR,
  CHART_STATUS_COLORS,
  CHART_STATUS_FILL_COLORS,
  getCategoricalFillChartColor,
  getCategoricalFillColor,
  getCategoricalLineChartColor,
  getChartStatusColor,
  getFillChartColorForKey,
  getLineChartColorForKey,
  useChartColorResolver,
} from '../chartColors';

describe('chart colors', () => {
  it('provides unique line and fill colors for the supported series count', () => {
    expect(new Set(CHART_CATEGORICAL_LINE_COLORS).size).toBe(20);
    expect(new Set(CHART_CATEGORICAL_FILL_COLORS).size).toBe(20);
  });

  it('uses only semantic chart tokens', () => {
    for (const color of [
      ...CHART_CATEGORICAL_LINE_COLORS,
      ...CHART_CATEGORICAL_FILL_COLORS,
      ...CHART_COMPARISON_COLORS,
      ...Object.values(CHART_STATUS_COLORS),
      ...Object.values(CHART_STATUS_FILL_COLORS),
      CHART_OTHER_COLOR,
    ]) {
      expect(color).toMatch(/^var\(--chart-/);
    }
  });

  it('provides ten semantic comparison colors in five shade pairs', () => {
    expect(new Set(CHART_COMPARISON_COLORS).size).toBe(
      CHART_COMPARISON_COLORS.length
    );
    expect(CHART_COMPARISON_COLORS).toEqual(
      Array.from(
        { length: 10 },
        (_, index) => `var(--chart-comparison-${index + 1})`
      )
    );
  });

  it('provides separate semantic colors for large filled marks', () => {
    expect(CHART_STATUS_FILL_COLORS).toEqual({
      positive: 'var(--chart-positive-fill)',
      warning: 'var(--chart-warning-fill)',
      negative: 'var(--chart-negative-fill)',
    });
  });

  it('wraps palette indexes', () => {
    expect(getCategoricalLineChartColor(20)).toBe(
      getCategoricalLineChartColor(0)
    );
    expect(getCategoricalFillChartColor(20)).toBe(
      getCategoricalFillChartColor(0)
    );
  });

  it('assigns stable colors to arbitrary keys', () => {
    expect(getLineChartColorForKey('latency')).toBe(
      getLineChartColorForKey('latency')
    );
    expect(getFillChartColorForKey('latency')).toBe(
      getFillChartColorForKey('latency')
    );
  });

  it('maps each line hue to its lighter fill counterpart', () => {
    CHART_CATEGORICAL_LINE_COLORS.forEach((color, index) => {
      expect(getCategoricalFillColor(color)).toBe(
        CHART_CATEGORICAL_FILL_COLORS[index]
      );
    });
  });

  it('reserves status colors for semantic series labels', () => {
    expect(getChartStatusColor('Success')).toBe('var(--chart-positive)');
    expect(getChartStatusColor('Error')).toBe('var(--chart-negative)');
    expect(getChartStatusColor('Failed')).toBe('var(--chart-negative)');
    expect(getChartStatusColor('Failure')).toBe('var(--chart-negative)');
    expect(getChartStatusColor('Failing')).toBe('var(--chart-negative)');
    expect(getChartStatusColor('Success rate')).toBeUndefined();
    expect(getChartStatusColor('Unsuccessful')).toBeUndefined();
    expect(getChartStatusColor('Error rate')).toBeUndefined();
    expect(getChartStatusColor('Latency')).toBeUndefined();
    expect(getChartStatusColor('Waterfall')).toBeUndefined();
    expect(getChartStatusColor('failover')).toBeUndefined();
    expect(getChartStatusColor('failsafe')).toBeUndefined();
  });

  it('resolves fallback variables and caches values by theme', () => {
    document.documentElement.dataset.theme = 'light';
    const getComputedStyleSpy = vi.spyOn(window, 'getComputedStyle');
    const { result } = renderHook(() => useChartColorResolver());
    const color = 'var(--missing-color, var(--other-missing-color, red))';

    expect(result.current(color)).toBe('red');
    expect(result.current(color)).toBe('red');
    expect(getComputedStyleSpy).toHaveBeenCalledTimes(1);

    getComputedStyleSpy.mockRestore();
    delete document.documentElement.dataset.theme;
  });
});
