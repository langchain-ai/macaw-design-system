import { describe, expect, it } from 'vitest';

import { scaleBand, scaleLinear } from '@visx/scale';

import type {
  BarChartCategory,
  BarChartDisplayAxis,
  BarChartLayoutBar,
} from '../BarChart.types';
import { getBarChartRenderedBars, getBarPath } from '../BarChart.utils';

const INNER_SIZE = 100;

const buildAxis = (
  domain: [number, number],
  orientation: 'vertical' | 'horizontal'
): BarChartDisplayAxis => ({
  id: 'value',
  thickness: 48,
  scale: scaleLinear<number>({
    domain,
    range: orientation === 'vertical' ? [INNER_SIZE, 0] : [0, INNER_SIZE],
  }),
});

const buildBar = (bar: Partial<BarChartLayoutBar>): BarChartLayoutBar => ({
  id: 'bar',
  category: 'Mon',
  value: 0,
  startValue: 0,
  endValue: 0,
  seriesId: 'series',
  legendItemId: 'series',
  seriesLabel: 'Series',
  color: 'var(--chart-single-fill)',
  valueAxisId: 'value',
  opacity: 1,
  groupIndex: 0,
  groupCount: 1,
  ...bar,
});

const render = ({
  bar,
  domain,
  orientation = 'vertical',
  minimumBarSize = 1,
  categories = ['Mon'] as readonly BarChartCategory[],
}: {
  bar: BarChartLayoutBar;
  domain: [number, number];
  orientation?: 'vertical' | 'horizontal';
  minimumBarSize?: number;
  categories?: readonly BarChartCategory[];
}) => {
  const axis = buildAxis(domain, orientation);
  return getBarChartRenderedBars({
    bars: [bar],
    orientation,
    categoryScale: scaleBand<BarChartCategory>({
      domain: Array.from(categories),
      range: [0, INNER_SIZE],
    }),
    axisById: new Map([[axis.id, axis]]),
    groupPadding: 0,
    minimumBarSize,
    innerWidth: INNER_SIZE,
    innerHeight: INNER_SIZE,
  });
};

describe('getBarChartRenderedBars', () => {
  it('maps a value onto the axis it belongs to', () => {
    const [rendered] = render({
      bar: buildBar({ value: 5, endValue: 5 }),
      domain: [0, 10],
    });

    expect(rendered).toMatchObject({ y: 50, height: 50 });
  });

  it('grows a negative bar downward from the baseline', () => {
    const [rendered] = render({
      bar: buildBar({ value: -5, endValue: -5 }),
      domain: [-10, 10],
    });

    expect(rendered).toMatchObject({ y: 50, height: 25 });
  });

  it('truncates a bar at the domain edge instead of sliding it inside', () => {
    // Baseline (0) is below a domain that starts at 2, so only the top half of
    // the bar is on the plot. Its top edge must still read as the real value.
    const [rendered] = render({
      bar: buildBar({ value: 6, endValue: 6 }),
      domain: [2, 10],
    });

    expect(rendered).toMatchObject({ y: 50, height: 50 });
  });

  it('drops a bar that falls entirely outside the domain', () => {
    // A negative value under a non-negative domain must not be redrawn as a
    // positive bar of the same magnitude.
    expect(
      render({
        bar: buildBar({ value: -4, endValue: -4 }),
        domain: [0, 10],
      })
    ).toEqual([]);
    expect(
      render({
        bar: buildBar({ value: -4, endValue: -4 }),
        domain: [0, 10],
        orientation: 'horizontal',
      })
    ).toEqual([]);
  });

  it('clips an overflowing stack segment to its visible part', () => {
    const [rendered] = render({
      bar: buildBar({ value: 10, startValue: 8, endValue: 18 }),
      domain: [0, 10],
    });

    expect(rendered).toMatchObject({ y: 0, height: 20 });
  });

  it('gives a zero value the minimum visible size on the baseline', () => {
    const [vertical] = render({
      bar: buildBar({ value: 0, endValue: 0 }),
      domain: [0, 10],
      minimumBarSize: 2,
    });
    const [horizontal] = render({
      bar: buildBar({ value: 0, endValue: 0 }),
      domain: [0, 10],
      minimumBarSize: 2,
      orientation: 'horizontal',
    });

    expect(vertical).toMatchObject({ y: 98, height: 2 });
    expect(horizontal).toMatchObject({ x: 0, width: 2 });
  });

  it('splits a category band across the bars grouped inside it', () => {
    const axis = buildAxis([0, 10], 'vertical');
    const rendered = getBarChartRenderedBars({
      bars: [
        buildBar({ id: 'a', value: 10, endValue: 10, groupCount: 2 }),
        buildBar({
          id: 'b',
          value: 10,
          endValue: 10,
          groupIndex: 1,
          groupCount: 2,
        }),
      ],
      orientation: 'vertical',
      categoryScale: scaleBand<BarChartCategory>({
        domain: ['Mon'],
        range: [0, INNER_SIZE],
      }),
      axisById: new Map([[axis.id, axis]]),
      groupPadding: 0,
      minimumBarSize: 1,
      innerWidth: INNER_SIZE,
      innerHeight: INNER_SIZE,
    });

    expect(rendered.map((bar) => [bar.x, bar.width])).toEqual([
      [0, 50],
      [50, 50],
    ]);
  });
});

describe('getBarPath', () => {
  it('builds square-cornered bars, including flat bars', () => {
    expect(getBarPath({ x: 0, y: 0, width: 20, height: 40 })).toBe(
      'M 0 0 H 20 V 40 H 0 Z'
    );
    expect(getBarPath({ x: 0, y: 0, width: 20, height: 0 })).toBe(
      'M 0 0 H 20 V 0 H 0 Z'
    );
  });
});
