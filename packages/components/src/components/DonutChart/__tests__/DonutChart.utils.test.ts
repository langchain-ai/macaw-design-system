import { describe, expect, it } from 'vitest';

import { CHART_OTHER_COLOR } from '../../../utils/chartColors';
import { DONUT_OTHER_SEGMENT_ID } from '../constants';
import type { DonutChartSegment } from '../DonutChart';
import {
  collateDonutSegments,
  getDonutLegendItems,
  getDrawnSegments,
} from '../DonutChart.utils';

const CHAIN_COLOR = 'var(--chart-categorical-fill-1)';
const RETRIEVER_COLOR = 'var(--chart-categorical-fill-2)';

/** Totals 1,000, so `retriever` is worth 0.5%. */
const segments: readonly DonutChartSegment[] = [
  { id: 'chain', label: 'chain', value: 900, color: CHAIN_COLOR },
  { id: 'retriever', label: 'retriever', value: 5, color: RETRIEVER_COLOR },
  {
    id: 'rollup',
    label: 'Other',
    value: 95,
    color: CHART_OTHER_COLOR,
    isOther: true,
  },
];

describe('collateDonutSegments', () => {
  it.each([undefined, 2])(
    'normalizes invalid values with threshold %s',
    (threshold) => {
      expect(
        collateDonutSegments(
          [
            { ...segments[0], value: -1 },
            { ...segments[1], value: Number.NaN },
            { ...segments[2], value: Number.POSITIVE_INFINITY },
          ],
          threshold
        ).map((segment) => segment.value)
      ).toEqual([0, 0, 0]);
    }
  );

  it('merges flagged segments with the sub-threshold tail', () => {
    expect(collateDonutSegments(segments, 2)).toEqual([
      segments[0],
      {
        id: DONUT_OTHER_SEGMENT_ID,
        label: 'Other',
        value: 100,
        color: CHART_OTHER_COLOR,
        isOther: true,
      },
    ]);
  });

  it('merges a reserved Other id with the collated tail', () => {
    expect(
      collateDonutSegments(
        [
          segments[0],
          { ...segments[2], id: DONUT_OTHER_SEGMENT_ID, isOther: false },
          segments[1],
        ],
        2
      )
    ).toEqual([
      segments[0],
      expect.objectContaining({ id: DONUT_OTHER_SEGMENT_ID, value: 100 }),
    ]);
  });

  it('leaves a lone flagged segment as it arrived', () => {
    const withoutTail = [segments[0], segments[2]];

    expect(collateDonutSegments(withoutTail, 2)).toBe(withoutTail);
  });

  it('passes the segments through without a threshold', () => {
    expect(collateDonutSegments(segments, undefined)).toBe(segments);
  });
});

describe('getDrawnSegments', () => {
  it('draws everything when nothing is selected', () => {
    expect(getDrawnSegments(segments, new Set())).toEqual(segments);
  });

  it('draws only the selected segments', () => {
    expect(getDrawnSegments(segments, new Set(['chain']))).toEqual([
      segments[0],
    ]);
  });

  it('draws everything when the selection names no segment it has', () => {
    // The id outlived its data: collated away, or gone from a refetch. Drawing
    // nothing would leave an empty donut with no row to toggle the id off.
    expect(getDrawnSegments(segments, new Set(['departed-group']))).toEqual(
      segments
    );
  });
});

describe('getDonutLegendItems', () => {
  it('reports each segment share of the drawn total', () => {
    const collated = collateDonutSegments(segments, 2);
    const items = getDonutLegendItems({
      segments: collated,
      selectedIds: undefined,
      drawnIds: new Set(collated.map((segment) => segment.id)),
      drawnTotal: 1000,
      formatValue: String,
    });

    expect(items).toEqual([
      expect.objectContaining({
        id: 'chain',
        markerColor: CHAIN_COLOR,
        secondaryValue: '90%',
      }),
      // The collated segments are represented by this row alone.
      expect.objectContaining({
        id: DONUT_OTHER_SEGMENT_ID,
        markerColor: CHART_OTHER_COLOR,
        value: '100',
        secondaryValue: '10%',
      }),
    ]);
  });

  it('reports a 0% share for segments outside the selection', () => {
    const items = getDonutLegendItems({
      segments,
      selectedIds: new Set(['chain']),
      drawnIds: new Set(['chain']),
      drawnTotal: 900,
      formatValue: String,
    });

    expect(items.map((item) => item.secondaryValue)).toEqual([
      '100%',
      '0%',
      '0%',
    ]);
  });
});
