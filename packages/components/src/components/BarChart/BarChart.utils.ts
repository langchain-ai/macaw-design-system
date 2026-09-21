import type { scaleBand } from '@visx/scale';

import { clamp } from '../../utils/clamp';
import type {
  BarChartCategory,
  BarChartDataPoint,
  BarChartDisplayAxis,
  BarChartDisplaySeries,
  BarChartInteractionBar,
  BarChartLayoutBar,
  BarChartMode,
  BarChartOrientation,
  BarChartRenderedBar,
  BarChartSeries,
} from './BarChart.types';

const VALUE_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export const groupBarChartItemsBy = <Item>(
  items: readonly Item[],
  getKey: (item: Item) => string
): ReadonlyMap<string, Item[]> => {
  const groups = new Map<string, Item[]>();
  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key);
    if (group == null) groups.set(key, [item]);
    else group.push(item);
  }
  return groups;
};

/** Default value-axis tick text. Consumers localize via `formatValue`. */
export const formatBarChartValue = (value: number): string =>
  VALUE_FORMATTER.format(value);

const isValidCategory = (category: BarChartCategory): boolean =>
  typeof category === 'string' || Number.isFinite(category);

/** Categories are compared across types, so the key carries the type too. */
export const getCategoryKey = (category: BarChartCategory): string =>
  `${typeof category}:${category}`;

const getPointId = (seriesId: string, point: BarChartDataPoint): string =>
  point.id ?? `${seriesId}:${getCategoryKey(point.category)}`;

const expandFlatDomain = (value: number): [number, number] => {
  if (value === 0) return [0, 1];
  const padding = Math.abs(value) * 0.1;
  return [Math.min(0, value - padding), Math.max(0, value + padding)];
};

export const normalizeBarChartSeries = (
  series: readonly BarChartSeries[]
): readonly BarChartSeries[] =>
  series.map((item) => ({
    ...item,
    data: item.data.reduce<BarChartDataPoint[]>((points, point) => {
      if (!isValidCategory(point.category)) return points;
      points.push({
        ...point,
        value:
          point.value != null && Number.isFinite(point.value)
            ? point.value
            : null,
      });
      return points;
    }, []),
  }));

export const getBarChartCategories = (
  series: readonly BarChartSeries[],
  configuredCategories?: readonly BarChartCategory[]
): readonly BarChartCategory[] => {
  const candidates =
    configuredCategories ??
    series.flatMap((item) => item.data.map((point) => point.category));
  const categories: BarChartCategory[] = [];
  const seen = new Set<BarChartCategory>();

  for (const category of candidates) {
    if (!isValidCategory(category) || seen.has(category)) continue;
    seen.add(category);
    categories.push(category);
  }
  return categories;
};

export const getBarChartLayout = (
  series: readonly BarChartDisplaySeries[],
  categories: readonly BarChartCategory[],
  mode: BarChartMode
): readonly BarChartLayoutBar[] => {
  const categorySet = new Set(categories);
  const pointBySeriesAndCategory = new Map<
    string,
    Map<BarChartCategory, BarChartDataPoint>
  >();
  for (const item of series) {
    const points = new Map<BarChartCategory, BarChartDataPoint>();
    for (const point of item.data) {
      if (categorySet.has(point.category)) points.set(point.category, point);
    }
    pointBySeriesAndCategory.set(item.id, points);
  }

  const isStacked = mode === 'stacked';
  const groupIds = isStacked
    ? Array.from(new Set(series.map((item) => item.valueAxisId)))
    : series.map((item) => item.id);
  const groupIndexById = new Map(
    groupIds.map((groupId, index) => [groupId, index])
  );
  const groupCount = Math.max(1, groupIds.length);
  const bars: BarChartLayoutBar[] = [];

  for (const category of categories) {
    const positiveTotals = new Map<string, number>();
    const negativeTotals = new Map<string, number>();

    for (const item of series) {
      const point = pointBySeriesAndCategory.get(item.id)?.get(category);
      if (point?.value == null) continue;

      const groupId = isStacked ? item.valueAxisId : item.id;
      let startValue = 0;
      let endValue = point.value;

      if (isStacked) {
        const totals = point.value < 0 ? negativeTotals : positiveTotals;
        startValue = totals.get(item.valueAxisId) ?? 0;
        endValue = startValue + point.value;
        totals.set(item.valueAxisId, endValue);
      }

      const bar: BarChartLayoutBar = {
        id: getPointId(item.id, point),
        category,
        value: point.value,
        startValue,
        endValue,
        seriesId: item.id,
        seriesLabel: item.label,
        legendItemId: point.legendItemId ?? item.id,
        color: point.color ?? item.color,
        valueAxisId: item.valueAxisId,
        opacity: item.opacity,
        groupIndex: groupIndexById.get(groupId) ?? 0,
        groupCount,
      };
      bars.push(bar);
    }
  }

  return bars;
};

export const getBarChartValueDomain = (
  bars: readonly BarChartLayoutBar[],
  valueAxisId: string,
  configuredDomain?: readonly [number, number]
): [number, number] => {
  if (
    configuredDomain != null &&
    Number.isFinite(configuredDomain[0]) &&
    Number.isFinite(configuredDomain[1])
  ) {
    const minimum = Math.min(configuredDomain[0], configuredDomain[1]);
    const maximum = Math.max(configuredDomain[0], configuredDomain[1]);
    return minimum === maximum ? expandFlatDomain(minimum) : [minimum, maximum];
  }

  // A bar is read against the baseline, so the domain always spans zero.
  let minimum = 0;
  let maximum = 0;
  let hasValue = false;
  for (const bar of bars) {
    if (bar.valueAxisId !== valueAxisId) continue;
    for (const value of [bar.startValue, bar.endValue]) {
      if (!Number.isFinite(value)) continue;
      hasValue = true;
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }
  }
  if (!hasValue) return [0, 1];
  return minimum === maximum ? expandFlatDomain(minimum) : [minimum, maximum];
};

/** Builds a square-cornered SVG bar outline. */
export const getBarPath = ({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) => `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`;

export const toBarChartInteractionBar = (
  bar: BarChartLayoutBar
): BarChartInteractionBar => ({
  id: bar.id,
  category: bar.category,
  value: bar.value,
  startValue: bar.startValue,
  endValue: bar.endValue,
  seriesId: bar.seriesId,
  seriesLabel: bar.seriesLabel,
  color: bar.color,
  valueAxisId: bar.valueAxisId,
});

/**
 * Resolves each layout bar to SVG geometry.
 *
 * The two ends of a bar are clamped to the plot box independently, so a bar that
 * runs past a configured axis domain is truncated at the edge rather than slid
 * back inside it — sliding would redraw it at a value it does not have, and can
 * even flip a negative bar to the positive side of the baseline. Bars therefore
 * never overflow, which is also why they need no clip path and their focus rings
 * stay visible.
 */
export const getBarChartRenderedBars = ({
  bars,
  orientation,
  categoryScale,
  axisById,
  groupPadding,
  minimumBarSize,
  innerWidth,
  innerHeight,
}: {
  bars: readonly BarChartLayoutBar[];
  orientation: BarChartOrientation;
  categoryScale: ReturnType<typeof scaleBand<BarChartCategory>>;
  axisById: ReadonlyMap<string, BarChartDisplayAxis>;
  groupPadding: number;
  minimumBarSize: number;
  innerWidth: number;
  innerHeight: number;
}): readonly BarChartRenderedBar[] => {
  const isVertical = orientation === 'vertical';
  const plotSize = isVertical ? innerHeight : innerWidth;
  const categoryBandwidth = categoryScale.bandwidth();

  return bars.flatMap((bar) => {
    const categoryStart = categoryScale(bar.category);
    const axis = axisById.get(bar.valueAxisId);
    if (categoryStart == null || axis == null) return [];

    const groupSlotSize = categoryBandwidth / bar.groupCount;
    // Dense charts drive the slot below a pixel; a hairline still reads as data.
    const groupSize = Math.max(
      Math.min(1, groupSlotSize),
      groupSlotSize * (1 - groupPadding)
    );
    const groupOffset =
      bar.groupIndex * groupSlotSize + (groupSlotSize - groupSize) / 2;
    const startPosition = axis.scale(bar.startValue);
    const endPosition = axis.scale(bar.endValue);
    const rawValueSize = Math.abs(endPosition - startPosition);
    const valueSize = Math.max(minimumBarSize, rawValueSize);
    // A bar padded up to the minimum size keeps growing away from the baseline,
    // which is the top of the SVG axis for positive vertical bars.
    const growsFromBaseline = isVertical ? bar.value < 0 : bar.value >= 0;
    const rawStart =
      rawValueSize >= minimumBarSize
        ? Math.min(startPosition, endPosition)
        : growsFromBaseline
          ? startPosition
          : startPosition - valueSize;
    const visibleStart = clamp(rawStart, 0, plotSize);
    const visibleSize = clamp(rawStart + valueSize, 0, plotSize) - visibleStart;
    if (visibleSize <= 0) return [];

    const geometry = isVertical
      ? {
          x: categoryStart + groupOffset,
          y: visibleStart,
          width: groupSize,
          height: visibleSize,
        }
      : {
          x: visibleStart,
          y: categoryStart + groupOffset,
          width: visibleSize,
          height: groupSize,
        };
    return [
      {
        ...bar,
        ...geometry,
        baselinePosition: clamp(startPosition, 0, plotSize),
      },
    ];
  });
};

export const getBarChartIsBarDimmed = ({
  bars,
  activeBuiltInLegendItemId,
  activeLegendItemId,
  activeBarId,
}: {
  bars: readonly BarChartRenderedBar[];
  activeBuiltInLegendItemId?: string | null;
  activeLegendItemId?: string | null;
  activeBarId?: string | null;
}) => {
  const activeSeriesId = bars.some(
    (bar) => bar.seriesId === activeBuiltInLegendItemId
  )
    ? activeBuiltInLegendItemId
    : null;
  const activeDatumLegendItemId =
    activeBuiltInLegendItemId == null &&
    bars.some((bar) => bar.legendItemId === activeLegendItemId)
      ? activeLegendItemId
      : null;

  return (bar: BarChartRenderedBar): boolean =>
    activeSeriesId != null
      ? activeSeriesId !== bar.seriesId
      : activeDatumLegendItemId != null
        ? activeDatumLegendItemId !== bar.legendItemId
        : activeBarId != null && activeBarId !== bar.id;
};

type BarAnimationRange = { start: number; end: number };

export const getBarAnimationRanges = (
  bars: readonly BarChartRenderedBar[],
  orientation: BarChartOrientation
): ReadonlyMap<string, BarAnimationRange> => {
  // Each signed half of a stack gets one reveal edge. Grouped bars naturally
  // form one-item stacks and retain their baseline-to-value animation.
  const stacks = new Map<string, BarChartRenderedBar[]>();
  for (const bar of bars) {
    const key = JSON.stringify([
      typeof bar.category,
      bar.category,
      bar.valueAxisId,
      bar.groupIndex,
      bar.value < 0 ? 'negative' : 'positive',
    ]);
    const stack = stacks.get(key);
    if (stack == null) stacks.set(key, [bar]);
    else stack.push(bar);
  }

  const ranges = new Map<string, BarAnimationRange>();
  for (const stack of stacks.values()) {
    const isNegative = (stack[0]?.value ?? 0) < 0;
    const starts = stack.map((bar) =>
      orientation === 'vertical'
        ? isNegative
          ? bar.y
          : bar.y + bar.height
        : isNegative
          ? bar.x + bar.width
          : bar.x
    );
    const ends = stack.map((bar) =>
      orientation === 'vertical'
        ? isNegative
          ? bar.y + bar.height
          : bar.y
        : isNegative
          ? bar.x
          : bar.x + bar.width
    );
    const range =
      orientation === 'vertical'
        ? {
            start: isNegative ? Math.min(...starts) : Math.max(...starts),
            end: isNegative ? Math.max(...ends) : Math.min(...ends),
          }
        : {
            start: isNegative ? Math.max(...starts) : Math.min(...starts),
            end: isNegative ? Math.min(...ends) : Math.max(...ends),
          };
    for (const bar of stack) ranges.set(bar.id, range);
  }

  return ranges;
};
