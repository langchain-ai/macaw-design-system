import { describe, expect, it } from 'vitest';

import {
  createLineChartXScaleAdapter,
  getLineChartYDomainValues,
  getLineSegments,
  getNumericDomain,
  normalizeLineChartSeries,
} from '../LineChart.utils';

describe('LineChart utilities', () => {
  it('uses band centers for forward, inverse, and range positions', () => {
    const adapter = createLineChartXScaleAdapter({
      type: 'band',
      domain: [0, 30],
      values: [0, 10, 30],
      width: 300,
      nice: false,
    });
    const firstPosition = adapter.getPosition(0);
    const middlePosition = adapter.getPosition(10);
    const lastPosition = adapter.getPosition(30);

    expect(adapter.getValue(firstPosition)).toBeCloseTo(0);
    expect(adapter.getValue(middlePosition)).toBeCloseTo(10);
    expect(adapter.getValue(lastPosition)).toBeCloseTo(30);
    expect(adapter.getRangePosition(10)).toBe(middlePosition);
    expect(adapter.getPosition(20)).toBeCloseTo(
      (middlePosition + lastPosition) / 2
    );
    expect(adapter.getValue((middlePosition + lastPosition) / 2)).toBeCloseTo(
      20
    );
  });

  it('does not clamp band positions at the first and last buckets', () => {
    const adapter = createLineChartXScaleAdapter({
      type: 'band',
      domain: [5, 25],
      values: [10, 20],
      width: 300,
      nice: false,
    });

    expect(adapter.getPosition(5)).toBeLessThan(adapter.getPosition(10));
    expect(adapter.getPosition(25)).toBeGreaterThan(adapter.getPosition(20));
    expect(adapter.getPosition(0)).toBeLessThan(0);
    expect(adapter.getPosition(30)).toBeGreaterThan(300);
  });

  it('places non-bucket values outside a single band instead of pinning them', () => {
    const adapter = createLineChartXScaleAdapter({
      type: 'band',
      domain: [5, 15],
      values: [10],
      width: 300,
      nice: false,
    });

    expect(adapter.getPosition(5)).toBeLessThan(0);
    expect(adapter.getPosition(15)).toBeGreaterThan(300);
    expect(adapter.getValue(150)).toBe(10);
  });

  it('sorts finite x values and converts invalid y values to gaps', () => {
    const [series] = normalizeLineChartSeries([
      {
        id: 'requests',
        label: 'Requests',
        points: [
          { x: 4, y: 8 },
          { x: Number.NaN, y: 5 },
          { x: 1, y: Number.POSITIVE_INFINITY },
          { x: 2, y: 6 },
        ],
      },
    ]);

    expect(series?.points).toEqual([
      { x: 1, y: null },
      { x: 2, y: 6 },
      { x: 4, y: 8 },
    ]);
  });

  it('creates stable domains for empty, flat, and reversed configured ranges', () => {
    expect(getNumericDomain([])).toEqual([0, 1]);
    expect(getNumericDomain([5, 5])).toEqual([4, 6]);
    expect(getNumericDomain([], [20, -10])).toEqual([-10, 20]);
    expect(getNumericDomain([], [4, 4])).toEqual([3, 5]);
  });

  it('connects valid observations across null values by default', () => {
    expect(
      getLineSegments([
        { x: 0, y: 2 },
        { x: 1, y: 4 },
        { x: 2, y: null },
        { x: 3, y: 8 },
      ])
    ).toEqual([
      [
        { x: 0, y: 2 },
        { x: 1, y: 4 },
        { x: 3, y: 8 },
      ],
    ]);
  });

  it('preserves null values as gaps when null connection is disabled', () => {
    expect(
      getLineSegments(
        [
          { x: 0, y: 2 },
          { x: 1, y: 4 },
          { x: 2, y: null },
          { x: 3, y: 8 },
        ],
        false
      )
    ).toEqual([
      [
        { x: 0, y: 2 },
        { x: 1, y: 4 },
      ],
      [{ x: 3, y: 8 }],
    ]);
  });

  it.each([
    {
      name: 'null, value, value, null',
      points: [
        { x: 0, y: null },
        { x: 1, y: 2 },
        { x: 2, y: 4 },
        { x: 3, y: null },
      ],
      expected: [
        [
          { x: 1, y: 2 },
          { x: 2, y: 4 },
        ],
      ],
    },
    {
      name: 'null, value, null',
      points: [
        { x: 0, y: null },
        { x: 1, y: 2 },
        { x: 2, y: null },
      ],
      expected: [[{ x: 1, y: 2 }]],
    },
    {
      name: 'value, null, value',
      points: [
        { x: 0, y: 2 },
        { x: 1, y: null },
        { x: 2, y: 4 },
      ],
      expected: [[{ x: 0, y: 2 }], [{ x: 2, y: 4 }]],
    },
  ])(
    'segments $name when null connection is disabled',
    ({ points, expected }) => {
      expect(getLineSegments(points, false)).toEqual(expected);
    }
  );

  it('derives y-domain values from visible points and line intersections', () => {
    expect(
      getLineChartYDomainValues(
        [
          { x: 0, y: 100 },
          { x: 10, y: 0 },
          { x: 20, y: 10 },
          { x: 30, y: -100 },
        ],
        [5, 25]
      ).sort((left, right) => left - right)
    ).toEqual([-45, 0, 10, 50]);
    expect(
      getLineChartYDomainValues(
        [
          { x: 0, y: 0 },
          { x: 30, y: 30 },
        ],
        [10, 20]
      )
    ).toEqual([10, 20]);
  });

  it('interpolates y-domain values across connected null observations', () => {
    expect(
      getLineChartYDomainValues(
        [
          { x: 0, y: 100 },
          { x: 10, y: null },
          { x: 20, y: 10 },
          { x: 30, y: -100 },
        ],
        [5, 25]
      ).sort((left, right) => left - right)
    ).toEqual([-45, 10, 77.5]);
  });

  it('does not interpolate y-domain values across explicit gaps', () => {
    expect(
      getLineChartYDomainValues(
        [
          { x: 0, y: 100 },
          { x: 10, y: null },
          { x: 20, y: 10 },
          { x: 30, y: -100 },
        ],
        [5, 25],
        false
      ).sort((left, right) => left - right)
    ).toEqual([-45, 10]);
  });
});
