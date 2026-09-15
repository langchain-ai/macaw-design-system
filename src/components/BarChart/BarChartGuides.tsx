import { GridColumns, GridRows } from '@visx/grid';
import type { scaleBand } from '@visx/scale';

import { CHART_DASHED_STROKE_DASHARRAY } from '../../utils/chartConstants';
import { clamp } from '../../utils/clamp';
import type {
  BarChartCategory,
  BarChartDisplayAxis,
  BarChartGrid,
  BarChartOrientation,
  BarChartSelectionRange,
  BarChartValueBand,
} from './BarChart.types';
import {
  BAR_CHART_DEFAULT_TICK_COUNT,
  BAR_CHART_DEFAULT_VALUE_BAND_OPACITY,
} from './constants';

type BarChartGuidesProps = {
  orientation: BarChartOrientation;
  primaryAxis: BarChartDisplayAxis;
  axisById: ReadonlyMap<string, BarChartDisplayAxis>;
  categoryScale: ReturnType<typeof scaleBand<BarChartCategory>>;
  categoryTickValues: readonly BarChartCategory[];
  grid?: BarChartGrid;
  valueBands: readonly BarChartValueBand[];
  selectionRange?: BarChartSelectionRange;
  activeCategory?: BarChartCategory | null;
  innerWidth: number;
  innerHeight: number;
  formatCategory: (category: BarChartCategory) => string;
};

/**
 * Everything drawn beneath the bars: threshold bands, the selected range, and
 * the value and category grids.
 */
export const BarChartGuides = ({
  orientation,
  primaryAxis,
  axisById,
  categoryScale,
  categoryTickValues,
  grid,
  valueBands,
  selectionRange,
  activeCategory,
  innerWidth,
  innerHeight,
  formatCategory,
}: BarChartGuidesProps) => {
  const isVertical = orientation === 'vertical';
  const selectionStart =
    selectionRange == null ? undefined : categoryScale(selectionRange.from);
  const selectionEnd =
    selectionRange == null ? undefined : categoryScale(selectionRange.to);
  const activeCategoryStart =
    activeCategory == null ? undefined : categoryScale(activeCategory);
  const selectionBounds =
    selectionRange == null || selectionStart == null || selectionEnd == null
      ? null
      : {
          start: Math.min(selectionStart, selectionEnd),
          size:
            Math.abs(selectionEnd - selectionStart) + categoryScale.bandwidth(),
        };
  const gridProps = {
    width: innerWidth,
    height: innerHeight,
    stroke: 'var(--border-subtle)',
    strokeDasharray: CHART_DASHED_STROKE_DASHARRAY,
    pointerEvents: 'none' as const,
  };
  // An empty tickValues array would draw no guides at all; visx needs
  // undefined to fall back to numTicks.
  const valueTickValues = grid?.tickValues ?? primaryAxis.tickValues;
  const valueGridProps = {
    ...gridProps,
    scale: primaryAxis.scale,
    numTicks:
      grid?.tickCount ?? primaryAxis.tickCount ?? BAR_CHART_DEFAULT_TICK_COUNT,
    tickValues:
      valueTickValues == null ? undefined : Array.from(valueTickValues),
  };
  const categoryGridProps = {
    ...gridProps,
    scale: categoryScale,
    tickValues: Array.from(categoryTickValues),
  };

  return (
    <>
      {valueBands.map((band) => {
        const axis =
          band.valueAxisId == null
            ? primaryAxis
            : axisById.get(band.valueAxisId);
        if (axis == null) return null;
        const [domainMinimum, domainMaximum] = axis.scale.domain();
        const fromPosition = axis.scale(band.from ?? domainMinimum);
        const toPosition = axis.scale(band.to ?? domainMaximum);
        const start = Math.min(fromPosition, toPosition);
        const size = Math.abs(toPosition - fromPosition);
        return (
          <rect
            key={band.id}
            x={isVertical ? 0 : start}
            y={isVertical ? start : 0}
            width={isVertical ? innerWidth : size}
            height={isVertical ? size : innerHeight}
            fill={band.color}
            opacity={clamp(
              band.opacity ?? BAR_CHART_DEFAULT_VALUE_BAND_OPACITY,
              0,
              1
            )}
            role={band.ariaLabel == null ? undefined : 'img'}
            aria-label={band.ariaLabel}
          />
        );
      })}
      {selectionBounds != null && selectionRange != null && (
        <rect
          x={isVertical ? selectionBounds.start : 0}
          y={isVertical ? 0 : selectionBounds.start}
          width={isVertical ? selectionBounds.size : innerWidth}
          height={isVertical ? innerHeight : selectionBounds.size}
          // Bars paint over this layer, so the full-strength subtle brand
          // surface hides no data and stays readable in dark mode.
          fill="var(--bg-brand-subtle)"
          role="img"
          aria-label={`Selected range from ${formatCategory(
            selectionRange.from
          )} to ${formatCategory(selectionRange.to)}`}
        />
      )}
      {activeCategoryStart != null && (
        <rect
          x={isVertical ? activeCategoryStart : 0}
          y={isVertical ? 0 : activeCategoryStart}
          width={isVertical ? categoryScale.bandwidth() : innerWidth}
          height={isVertical ? innerHeight : categoryScale.bandwidth()}
          fill="var(--bg-surface-level-2-hover)"
          pointerEvents="none"
        />
      )}
      {(grid?.value ?? true) &&
        (isVertical ? (
          <GridRows {...valueGridProps} />
        ) : (
          <GridColumns {...valueGridProps} />
        ))}
      {(grid?.category ?? false) &&
        (isVertical ? (
          <GridColumns {...categoryGridProps} />
        ) : (
          <GridRows {...categoryGridProps} />
        ))}
    </>
  );
};
