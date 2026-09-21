import type { ReactNode } from 'react';

import { CHART_OTHER_COLOR } from '../../utils/chartColors';
import type { ChartLegendItem } from '../ChartLegend';
import { DONUT_OTHER_SEGMENT_ID, DONUT_OTHER_SEGMENT_LABEL } from './constants';
import type { DonutChartSegment } from './DonutChart';

const percentFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
});

export const sumSegmentValues = (segments: readonly DonutChartSegment[]) =>
  segments.reduce((sum, segment) => sum + segment.value, 0);

/**
 * Splits segments into the ones the donut draws on their own and the ones that
 * fold into a single "Other": every segment flagged `isOther`, plus every
 * segment worth less than `threshold` percent of the total.
 *
 * `collapses` is false when there is nothing to fold, and also when the only
 * member is one `isOther` segment — that segment already is the "Other" slice,
 * so replacing it would rewrite its id without changing what is drawn.
 */
const partitionSegments = (
  segments: readonly DonutChartSegment[],
  threshold: number | undefined
): {
  kept: readonly DonutChartSegment[];
  members: readonly DonutChartSegment[];
  collapses: boolean;
} => {
  const total = sumSegmentValues(segments);
  if (threshold == null || total === 0) {
    return { kept: segments, members: [], collapses: false };
  }

  const kept: DonutChartSegment[] = [];
  const members: DonutChartSegment[] = [];
  segments.forEach((segment) => {
    if (segment.isOther || (segment.value / total) * 100 < threshold) {
      members.push(segment);
    } else {
      kept.push(segment);
    }
  });

  return {
    kept,
    members,
    collapses:
      members.length > 1 || (members.length === 1 && !members[0].isOther),
  };
};

/**
 * Folds a segment's long tail into one "Other" segment appended after the ones
 * that clear `threshold`. Segments already flagged `isOther` — a rollup the
 * data source computed, say — merge into that same segment rather than sitting
 * beside a second one wearing the same label and color. Without a threshold the
 * segments pass through untouched.
 *
 * `DonutChart` applies this itself; call it directly when you also need the
 * collated list — to total the values behind the center number, for instance.
 */
export const collateDonutSegments = (
  segments: readonly DonutChartSegment[],
  threshold: number | undefined
): readonly DonutChartSegment[] => {
  const { kept, members, collapses } = partitionSegments(segments, threshold);
  if (!collapses) return segments;

  return [
    ...kept,
    {
      id: DONUT_OTHER_SEGMENT_ID,
      label: DONUT_OTHER_SEGMENT_LABEL,
      value: sumSegmentValues(members),
      color: CHART_OTHER_COLOR,
      isOther: true,
    },
  ];
};

/**
 * Filters collated segments to a legend selection. An empty or absent selection
 * draws everything, and so does a selection that names no segment the donut
 * has: ids outlive the data they came from — a group can be collated away or
 * disappear from a refetch — and drawing nothing would strand the chart empty
 * with no row left to toggle the stale id off.
 */
export const getDrawnSegments = (
  segments: readonly DonutChartSegment[],
  selectedIds: ReadonlySet<string> | undefined
): DonutChartSegment[] => {
  if (selectedIds == null || selectedIds.size === 0) return [...segments];

  const selected = segments.filter((segment) => selectedIds.has(segment.id));
  return selected.length > 0 ? selected : [...segments];
};

/**
 * Every segment stays in the legend, including filtered-out ones — those report
 * a 0% share so the list does not reflow while filtering. Rows correspond to
 * arcs one for one, so shares are measured against the drawn total.
 *
 * A row reports a share when its arc is drawn rather than when it is selected,
 * so the two cannot disagree about what the donut is showing.
 */
export const getDonutLegendItems = ({
  segments,
  selectedIds,
  drawnIds,
  drawnTotal,
  formatValue,
}: {
  segments: readonly DonutChartSegment[];
  selectedIds: ReadonlySet<string> | undefined;
  drawnIds: ReadonlySet<string>;
  drawnTotal: number;
  formatValue: (value: number) => ReactNode;
}): readonly ChartLegendItem[] =>
  segments.map((segment) => {
    const isDrawn = drawnIds.has(segment.id);

    return {
      id: segment.id,
      label: segment.label,
      markerColor: segment.color,
      value: formatValue(segment.value),
      secondaryValue: `${percentFormatter.format(
        isDrawn && drawnTotal > 0 ? (segment.value / drawnTotal) * 100 : 0
      )}%`,
      selected: selectedIds?.has(segment.id) ?? false,
    };
  });
