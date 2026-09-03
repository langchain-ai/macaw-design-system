import type {
  AriaAttributes,
  HTMLAttributes,
  PointerEvent,
  ReactNode,
} from 'react';

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
import {
  ChartLegend,
  type ChartLegendItem,
  type ChartLegendProps,
} from '../ChartLegend';
import {
  LINE_CHART_DEFAULT_TICK_COUNT,
  LINE_CHART_VALUE_AXIS_THICKNESS,
} from './constants';
import {
  createLineChartXScaleAdapter,
  getLineChartYDomainValues,
  getNumericDomain,
  normalizeLineChartSeries,
} from './LineChart.utils';
import { LineChartPlot } from './LineChartPlot';

export type LineChartPoint = {
  x: number;
  y: number | null;
};

export type LineChartSeries = {
  id: string;
  label: ReactNode;
  /** Plain-text series name used by assistive technology. Defaults to `id`. */
  'aria-label'?: AriaAttributes['aria-label'];
  points: readonly LineChartPoint[];
  color?: string;
  yAxisId?: string;
  /** Defaults to 2. */
  strokeWidth?: number;
  /** SVG dash pattern such as `5 4`. */
  strokeDasharray?: string;
  /** Series opacity from 0 to 1. Defaults to 1. */
  opacity?: number;
  /** Whether the controlled crosshair draws this series' marker. Defaults to true. */
  showActiveMarker?: boolean;
};

export type LineChartYAxis = {
  id: string;
  label?: string;
  domain?: readonly [number, number];
  formatValue?: (value: number) => string;
  tickCount?: number;
  /** Fixed y-axis and horizontal-grid tick values. */
  tickValues?: readonly number[];
};

export type LineChartInteractionPoint = {
  seriesId: string;
  seriesLabel: ReactNode;
  color: string;
  value: number | null;
};

export type LineChartInteractionDatum = {
  /** Nearest rendered data bucket. */
  x: number;
  /** Unsnapped x-domain value directly beneath the pointer. */
  pointerX: number;
  /** Horizontal SVG coordinate for positioning consumer-owned overlays. */
  xPosition: number;
  points: readonly LineChartInteractionPoint[];
};

export type LineChartXScale = 'linear' | 'band';

export type LineChartSelectionRange = {
  from: number;
  to: number;
};

export type LineChartGrid = {
  /** Defaults to true. Grid guides are dashed. */
  rows?: boolean;
  /** Defaults to true. Grid guides are dashed. */
  columns?: boolean;
};

export type LineChartYBand = {
  id: string;
  /** Defaults to the primary y axis. */
  yAxisId?: string;
  /** Defaults to the lower edge of the axis domain. */
  from?: number;
  /** Defaults to the upper edge of the axis domain. */
  to?: number;
  /** Use a design-system CSS color token. */
  color: string;
  opacity?: number;
};

export type LineChartDisplaySeries = {
  id: string;
  label: ReactNode;
  'aria-label'?: AriaAttributes['aria-label'];
  points: readonly LineChartPoint[];
  color: string;
  yAxisId: string;
  strokeWidth: number;
  strokeDasharray?: string;
  opacity: number;
  showActiveMarker: boolean;
};

export type LineChartDisplayAxis = LineChartYAxis & {
  thickness: number;
  scale: ReturnType<typeof scaleLinear<number>>;
};

type LineChartAxisLayout = {
  config: LineChartYAxis;
  domain: [number, number];
  nice: boolean;
  thickness: number;
};

type LineChartLegendProps = Omit<ChartLegendProps, 'items'>;

type LineChartLegendConfig =
  | {
      showLegend?: true;
      legendProps?: LineChartLegendProps;
    }
  | {
      showLegend: false;
      legendProps?: never;
    };

export type LineChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  | 'children'
  | 'onPointerLeave'
  | 'onPointerMove'
  | 'onPointerOut'
  | 'onPointerUp'
  | 'aria-describedby'
  | 'aria-label'
> &
  LineChartLegendConfig & {
    series: readonly LineChartSeries[];
    yAxes?: readonly LineChartYAxis[];
    xDomain?: readonly [number, number];
    formatXValue?: (value: number) => string;
    /** Linear preserves elapsed distance; band spaces buckets evenly. Defaults to linear. */
    xScale?: LineChartXScale;
    xTickCount?: number;
    xTickValues?: readonly number[];
    selectedIds?: ReadonlySet<string>;
    showPoints?: boolean;
    /** Connects valid observations across null values. Defaults to true. */
    connectNulls?: boolean;
    /** Visible horizontal and vertical grid lines. Pass false to hide both. */
    grid?: LineChartGrid | false;
    /** Draws a crosshair and point markers at this x value. */
    activeX?: number;
    /** Controlled x-domain range drawn over the plot for brush selection. */
    selectionRange?: LineChartSelectionRange;
    /** Background ranges such as warning or threshold regions. */
    yBands?: readonly LineChartYBand[];
    /**
     * Rendered inside the plot's relative container at the resolved activeX
     * position (SVG-container-relative pixels). Only invoked when activeX is
     * inside the plot bounds.
     */
    renderActiveOverlay?: (info: {
      xPosition: number;
      activeX: number;
    }) => ReactNode;
    /** Animates the chart unless reduced motion is preferred. Defaults to true. */
    shouldAnimate?: boolean;
    isRendering?: boolean;
    'aria-describedby'?: AriaAttributes['aria-describedby'];
    'aria-label': string;
    onDatumPointerMove?: (
      datum: LineChartInteractionDatum,
      event: PointerEvent<SVGSVGElement>
    ) => void;
    onDatumPointerDown?: (
      datum: LineChartInteractionDatum,
      event: PointerEvent<SVGSVGElement>
    ) => void;
    onDatumPointerOut?: () => void;
    onDatumPointerUp?: (
      datum: LineChartInteractionDatum,
      event: PointerEvent<SVGSVGElement>
    ) => void;
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
