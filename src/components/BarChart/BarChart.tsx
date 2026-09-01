import { useMemo } from 'react';

import { useResizeObserver } from '@mantine/hooks';
import { scaleLinear } from '@visx/scale';
import { getStringWidth } from '@visx/text';

import {
  CHART_SINGLE_FILL_COLOR,
  getCategoricalFillChartColor,
} from '../../utils/chartColors';
import {
  CHART_AXIS_LABEL_THICKNESS,
  CHART_TICK_FONT_SIZE,
  CHART_VALUE_AXIS_TICK_LENGTH,
} from '../../utils/chartConstants';
import { clamp } from '../../utils/clamp';
import { cn } from '../../utils/cn';
import { getYAxisLeftMargin } from '../../utils/getYAxisLeftMargin';
import { ChartLegend, type ChartLegendItem } from '../ChartLegend';
import type {
  BarChartDisplayAxis,
  BarChartDisplaySeries,
  BarChartLayoutBar,
  BarChartOrientation,
  BarChartProps,
  BarChartValueAxis,
} from './BarChart.types';
import {
  formatBarChartValue,
  getBarChartCategories,
  getBarChartLayout,
  getBarChartValueDomain,
  normalizeBarChartSeries,
} from './BarChart.utils';
import { BarChartPlot } from './BarChartPlot';
import {
  BAR_CHART_AXIS_THICKNESS,
  BAR_CHART_DEFAULT_AXIS_ID,
  BAR_CHART_DEFAULT_CATEGORY_PADDING_INNER,
  BAR_CHART_DEFAULT_CATEGORY_PADDING_OUTER,
  BAR_CHART_DEFAULT_CORNER_RADIUS,
  BAR_CHART_DEFAULT_GROUP_PADDING,
  BAR_CHART_DEFAULT_MINIMUM_BAR_SIZE,
  BAR_CHART_DEFAULT_TICK_COUNT,
  BAR_CHART_HORIZONTAL_CATEGORY_AXIS_THICKNESS,
  BAR_CHART_MARGIN_RIGHT,
  BAR_CHART_MARGIN_TOP,
  BAR_CHART_MINIMUM_PLOT_WIDTH,
  BAR_CHART_VALUE_AXIS_THICKNESS,
} from './constants';

const HORIZONTAL_VALUE_TICK_LABEL_GAP = 8;

const getAxisIds = (
  configuredAxes: readonly BarChartValueAxis[] | undefined,
  series: readonly BarChartDisplaySeries[]
): readonly string[] => {
  const axisIds = Array.from(
    new Set(configuredAxes?.map((axis) => axis.id) ?? [])
  );
  for (const item of series) {
    if (!axisIds.includes(item.valueAxisId)) axisIds.push(item.valueAxisId);
  }
  return axisIds.length === 0 ? [BAR_CHART_DEFAULT_AXIS_ID] : axisIds;
};

const getHorizontalValueAxisEdgeMargin = (
  config: BarChartValueAxis,
  bars: readonly BarChartLayoutBar[]
) => {
  const scale = scaleLinear<number>({
    domain: getBarChartValueDomain(bars, config.id, config.domain),
    range: [0, 1],
    nice: config.nice ?? config.domain == null,
  });
  const tickValues =
    config.tickValues ??
    scale.ticks(config.tickCount ?? BAR_CHART_DEFAULT_TICK_COUNT);
  const formatValue = config.formatValue ?? formatBarChartValue;
  const tickLabelStyle = { fontSize: `${CHART_TICK_FONT_SIZE}px` };
  const maximumTickLabelWidth = Math.max(
    0,
    ...tickValues.map(
      (value) => getStringWidth(formatValue(value), tickLabelStyle) ?? 0
    )
  );
  return Math.ceil(maximumTickLabelWidth / 2);
};

const getAutomaticHorizontalValueAxisTickCount = (
  config: BarChartValueAxis,
  bars: readonly BarChartLayoutBar[],
  innerWidth: number
) => {
  const scale = scaleLinear<number>({
    domain: getBarChartValueDomain(bars, config.id, config.domain),
    range: [0, innerWidth],
    nice: config.nice ?? config.domain == null,
  });
  const formatValue = config.formatValue ?? formatBarChartValue;
  const tickLabelStyle = { fontSize: `${CHART_TICK_FONT_SIZE}px` };
  const maximumTickLabelWidth = Math.max(
    0,
    ...scale
      .ticks(BAR_CHART_DEFAULT_TICK_COUNT)
      .map(
        (value) =>
          getStringWidth(formatValue(value), tickLabelStyle) ??
          formatValue(value).length * CHART_TICK_FONT_SIZE
      )
  );
  const minimumTickSpacing =
    maximumTickLabelWidth + HORIZONTAL_VALUE_TICK_LABEL_GAP;

  return Math.max(
    1,
    Math.min(
      BAR_CHART_DEFAULT_TICK_COUNT,
      Math.floor(innerWidth / minimumTickSpacing)
    )
  );
};

const resolveAxes = (
  configuredAxes: readonly Omit<BarChartDisplayAxis, 'scale'>[],
  bars: readonly BarChartLayoutBar[],
  orientation: BarChartOrientation,
  innerWidth: number,
  innerHeight: number
): readonly BarChartDisplayAxis[] => {
  return configuredAxes.map((config) => {
    return {
      ...config,
      scale: scaleLinear<number>({
        domain: getBarChartValueDomain(bars, config.id, config.domain),
        range: orientation === 'vertical' ? [innerHeight, 0] : [0, innerWidth],
        nice: config.nice ?? config.domain == null,
      }),
    };
  });
};

/**
 * Responsive, presentational bars for categorical and time-bucket data. Supports
 * vertical or horizontal orientation, grouped or signed stacks, multiple value
 * axes, threshold bands, controlled legend filtering, selection and active
 * states, keyboard targets, and consumer-owned SVG slots.
 *
 * The component is deliberately presentational: consumers retain fetching,
 * sorting, Top-K/Other aggregation, formatting, tooltip content, links, frozen
 * interaction state, and the loading and empty states — pair it with
 * `ChartCard`, `ChartTooltip`, and `EmptyState`. Reach for `slots` before asking
 * for a new prop; each slot receives the resolved scales and geometry.
 *
 * @example
 * ```tsx
 * <BarChart
 *   aria-label="Requests by environment"
 *   series={[{ id: 'prod', label: 'Production', data }]}
 *   selectedIds={selectedIds}
 *   legendProps={{ onItemClick: (item) => toggleId(item.id) }}
 * />
 * ```
 */
export const BarChart = ({
  series,
  categoryAxis,
  valueAxes,
  mode = 'grouped',
  orientation = 'vertical',
  selectedIds,
  grid,
  valueBands = [],
  activeCategory,
  activeGuideBarId,
  activeBarId,
  selectionRange,
  categoryPadding,
  plotPadding,
  minimumPlotWidth = BAR_CHART_MINIMUM_PLOT_WIDTH,
  groupPadding = BAR_CHART_DEFAULT_GROUP_PADDING,
  minimumBarSize = BAR_CHART_DEFAULT_MINIMUM_BAR_SIZE,
  shouldAnimate = true,
  slots,
  isRendering = true,
  showLegend,
  legendProps,
  className,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  getBarAriaLabel,
  getCategoryAriaLabel,
  onDatumPointerDown,
  onDatumPointerMove,
  onDatumPointerOut,
  onDatumPointerUp,
  onDatumActivate,
  onDatumFocus,
  onDatumBlur,
  onBarPointerMove,
  onBarPointerOut,
  onBarActivate,
  onBarFocus,
  onBarBlur,
  ...rest
}: BarChartProps) => {
  const [containerRef, dimensions] = useResizeObserver();
  const isVertical = orientation === 'vertical';

  // The data half of the pipeline is independent of the measured size, and the
  // documented tooltip pattern re-renders this component on every pointermove.
  const { displaySeries, visibleSeries, categories, bars, axisIds } =
    useMemo(() => {
      const normalized = normalizeBarChartSeries(series);
      const defaultAxisId = valueAxes?.[0]?.id ?? BAR_CHART_DEFAULT_AXIS_ID;
      const resolved: readonly BarChartDisplaySeries[] = normalized.map(
        (item, index) => ({
          ...item,
          color:
            item.color ??
            (normalized.length === 1
              ? CHART_SINGLE_FILL_COLOR
              : getCategoricalFillChartColor(index)),
          valueAxisId: item.valueAxisId ?? defaultAxisId,
          opacity:
            item.opacity == null || !Number.isFinite(item.opacity)
              ? 1
              : clamp(item.opacity, 0, 1),
          cornerRadius:
            item.cornerRadius == null || !Number.isFinite(item.cornerRadius)
              ? BAR_CHART_DEFAULT_CORNER_RADIUS
              : Math.max(0, item.cornerRadius),
          cornerStyle: item.cornerStyle ?? 'end',
        })
      );
      const visible =
        selectedIds == null || selectedIds.size === 0
          ? resolved
          : resolved.filter((item) => selectedIds.has(item.id));
      const allCategories = getBarChartCategories(
        resolved,
        categoryAxis?.domain
      );
      return {
        displaySeries: resolved,
        visibleSeries: visible,
        categories: allCategories,
        bars: getBarChartLayout(visible, allCategories, mode),
        axisIds: getAxisIds(valueAxes, visible),
      };
    }, [series, valueAxes, selectedIds, categoryAxis?.domain, mode]);

  // A vertical value axis is only as wide as its widest tick label needs, so
  // currency and large counts are not clipped by a fixed gutter.
  const getValueAxisThickness = (config: BarChartValueAxis) => {
    if (config?.thickness != null) return Math.max(0, config.thickness);
    const labelThickness =
      config?.label == null ? 0 : CHART_AXIS_LABEL_THICKNESS;
    if (!isVertical) return BAR_CHART_AXIS_THICKNESS + labelThickness;
    return (
      Math.max(
        BAR_CHART_VALUE_AXIS_THICKNESS,
        getYAxisLeftMargin({
          yDomain: getBarChartValueDomain(bars, config.id, config.domain),
          formatTick: config?.formatValue ?? formatBarChartValue,
          fontSize: CHART_TICK_FONT_SIZE,
          numTicks: config?.tickCount ?? BAR_CHART_DEFAULT_TICK_COUNT,
          tickValues: config?.tickValues,
          tickLength: CHART_VALUE_AXIS_TICK_LENGTH,
          nice: config?.nice ?? config?.domain == null,
        })
      ) + labelThickness
    );
  };
  const configuredAxesById = new Map(
    valueAxes?.map((axis) => [axis.id, axis]) ?? []
  );
  const resolvedValueAxes: readonly Omit<BarChartDisplayAxis, 'scale'>[] =
    axisIds.map((axisId) => {
      const config = configuredAxesById.get(axisId) ?? { id: axisId };
      return {
        ...config,
        thickness: getValueAxisThickness(config),
      };
    });
  const primaryAxisThickness =
    resolvedValueAxes[0]?.thickness ?? BAR_CHART_VALUE_AXIS_THICKNESS;
  const secondaryAxisThickness = resolvedValueAxes
    .slice(1)
    .reduce((total, axis) => total + axis.thickness, 0);
  const padding = {
    top: Math.max(0, plotPadding?.top ?? 0),
    right: Math.max(0, plotPadding?.right ?? 0),
    bottom: Math.max(0, plotPadding?.bottom ?? 0),
    left: Math.max(0, plotPadding?.left ?? 0),
  };
  const defaultCategoryAxisThickness =
    (isVertical
      ? BAR_CHART_AXIS_THICKNESS
      : BAR_CHART_HORIZONTAL_CATEGORY_AXIS_THICKNESS) +
    (categoryAxis?.label == null ? 0 : CHART_AXIS_LABEL_THICKNESS);
  const categoryAxisThickness =
    categoryAxis?.thickness ?? defaultCategoryAxisThickness;
  const horizontalValueAxisEdgeMargin =
    isVertical || resolvedValueAxes[0] == null
      ? 0
      : getHorizontalValueAxisEdgeMargin(resolvedValueAxes[0], bars);
  const chartMargin = isVertical
    ? {
        top: BAR_CHART_MARGIN_TOP + padding.top,
        right: BAR_CHART_MARGIN_RIGHT + secondaryAxisThickness + padding.right,
        bottom: categoryAxisThickness + padding.bottom,
        left: primaryAxisThickness + padding.left,
      }
    : {
        top: BAR_CHART_MARGIN_TOP + secondaryAxisThickness + padding.top,
        right:
          Math.max(BAR_CHART_MARGIN_RIGHT, horizontalValueAxisEdgeMargin) +
          padding.right,
        bottom: primaryAxisThickness + padding.bottom,
        left:
          Math.max(categoryAxisThickness, horizontalValueAxisEdgeMargin) +
          padding.left,
      };
  const chartWidth =
    dimensions.width === 0
      ? 0
      : Math.max(
          dimensions.width,
          chartMargin.left + chartMargin.right + Math.max(0, minimumPlotWidth)
        );
  const innerWidth = Math.max(
    0,
    chartWidth - chartMargin.left - chartMargin.right
  );
  const innerHeight = Math.max(
    0,
    dimensions.height - chartMargin.top - chartMargin.bottom
  );
  const sizedValueAxes = isVertical
    ? resolvedValueAxes
    : resolvedValueAxes.map((axis) =>
        axis.tickCount != null || axis.tickValues != null
          ? axis
          : {
              ...axis,
              tickCount: getAutomaticHorizontalValueAxisTickCount(
                axis,
                bars,
                innerWidth
              ),
            }
      );
  const axes = resolveAxes(
    sizedValueAxes,
    bars,
    orientation,
    innerWidth,
    innerHeight
  );
  const legendItems: readonly ChartLegendItem[] = displaySeries.map((item) => ({
    id: item.id,
    label: item.label,
    markerColor: item.color,
    selected: selectedIds?.has(item.id) ?? false,
  }));
  const hasLegend =
    (showLegend ?? legendItems.length > 1) && legendItems.length > 0;
  const legendLayout = legendProps?.layout ?? 'inline';

  const plot = (
    <div
      ref={containerRef}
      className={cn(
        'relative size-full min-h-0 min-w-0 overflow-y-hidden',
        minimumPlotWidth <= 0 ? 'overflow-x-hidden' : 'overflow-x-auto'
      )}
    >
      <div className="h-full min-h-0" style={{ width: chartWidth }}>
        <BarChartPlot
          width={chartWidth}
          height={dimensions.height}
          innerWidth={innerWidth}
          innerHeight={innerHeight}
          chartMargin={chartMargin}
          categories={categories}
          series={visibleSeries}
          bars={bars}
          axes={axes}
          orientation={orientation}
          categoryAxis={categoryAxis}
          categoryAxisThickness={categoryAxisThickness}
          categoryPadding={{
            inner: clamp(
              categoryPadding?.inner ??
                BAR_CHART_DEFAULT_CATEGORY_PADDING_INNER,
              0,
              1
            ),
            outer: clamp(
              categoryPadding?.outer ??
                BAR_CHART_DEFAULT_CATEGORY_PADDING_OUTER,
              0,
              1
            ),
          }}
          groupPadding={clamp(groupPadding, 0, 0.95)}
          minimumBarSize={Math.max(0, minimumBarSize)}
          shouldAnimate={shouldAnimate}
          grid={grid}
          valueBands={valueBands}
          activeCategory={activeCategory}
          activeGuideBarId={activeGuideBarId}
          activeBarId={activeBarId}
          selectionRange={selectionRange}
          slots={slots}
          isRendering={isRendering}
          aria-label={ariaLabel}
          aria-describedby={ariaDescribedBy}
          getBarAriaLabel={getBarAriaLabel}
          getCategoryAriaLabel={getCategoryAriaLabel}
          onDatumPointerDown={onDatumPointerDown}
          onDatumPointerMove={onDatumPointerMove}
          onDatumPointerOut={onDatumPointerOut}
          onDatumPointerUp={onDatumPointerUp}
          onDatumActivate={onDatumActivate}
          onDatumFocus={onDatumFocus}
          onDatumBlur={onDatumBlur}
          onBarPointerMove={onBarPointerMove}
          onBarPointerOut={onBarPointerOut}
          onBarActivate={onBarActivate}
          onBarFocus={onBarFocus}
          onBarBlur={onBarBlur}
        />
      </div>
    </div>
  );

  const legend = (
    <ChartLegend
      aria-label={`${ariaLabel} legend`}
      {...legendProps}
      layout={legendLayout}
      items={legendItems}
    />
  );

  return (
    <div
      className={cn('size-full min-h-0 min-w-0 @container', className)}
      {...rest}
    >
      {hasLegend ? (
        <div
          className={cn(
            'grid size-full min-h-0 min-w-0 grid-cols-1',
            legendLayout === 'list'
              ? 'grid-rows-[minmax(0,1fr)_minmax(0,35%)] gap-space-3 @[560px]:grid-cols-[minmax(0,1fr)_minmax(10rem,30%)] @[560px]:grid-rows-1 @[560px]:gap-space-5'
              : 'grid-rows-[auto_minmax(0,1fr)] gap-space-2'
          )}
        >
          {legendLayout === 'list' ? (
            <>
              {plot}
              <div className="scroll-mask-t scroll-mask-b min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
                {legend}
              </div>
            </>
          ) : (
            <>
              {legend}
              {plot}
            </>
          )}
        </div>
      ) : (
        plot
      )}
    </div>
  );
};
