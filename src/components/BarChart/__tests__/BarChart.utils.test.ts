import { describe, expect, it } from 'vitest';

import type { BarChartDisplaySeries, BarChartSeries } from '../BarChart.types';
import {
  getBarChartCategories,
  getBarChartLayout,
  getBarChartValueDomain,
  normalizeBarChartSeries,
} from '../BarChart.utils';

const displaySeries: readonly BarChartDisplaySeries[] = [
  {
    id: 'requests',
    label: 'Requests',
    data: [
      { category: 'Mon', value: 4 },
      { category: 'Tue', value: -2 },
    ],
    color: 'var(--chart-categorical-fill-1)',
    valueAxisId: 'count',
    opacity: 1,
  },
  {
    id: 'errors',
    label: 'Errors',
    data: [
      { category: 'Mon', value: 3 },
      { category: 'Tue', value: -1 },
    ],
    color: 'var(--chart-categorical-fill-2)',
    valueAxisId: 'count',
    opacity: 1,
  },
];

describe('BarChart utilities', () => {
  it('normalizes invalid values into gaps and removes invalid categories', () => {
    const input: readonly BarChartSeries[] = [
      {
        id: 'requests',
        label: 'Requests',
        data: [
          { category: 1, value: 4 },
          { category: Number.NaN, value: 8 },
          { category: 2, value: Number.POSITIVE_INFINITY },
        ],
      },
    ];

    expect(normalizeBarChartSeries(input)[0]?.data).toEqual([
      { category: 1, value: 4 },
      { category: 2, value: null },
    ]);
  });

  it('preserves first-seen category order or an explicit domain', () => {
    expect(getBarChartCategories(displaySeries)).toEqual(['Mon', 'Tue']);
    expect(getBarChartCategories(displaySeries, ['Tue', 'Wed', 'Tue'])).toEqual(
      ['Tue', 'Wed']
    );
  });

  it('lays out grouped bars from zero in stable series slots', () => {
    const bars = getBarChartLayout(displaySeries, ['Mon', 'Tue'], 'grouped');

    expect(bars).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          seriesId: 'requests',
          category: 'Mon',
          startValue: 0,
          endValue: 4,
          groupIndex: 0,
          groupCount: 2,
        }),
        expect.objectContaining({
          seriesId: 'errors',
          category: 'Tue',
          startValue: 0,
          endValue: -1,
          groupIndex: 1,
        }),
      ])
    );
  });

  it('stacks positive and negative values independently by value axis', () => {
    const thirdSeries: BarChartDisplaySeries = {
      ...displaySeries[0],
      id: 'latency',
      label: 'Latency',
      valueAxisId: 'duration',
      data: [{ category: 'Mon', value: 10 }],
    };
    const bars = getBarChartLayout(
      [...displaySeries, thirdSeries],
      ['Mon', 'Tue'],
      'stacked'
    );

    expect(
      bars.find((bar) => bar.category === 'Mon' && bar.seriesId === 'errors')
    ).toMatchObject({ startValue: 4, endValue: 7 });
    expect(
      bars.find((bar) => bar.category === 'Tue' && bar.seriesId === 'errors')
    ).toMatchObject({ startValue: -2, endValue: -3 });
    expect(bars.find((bar) => bar.seriesId === 'latency')).toMatchObject({
      startValue: 0,
      endValue: 10,
      groupIndex: 1,
      groupCount: 2,
    });
  });

  it('lets a data point override its series color', () => {
    const bars = getBarChartLayout(
      [
        {
          ...displaySeries[0],
          data: [
            { category: 'Mon', value: 4, color: 'var(--chart-other)' },
            { category: 'Tue', value: 2 },
          ],
        },
      ],
      ['Mon', 'Tue'],
      'grouped'
    );

    expect(bars.map((bar) => bar.color)).toEqual([
      'var(--chart-other)',
      'var(--chart-categorical-fill-1)',
    ]);
  });

  it('includes zero and signed stack totals in automatic domains', () => {
    const bars = getBarChartLayout(displaySeries, ['Mon', 'Tue'], 'stacked');

    expect(getBarChartValueDomain(bars, 'count')).toEqual([-3, 7]);
    expect(getBarChartValueDomain([], 'count')).toEqual([0, 1]);
    expect(getBarChartValueDomain(bars, 'count', [10, -10])).toEqual([-10, 10]);
  });

  it('expands a flat all-zero domain so the baseline stays visible', () => {
    const bars = getBarChartLayout(
      [{ ...displaySeries[0], data: [{ category: 'Mon', value: 0 }] }],
      ['Mon'],
      'grouped'
    );

    expect(getBarChartValueDomain(bars, 'count')).toEqual([0, 1]);
  });
});
