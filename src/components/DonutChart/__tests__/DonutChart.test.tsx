import { describe, expect, it, vi } from 'vitest';

import { render, screen, within } from '../../../test-utils';
import { DONUT_OTHER_SEGMENT_ID } from '../constants';
import {
  DonutChart,
  type DonutChartProps,
  type DonutChartSegment,
} from '../DonutChart';

const COLLATION_THRESHOLD = 2;

/**
 * Totals 1,000: `retriever` sits at 0.5%, under the threshold, and `rollup`
 * arrives already flagged as an "Other" of its own.
 */
const segments: readonly DonutChartSegment[] = [
  {
    id: 'chain',
    label: 'chain',
    value: 900,
    color: 'var(--chart-categorical-fill-1)',
  },
  {
    id: 'retriever',
    label: 'retriever',
    value: 5,
    color: 'var(--chart-categorical-fill-2)',
  },
  {
    id: 'rollup',
    label: 'Other',
    value: 95,
    color: 'var(--chart-other)',
    isOther: true,
  },
];

type DonutChartWithLegendProps = Extract<
  DonutChartProps,
  { showLegend?: true }
>;

/** Legend rows are only focusable, and so only queryable, when clickable. */
const renderDonut = (props: Partial<DonutChartWithLegendProps> = {}) =>
  render(
    <DonutChart
      segments={segments}
      aria-label="Runs by type"
      getSegmentAriaLabel={(segment) => `${String(segment.label)} slice`}
      legendProps={{ onItemClick: vi.fn() }}
      {...props}
    />
  );

const getLegendRow = (name: RegExp) =>
  within(screen.getByRole('group', { name: 'Runs by type legend' })).getByRole(
    'button',
    { name }
  );

describe('DonutChart', () => {
  describe('otherCollationThreshold', () => {
    it('merges a flagged rollup with the collated tail into one slice', () => {
      renderDonut({ otherCollationThreshold: COLLATION_THRESHOLD });

      // One arc for the rollup and the tail together, not one of each.
      expect(screen.getByLabelText('Other slice')).toBeVisible();
      expect(
        screen.queryByLabelText('retriever slice')
      ).not.toBeInTheDocument();
      // 95 + 5 of 1,000, listed once.
      expect(getLegendRow(/^Other,/)).toHaveAccessibleName(/100.*10%/);
      expect(screen.getAllByText('Other')).toHaveLength(1);
    });

    it('draws every segment on its own without a threshold', () => {
      renderDonut();

      expect(screen.getByLabelText('retriever slice')).toBeVisible();
      expect(screen.getByLabelText('Other slice')).toBeVisible();
      expect(getLegendRow(/^Other,/)).toHaveAccessibleName(/95.*9.5%/);
    });

    it('drops the collated segments from the legend with their arcs', () => {
      renderDonut({ otherCollationThreshold: COLLATION_THRESHOLD });

      // Rows correspond to arcs one for one, so a folded-away group is not
      // listed on its own anywhere.
      expect(getLegendRow(/^chain,/)).toHaveAccessibleName(/900.*90%/);
      expect(screen.queryByText('retriever')).not.toBeInTheDocument();
    });
  });

  it('draws everything when the selection outlived its segments', () => {
    renderDonut({
      otherCollationThreshold: COLLATION_THRESHOLD,
      selectedIds: new Set(['departed-group']),
    });

    // No arc answers to that id, so the donut recovers to showing everything
    // rather than rendering blank with nothing to toggle off.
    expect(screen.getByLabelText('chain slice')).toBeVisible();
    expect(screen.getByLabelText('Other slice')).toBeVisible();
    // The legend agrees, rather than reporting 0% under a full donut.
    expect(getLegendRow(/^chain,/)).toHaveAccessibleName(/900.*90%/);
    expect(getLegendRow(/^Other,/)).toHaveAccessibleName(/100.*10%/);
  });

  it('selects the collated slice from its legend row', () => {
    renderDonut({
      otherCollationThreshold: COLLATION_THRESHOLD,
      selectedIds: new Set([DONUT_OTHER_SEGMENT_ID]),
    });

    expect(screen.getByLabelText('Other slice')).toBeVisible();
    expect(screen.queryByLabelText('chain slice')).not.toBeInTheDocument();
    expect(getLegendRow(/^Other,/)).toHaveAccessibleName(/100%/);
  });

  // `scaleCenterNumberSize` sizes the value in container query units, which jsdom
  // neither parses nor resolves — the Storybook story covers it instead.
  it('renders the center number and its descriptor', () => {
    renderDonut({
      scaleCenterNumberSize: true,
      centerNumber: '1,000',
      centerDescriptor: 'runs',
    });

    expect(screen.getByText('1,000')).toBeVisible();
    expect(screen.getByText('runs')).toBeVisible();
  });
});
