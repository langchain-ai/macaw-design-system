import { useId, type AriaAttributes, type PointerEvent } from 'react';

import { animated, useReducedMotion, useSpring } from '@react-spring/web';
import { AxisBottom, AxisLeft, AxisRight } from '@visx/axis';
import { curveLinear } from '@visx/curve';
import { GridColumns, GridRows } from '@visx/grid';
import { Group } from '@visx/group';
import type { scaleBand, scaleLinear } from '@visx/scale';
import { LinePath } from '@visx/shape';

import {
  getChartAxisLabelOffset,
  getSecondaryChartAxisOffset,
} from '../../utils/chartAxisLayout';
import {
  CHART_DIMMED_OPACITY,
  CHART_DASHED_STROKE_DASHARRAY,
  CHART_TICK_FONT_SIZE,
  CHART_VALUE_AXIS_TICK_LENGTH,
} from '../../utils/chartConstants';
import {
  getChartTickValues,
  getNearestChartValue,
} from '../../utils/chartValues';
import { cn } from '../../utils/cn';
import { Tooltip } from '../Tooltip';
import { LINE_CHART_DEFAULT_TICK_COUNT } from './constants';
import type {
  LineChartDisplayAxis,
  LineChartDisplaySeries,
  LineChartInteractionDatum,
  LineChartSelectionRange,
  LineChartYBand,
} from './LineChart.types';
import { getLineSegments, getSelectionBounds } from './LineChart.utils';

const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

const defaultFormatValue = (value: number) => NUMBER_FORMATTER.format(value);

const getInteractionDatum = (
  nearestX: number,
  series: readonly LineChartDisplaySeries[],
  xPosition: number,
  pointerX: number
): LineChartInteractionDatum => ({
  x: nearestX,
  pointerX,
  xPosition,
  points: series.map((item) => ({
    seriesId: item.id,
    seriesLabel: item.label,
    color: item.color,
    value: item.points.find((point) => point.x === nearestX)?.y ?? null,
  })),
});

type LineChartPlotProps = {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  chartMargin: { top: number; right: number; bottom: number; left: number };
  xScale:
    | ReturnType<typeof scaleLinear<number>>
    | ReturnType<typeof scaleBand<number>>;
  getXPosition: (value: number) => number;
  getXValue: (position: number) => number;
  getXRangePosition: (value: number) => number;
  uniqueXValues: readonly number[];
  axes: readonly LineChartDisplayAxis[];
  series: readonly LineChartDisplaySeries[];
  formatXValue: (value: number) => string;
  xTickCount?: number;
  xTickValues?: readonly number[];
  showPoints: boolean;
  connectNulls: boolean;
  showGridRows: boolean;
  showGridColumns: boolean;
  activeX?: number;
  activeLegendItemId?: string | null;
  selectionRange?: LineChartSelectionRange;
  yBands: readonly LineChartYBand[];
  shouldAnimate: boolean;
  isRendering: boolean;
  'aria-describedby'?: AriaAttributes['aria-describedby'];
  'aria-label': string;
  onDatumPointerDown?: (
    datum: LineChartInteractionDatum,
    event: PointerEvent<SVGSVGElement>
  ) => void;
  onDatumPointerMove?: (
    datum: LineChartInteractionDatum,
    event: PointerEvent<SVGSVGElement>
  ) => void;
  onDatumPointerOut?: () => void;
  onDatumPointerUp?: (
    datum: LineChartInteractionDatum,
    event: PointerEvent<SVGSVGElement>
  ) => void;
};

export const LineChartPlot = ({
  width,
  height,
  innerWidth,
  innerHeight,
  chartMargin,
  xScale,
  getXPosition,
  getXValue,
  getXRangePosition,
  uniqueXValues,
  axes,
  series,
  formatXValue,
  xTickCount,
  xTickValues,
  showPoints,
  connectNulls,
  showGridRows,
  showGridColumns,
  activeX,
  activeLegendItemId,
  selectionRange,
  yBands,
  shouldAnimate,
  isRendering,
  onDatumPointerDown,
  onDatumPointerMove,
  onDatumPointerOut,
  onDatumPointerUp,
  ...ariaProps
}: LineChartPlotProps) => {
  const clipPathId = `line-chart-${useId().replace(/:/g, '')}`;
  const revealClipPathId = `${clipPathId}-reveal`;
  const axisById = new Map(axes.map((axis) => [axis.id, axis]));
  const primaryAxis = axes[0];
  const hasPointerInteraction =
    onDatumPointerDown != null ||
    onDatumPointerMove != null ||
    onDatumPointerUp != null;
  const resolvedXTickCount = xTickCount ?? (width < 480 ? 3 : 5);
  const resolvedXTickValues =
    xTickValues == null
      ? getChartTickValues(uniqueXValues, resolvedXTickCount)
      : Array.from(xTickValues);
  const activeXPosition = activeX == null ? null : getXPosition(activeX);
  const hasActiveX =
    activeXPosition != null &&
    activeXPosition >= 0 &&
    activeXPosition <= innerWidth;
  const canRender = isRendering && innerWidth > 0 && innerHeight > 0;
  const isReducedMotion = (useReducedMotion() ?? false) || !shouldAnimate;
  const hasRenderedSeries = canRender && series.length > 0;
  const getSeriesOpacity = (item: LineChartDisplaySeries) =>
    item.opacity *
    (activeLegendItemId != null && activeLegendItemId !== item.id
      ? CHART_DIMMED_OPACITY
      : 1);
  const visibleSeriesKey = JSON.stringify(series.map((item) => item.id));
  const [animation] = useSpring(
    () => ({
      from: { progress: 0 },
      to: { progress: hasRenderedSeries ? 1 : 0 },
      reset: true,
      immediate: isReducedMotion,
    }),
    [visibleSeriesKey, hasRenderedSeries, isReducedMotion]
  );

  const getDatumFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (uniqueXValues.length === 0 || innerWidth === 0) return null;
    const bounds = event.currentTarget.getBoundingClientRect();
    const plotY = event.clientY - bounds.top - chartMargin.top;
    if (plotY < 0 || plotY > innerHeight) return null;
    const plotX = Math.max(
      0,
      Math.min(innerWidth, event.clientX - bounds.left - chartMargin.left)
    );
    const pointerX = getXValue(plotX);
    const nearestX = getNearestChartValue(uniqueXValues, plotX, getXPosition);
    return nearestX == null
      ? null
      : getInteractionDatum(
          nearestX,
          series,
          chartMargin.left + getXPosition(nearestX),
          pointerX
        );
  };

  const selectionStartX =
    selectionRange == null ? null : getXRangePosition(selectionRange.from);
  const selectionEndX =
    selectionRange == null ? null : getXRangePosition(selectionRange.to);
  const selectionBounds = getSelectionBounds(
    selectionStartX,
    selectionEndX,
    innerWidth
  );
  const handlePointerMove =
    onDatumPointerMove == null
      ? undefined
      : (event: PointerEvent<SVGSVGElement>) => {
          const datum = getDatumFromPointer(event);
          if (datum != null) onDatumPointerMove(datum, event);
        };
  const handlePointerDown =
    onDatumPointerDown == null
      ? undefined
      : (event: PointerEvent<SVGSVGElement>) => {
          const datum = getDatumFromPointer(event);
          if (datum != null) onDatumPointerDown(datum, event);
        };
  const handlePointerUp =
    onDatumPointerUp == null
      ? undefined
      : (event: PointerEvent<SVGSVGElement>) => {
          const datum = getDatumFromPointer(event);
          if (datum != null) onDatumPointerUp(datum, event);
        };

  return (
    <svg
      width={width}
      height={height}
      role="img"
      {...ariaProps}
      focusable="false"
      className={cn(
        'block size-full',
        hasPointerInteraction && 'cursor-crosshair'
      )}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={onDatumPointerOut}
      onPointerUp={handlePointerUp}
    >
      {canRender && (
        <Group left={chartMargin.left} top={chartMargin.top}>
          <defs>
            <clipPath id={clipPathId}>
              <rect width={innerWidth} height={innerHeight} />
            </clipPath>
            <clipPath id={revealClipPathId}>
              <animated.rect
                width={animation.progress.to(
                  (progress) => progress * innerWidth
                )}
                height={innerHeight}
              />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipPathId})`}>
            {yBands.map((band) => {
              const axis =
                band.yAxisId == null ? primaryAxis : axisById.get(band.yAxisId);
              if (axis == null) return null;
              const domain = axis.scale.domain();
              const from = band.from ?? domain[0];
              const to = band.to ?? domain.at(-1);
              if (from == null || to == null) return null;
              const fromY = axis.scale(from);
              const toY = axis.scale(to);
              return (
                <rect
                  key={band.id}
                  width={innerWidth}
                  height={Math.abs(toY - fromY)}
                  y={Math.min(fromY, toY)}
                  fill={band.color}
                  fillOpacity={band.opacity ?? 0.12}
                />
              );
            })}
          </g>
          {showGridRows && primaryAxis != null && (
            <GridRows
              scale={primaryAxis.scale}
              width={innerWidth}
              numTicks={primaryAxis.tickCount ?? LINE_CHART_DEFAULT_TICK_COUNT}
              tickValues={
                primaryAxis.tickValues == null
                  ? undefined
                  : Array.from(primaryAxis.tickValues)
              }
              stroke="var(--border-subtle)"
              strokeDasharray={CHART_DASHED_STROKE_DASHARRAY}
            />
          )}
          {showGridColumns && (
            <GridColumns
              scale={xScale}
              height={innerHeight}
              numTicks={resolvedXTickCount}
              tickValues={resolvedXTickValues}
              stroke="var(--border-subtle)"
              strokeDasharray={CHART_DASHED_STROKE_DASHARRAY}
            />
          )}
          <AxisBottom
            scale={xScale}
            top={innerHeight}
            numTicks={resolvedXTickCount}
            tickValues={resolvedXTickValues}
            hideAxisLine
            hideTicks
            tickFormat={(value) => formatXValue(value.valueOf())}
            tickLabelProps={{
              fill: 'var(--text-tertiary)',
              fontSize: CHART_TICK_FONT_SIZE,
              textAnchor: 'middle',
              dy: '0.5em',
            }}
          />
          {axes.map((axis, index) => {
            const tickFormat = (value: { valueOf(): number }) =>
              (axis.formatValue ?? defaultFormatValue)(value.valueOf());
            const textAnchor: 'end' | 'start' = index === 0 ? 'end' : 'start';
            const tickValues =
              axis.tickValues == null ? undefined : Array.from(axis.tickValues);
            const axisProps = {
              scale: axis.scale,
              numTicks: axis.tickCount ?? LINE_CHART_DEFAULT_TICK_COUNT,
              tickValues,
              tickLength: CHART_VALUE_AXIS_TICK_LENGTH,
              hideAxisLine: true,
              hideTicks: true,
              tickFormat,
              tickLabelProps: {
                fill: 'var(--text-tertiary)',
                fontSize: CHART_TICK_FONT_SIZE,
                textAnchor,
                dx: index === 0 ? '-0.25em' : '0.25em',
                dy: '0.25em',
              },
            };
            return index === 0 ? (
              <AxisLeft key={axis.id} {...axisProps} />
            ) : (
              <AxisRight
                key={axis.id}
                {...axisProps}
                left={innerWidth + getSecondaryChartAxisOffset(axes, index)}
              />
            );
          })}
          <g clipPath={`url(#${clipPathId})`}>
            <g clipPath={`url(#${revealClipPathId})`}>
              {series.map((item) => {
                const axis = axisById.get(item.yAxisId);
                if (axis == null) return null;
                return (
                  <g
                    key={item.id}
                    role="group"
                    aria-label={`${item['aria-label'] ?? item.id} series`}
                  >
                    {getLineSegments(item.points, connectNulls).map(
                      (segment, index) => (
                        <LinePath
                          key={index}
                          data={segment}
                          curve={curveLinear}
                          fill="none"
                          stroke={item.color}
                          strokeWidth={item.strokeWidth}
                          strokeDasharray={item.strokeDasharray}
                          opacity={getSeriesOpacity(item)}
                          className="transition-opacity duration-fast motion-reduce:transition-none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          x={(point) => getXPosition(point.x)}
                          y={(point) => axis.scale(point.y ?? 0)}
                        />
                      )
                    )}
                  </g>
                );
              })}
              {showPoints &&
                series.flatMap((item) => {
                  const axis = axisById.get(item.yAxisId);
                  if (axis == null) return [];
                  return item.points.flatMap((point, pointIndex) =>
                    point.y == null
                      ? []
                      : [
                          <circle
                            key={`${item.id}-${point.x}-${pointIndex}`}
                            cx={getXPosition(point.x)}
                            cy={axis.scale(point.y)}
                            r={2.5}
                            fill={item.color}
                            opacity={getSeriesOpacity(item)}
                            className="transition-opacity duration-fast motion-reduce:transition-none"
                          />,
                        ]
                  );
                })}
            </g>
            {selectionBounds != null && (
              <g
                role="group"
                aria-label={`Selected range from ${formatXValue(
                  Math.min(selectionRange?.from ?? 0, selectionRange?.to ?? 0)
                )} to ${formatXValue(
                  Math.max(selectionRange?.from ?? 0, selectionRange?.to ?? 0)
                )}`}
              >
                <rect
                  aria-hidden="true"
                  x={selectionBounds.x}
                  y={0}
                  width={selectionBounds.width}
                  height={innerHeight}
                  fill="var(--bg-brand)"
                  fillOpacity={0.1}
                  stroke="var(--border-brand)"
                  pointerEvents="none"
                />
              </g>
            )}
            {hasActiveX && (
              <>
                <line
                  x1={activeXPosition}
                  x2={activeXPosition}
                  y1={0}
                  y2={innerHeight}
                  stroke="currentColor"
                  strokeWidth={1}
                  strokeDasharray={CHART_DASHED_STROKE_DASHARRAY}
                  className="text-quaternary"
                />
                {series.flatMap((item) => {
                  if (!item.showActiveMarker) return [];
                  const axis = axisById.get(item.yAxisId);
                  const point = item.points.find(
                    (candidate) => candidate.x === activeX
                  );
                  if (axis == null || point?.y == null) return [];
                  return [
                    <circle
                      key={`active-${item.id}`}
                      cx={activeXPosition}
                      cy={axis.scale(point.y)}
                      r={3}
                      fill={item.color}
                      opacity={getSeriesOpacity(item)}
                      className="transition-opacity duration-fast motion-reduce:transition-none"
                      stroke="var(--bg-surface-level-1)"
                      strokeWidth={1.5}
                    />,
                  ];
                })}
              </>
            )}
          </g>
          {hasPointerInteraction && (
            <rect width={innerWidth} height={innerHeight} fill="transparent" />
          )}
        </Group>
      )}
      {canRender &&
        axes.map((axis, index) => {
          if (axis.label == null) return null;
          const x =
            index === 0
              ? chartMargin.left - getChartAxisLabelOffset(axis.thickness)
              : chartMargin.left +
                innerWidth +
                getSecondaryChartAxisOffset(axes, index) +
                getChartAxisLabelOffset(axis.thickness);
          const y = chartMargin.top + innerHeight / 2;
          return (
            <Tooltip title={axis.label} key={axis.id}>
              <text
                x={x}
                y={y}
                fill="var(--text-quaternary)"
                fontSize={CHART_TICK_FONT_SIZE}
                fontWeight={500}
                textAnchor="middle"
                transform={`rotate(-90, ${x}, ${y})`}
              >
                {axis.label}
              </text>
            </Tooltip>
          );
        })}
    </svg>
  );
};
