import { useState, type HTMLAttributes } from 'react';

import { useResizeObserver } from '@mantine/hooks';
import { scaleLinear } from '@visx/scale';

import { getCategoricalLineChartColor } from '../../utils/chartColors';
import {
  CHART_AXIS_LABEL_THICKNESS,
  CHART_TICK_FONT_SIZE,
  CHART_VALUE_AXIS_TICK_LENGTH,
} from '../../utils/chartConstants';
import { cn } from '../../utils/cn';
import { getYAxisLeftMargin } from '../../utils/getYAxisLeftMargin';
import { ChartLegend, type ChartLegendItem } from '../ChartLegend';
import {
  LINE_CHART_DEFAULT_TICK_COUNT,
  LINE_CHART_VALUE_AXIS_THICKNESS,
} from './constants';
import type {
  LineChartDisplayAxis,
  LineChartDisplaySeries,
  LineChartProps,
  LineChartYAxis,
} from './LineChart.types';
import {
  createLineChartXScaleAdapter,
  getLineChartYDomainValues,
  getLineSegments,
  getNumericDomain,
  normalizeLineChartSeries,
} from './LineChart.utils';
import { LineChartPlot } from './LineChartPlot';

export type {
  LineChartDisplayAxis,
  LineChartDisplaySeries,
  LineChartGrid,
  LineChartInteractionDatum,
  LineChartInteractionPoint,
  LineChartPoint,
  LineChartProps,
  LineChartSelectionRange,
  LineChartSeries,
  LineChartXScale,
  LineChartYBand,
  LineChartYAxis,
} from './LineChart.types';

type LineChartAxisLayout = {
  config: LineChartYAxis;
  domain: [number, number];
  nice: boolean;
  thickness: number;
};

const DEFAULT_AXIS_ID = 'line-chart-default-axis';
const CHART_MARGIN_TOP = 8;
const CHART_MARGIN_BOTTOM = 28;
const CHART_MARGIN_RIGHT = 8;
const DEFAULT_STROKE_WIDTH = 2;
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const defaultFormatValue = (value: number) => NUMBER_FORMATTER.format(value);

const resolveAxisLayouts = (
  series: readonly LineChartDisplaySeries[],
  configuredAxes: readonly LineChartYAxis[] | undefined,
  xDomain: readonly [number, number],
  connectNulls: boolean
): readonly LineChartAxisLayout[] => {
  const axisConfigs = new Map(
    configuredAxes?.map((axis) => [axis.id, axis]) ?? []
  );
  const axisIds = Array.from(
    new Set(configuredAxes?.map((axis) => axis.id) ?? [])
  );

  for (const item of series) {
    if (!axisIds.includes(item.yAxisId)) axisIds.push(item.yAxisId);
  }
  if (axisIds.length === 0) axisIds.push(DEFAULT_AXIS_ID);

  return axisIds.map((axisId): LineChartAxisLayout => {
    const config = axisConfigs.get(axisId) ?? { id: axisId };
    const values = series
      .filter((item) => item.yAxisId === axisId)
      .flatMap((item) =>
        getLineChartYDomainValues(item.points, xDomain, connectNulls)
      );
    const domain = getNumericDomain(values, config.domain);
    const nice = config.domain == null;
    const tickLabelThickness = getYAxisLeftMargin({
      yDomain: domain,
      formatTick: config.formatValue ?? defaultFormatValue,
      fontSize: CHART_TICK_FONT_SIZE,
      numTicks: config.tickCount ?? LINE_CHART_DEFAULT_TICK_COUNT,
      tickValues: config.tickValues,
      tickLength: CHART_VALUE_AXIS_TICK_LENGTH,
      nice,
    });
    return {
      config,
      domain,
      nice,
      thickness:
        Math.max(LINE_CHART_VALUE_AXIS_THICKNESS, tickLabelThickness) +
        (config.label == null ? 0 : CHART_AXIS_LABEL_THICKNESS),
    };
  });
};

const resolveAxes = (
  layouts: readonly LineChartAxisLayout[],
  innerHeight: number
): readonly LineChartDisplayAxis[] =>
  layouts.map(({ config, domain, nice, thickness }) => ({
    ...config,
    thickness,
    scale: scaleLinear<number>({
      domain,
      range: [innerHeight, 0],
      nice,
    }),
  }));

/**
 * Responsive numeric line chart with nullable observations, multiple axes,
 * legend filtering, configurable grids and x scales, brushing, and
 * consumer-owned tooltip interactions.
 */
export const LineChart = ({
  series,
  yAxes,
  xDomain,
  formatXValue = defaultFormatValue,
  xScale: xScaleType = 'linear',
  xTickCount,
  xTickValues,
  selectedIds,
  showPoints = false,
  connectNulls = true,
  grid,
  activeX,
  activeLegendItemId,
  selectionRange,
  yBands = [],
  renderActiveOverlay,
  shouldAnimate = true,
  isRendering = true,
  showLegend,
  legendProps,
  onDatumPointerDown,
  onDatumPointerMove,
  onDatumPointerOut,
  onDatumPointerUp,
  className,
  ...rest
}: LineChartProps) => {
  const [activeBuiltInLegendItemId, setActiveBuiltInLegendItemId] = useState<
    string | null
  >(null);
  const ariaProps = {
    'aria-describedby': rest['aria-describedby'],
    'aria-label': rest['aria-label'],
  };
  const rootProps: HTMLAttributes<HTMLDivElement> = { ...rest };
  delete rootProps['aria-describedby'];
  delete rootProps['aria-label'];

  const [containerRef, dimensions] = useResizeObserver();
  const normalizedSeries = normalizeLineChartSeries(series);
  const defaultAxisId = yAxes?.[0]?.id ?? DEFAULT_AXIS_ID;
  const displaySeries: readonly LineChartDisplaySeries[] = normalizedSeries.map(
    (item, index) => ({
      ...item,
      color: item.color ?? getCategoricalLineChartColor(index),
      yAxisId: item.yAxisId ?? defaultAxisId,
      strokeWidth:
        item.strokeWidth == null || !Number.isFinite(item.strokeWidth)
          ? DEFAULT_STROKE_WIDTH
          : Math.max(0, item.strokeWidth),
      opacity:
        item.opacity == null || !Number.isFinite(item.opacity)
          ? 1
          : Math.min(1, Math.max(0, item.opacity)),
      showActiveMarker: item.showActiveMarker ?? true,
    })
  );
  const visibleSeries =
    selectedIds == null || selectedIds.size === 0
      ? displaySeries
      : displaySeries.filter((item) => selectedIds.has(item.id));
  const xValues = visibleSeries.flatMap((item) =>
    item.points.map((point) => point.x)
  );
  const resolvedXDomain = getNumericDomain(xValues, xDomain);
  const uniqueXValues = Array.from(
    new Set(
      xValues.filter(
        (value) => value >= resolvedXDomain[0] && value <= resolvedXDomain[1]
      )
    )
  ).sort((left, right) => left - right);
  const renderedSeries =
    xScaleType === 'band'
      ? visibleSeries.map((item) => ({
          ...item,
          points: item.points.filter(
            (point) =>
              point.x >= resolvedXDomain[0] && point.x <= resolvedXDomain[1]
          ),
        }))
      : visibleSeries;
  const renderedActiveX =
    xScaleType !== 'band' ||
    (activeX != null &&
      activeX >= resolvedXDomain[0] &&
      activeX <= resolvedXDomain[1])
      ? activeX
      : undefined;
  const axisLayouts = resolveAxisLayouts(
    renderedSeries,
    yAxes,
    resolvedXDomain,
    connectNulls
  );
  const chartMargin = {
    top: CHART_MARGIN_TOP,
    right:
      CHART_MARGIN_RIGHT +
      axisLayouts.slice(1).reduce((total, axis) => total + axis.thickness, 0),
    bottom: CHART_MARGIN_BOTTOM,
    left: axisLayouts[0]?.thickness ?? LINE_CHART_VALUE_AXIS_THICKNESS,
  };
  const innerWidth = Math.max(
    0,
    dimensions.width - chartMargin.left - chartMargin.right
  );
  const innerHeight = Math.max(
    0,
    dimensions.height - chartMargin.top - chartMargin.bottom
  );
  const xScaleAdapter = createLineChartXScaleAdapter({
    type: xScaleType,
    domain: resolvedXDomain,
    values: uniqueXValues,
    width: innerWidth,
    nice: xDomain == null,
  });
  const axes = resolveAxes(axisLayouts, innerHeight);

  const activeXPos =
    renderedActiveX == null ? null : xScaleAdapter.getPosition(renderedActiveX);
  const overlayX =
    activeXPos != null && activeXPos >= 0 && activeXPos <= innerWidth
      ? chartMargin.left + activeXPos
      : null;

  const legendItems: readonly ChartLegendItem[] = displaySeries.map((item) => ({
    id: item.id,
    label: item.label,
    markerColor: item.color,
    selected: selectedIds?.has(item.id) ?? false,
  }));
  const hasLegend =
    (showLegend ?? legendItems.length > 1) && legendItems.length > 0;
  const legendLayout = legendProps?.layout ?? 'inline';
  const requestedActiveLegendItemId =
    (hasLegend ? activeBuiltInLegendItemId : null) ?? activeLegendItemId;
  const renderedActiveLegendItemId = renderedSeries.some((item) => {
    if (item.id !== requestedActiveLegendItemId) return false;

    const [domainMinimum, domainMaximum] = resolvedXDomain;
    const hasVisiblePoint =
      showPoints &&
      item.points.some(
        (point) =>
          point.y != null &&
          point.x >= domainMinimum &&
          point.x <= domainMaximum
      );
    if (hasVisiblePoint) return true;

    return getLineSegments(item.points, connectNulls).some((segment) =>
      segment.some((point, index) => {
        const nextPoint = segment[index + 1];
        return (
          nextPoint != null &&
          point.x <= domainMaximum &&
          nextPoint.x >= domainMinimum
        );
      })
    );
  })
    ? requestedActiveLegendItemId
    : null;
  const showGridRows = grid === false ? false : (grid?.rows ?? true);
  const showGridColumns = grid === false ? false : (grid?.columns ?? true);

  const plot = (
    <div ref={containerRef} className="relative size-full min-h-0 min-w-0">
      <LineChartPlot
        width={dimensions.width}
        height={dimensions.height}
        innerWidth={innerWidth}
        innerHeight={innerHeight}
        chartMargin={chartMargin}
        xScale={xScaleAdapter.scale}
        getXPosition={xScaleAdapter.getPosition}
        getXValue={xScaleAdapter.getValue}
        getXRangePosition={xScaleAdapter.getRangePosition}
        uniqueXValues={uniqueXValues}
        axes={axes}
        series={renderedSeries}
        formatXValue={formatXValue}
        xTickCount={xTickCount}
        xTickValues={xTickValues}
        showPoints={showPoints}
        connectNulls={connectNulls}
        showGridRows={showGridRows}
        showGridColumns={showGridColumns}
        activeX={renderedActiveX}
        activeLegendItemId={renderedActiveLegendItemId}
        selectionRange={selectionRange}
        yBands={yBands}
        shouldAnimate={shouldAnimate}
        isRendering={isRendering}
        {...ariaProps}
        onDatumPointerDown={onDatumPointerDown}
        onDatumPointerMove={onDatumPointerMove}
        onDatumPointerOut={onDatumPointerOut}
        onDatumPointerUp={onDatumPointerUp}
      />
      {renderActiveOverlay != null &&
        overlayX != null &&
        renderedActiveX != null &&
        renderActiveOverlay({ xPosition: overlayX, activeX: renderedActiveX })}
    </div>
  );

  const legend = (
    <ChartLegend
      aria-label={`${ariaProps['aria-label']} legend`}
      {...legendProps}
      layout={legendLayout}
      items={legendItems}
      onItemActiveChange={(item) => {
        setActiveBuiltInLegendItemId(item?.id ?? null);
        legendProps?.onItemActiveChange?.(item);
      }}
    />
  );

  return (
    <div
      className={cn('size-full min-h-0 min-w-0 @container', className)}
      {...rootProps}
    >
      {hasLegend ? (
        <div
          className={cn(
            'grid size-full min-h-0 min-w-0 grid-cols-1',
            legendLayout === 'list'
              ? 'grid-rows-[minmax(0,1fr)_minmax(0,35%)] gap-space-3 @[560px]:grid-cols-[minmax(0,1fr)_minmax(10rem,30%)] @[560px]:grid-rows-1 @[560px]:gap-space-5'
              : 'grid-rows-[minmax(0,1fr)_auto] gap-space-2'
          )}
        >
          {plot}
          {legendLayout === 'list' ? (
            <div className="scroll-mask-t scroll-mask-b min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
              {legend}
            </div>
          ) : (
            legend
          )}
        </div>
      ) : (
        plot
      )}
    </div>
  );
};
