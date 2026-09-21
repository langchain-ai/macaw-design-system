import { describe, expect, it } from 'vitest';

import {
  getChartLegendAriaLabel,
  getChartLegendListColumns,
  getChartLegendListGridTemplate,
} from '../utils';

describe('ChartLegend list columns', () => {
  it('includes list values in the accessible label', () => {
    expect(getChartLegendAriaLabel('Alpha', '12', '25%')).toBe(
      'Alpha, 12, 25%'
    );
  });

  it('uses only the label column when optional content is absent', () => {
    const columns = getChartLegendListColumns(
      [{ marker: undefined, value: undefined }],
      false
    );

    expect(columns).toEqual({
      marker: false,
      value: false,
      secondaryValue: false,
      action: false,
    });
    expect(getChartLegendListGridTemplate(columns)).toBe('minmax(0, 1fr)');
  });

  it('reserves shared columns for sparse list items', () => {
    const columns = getChartLegendListColumns(
      [
        { markerColor: 'var(--chart-single-fill)', value: '12' },
        { secondaryValue: '25%', selected: true },
      ],
      false
    );

    expect(columns).toEqual({
      marker: true,
      value: true,
      secondaryValue: true,
      action: true,
    });
    expect(getChartLegendListGridTemplate(columns)).toBe(
      'auto minmax(0, 1fr) auto auto auto'
    );
  });

  it('reserves an action column for interactive items', () => {
    const columns = getChartLegendListColumns([{}], true);

    expect(columns.action).toBe(true);
    expect(getChartLegendListGridTemplate(columns)).toBe('minmax(0, 1fr) auto');
  });
});
