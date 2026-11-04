import {
  useId,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import {
  CHART_SINGLE_FILL_COLOR,
  getCategoricalFillChartColor,
  getCategoricalFillColor,
  getCategoricalLineChartColor,
} from '../../utils/chartColors';
import { CHART_DIMMED_OPACITY } from '../../utils/chartConstants';
import { cn } from '../../utils/cn';
import { useZIndex } from '../../utils/useZIndex';
import { ZIndexProvider } from '../../utils/ZIndexContext';
import zIndices from '../../utils/zIndices';
import { ChartTooltip } from '../ChartTooltip';
import { Text } from '../Text';

export type RadarChartDatum = {
  /** Unique, stable identifier for this axis. */
  id: string;
  label: string;
  value: number;
  /** Semantic chart color; defaults to the categorical fill palette in axis order. */
  color?: string;
};

export type RadarChartAxis = {
  /** Unique, stable identifier; keys each series' `values`. */
  id: string;
  label: string;
};

export type RadarChartSeries = {
  /** Unique, stable identifier; use it as the matching legend item's id. */
  id: string;
  label: string;
  /** Values keyed by axis id. Missing, negative, and non-finite values plot at zero. */
  values: Readonly<Record<string, number | undefined>>;
  /**
   * Outline color; defaults to the categorical line palette in series order.
   * The area uses the hue-matched fill color.
   */
  color?: string;
};

/** One axis and every visible series' value on it, for multi-series tooltips. */
export type RadarChartAxisValues = RadarChartAxis & {
  /** Visible series in input order, with sanitized values and outline colors. */
  values: readonly {
    id: string;
    label: string;
    value: number;
    color: string;
  }[];
};

type RadarChartBaseProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  /** Shared axis maximum; defaults to the largest finite positive value. */
  maxValue?: number;
  /** Formats labels and the accessible data summary. */
  formatValue?: (value: number) => string;
};

export type RadarChartSingleSeriesProps = RadarChartBaseProps & {
  /** Axes in clockwise order, beginning at the top. Supply at least three. */
  data: readonly RadarChartDatum[];
  /**
   * Content inside ChartTooltip on point or label hover and keyboard focus.
   * Receives the sanitized value and resolved color. Compose ChartTooltipHeader,
   * ChartTooltipBody, and ChartTooltipRow here; omit for a static chart.
   */
  renderTooltip?: (datum: RadarChartDatum) => ReactNode;
  axes?: never;
  series?: never;
  renderAxisTooltip?: never;
  selectedIds?: never;
  excludedIds?: never;
  activeLegendItemId?: never;
};

export type RadarChartMultiSeriesProps = RadarChartBaseProps & {
  /** Axes in clockwise order, beginning at the top. Supply at least three. */
  axes: readonly RadarChartAxis[];
  /**
   * Overlapping areas on the shared axes, drawn in input order. Keep to about
   * four; beyond that, filter series or use small multiples.
   */
  series: readonly RadarChartSeries[];
  /**
   * Content inside ChartTooltip when an axis is hovered anywhere in its sector
   * or focused. Compose one ChartTooltipRow per series; omit for a static chart.
   */
  renderAxisTooltip?: (axis: RadarChartAxisValues) => ReactNode;
  /** When non-empty, only these series are drawn. Colors keep their series order. */
  selectedIds?: ReadonlySet<string>;
  /** Series left out, whatever `selectedIds` holds. */
  excludedIds?: ReadonlySet<string>;
  /** Emphasizes one series from an external legend and dims the rest. */
  activeLegendItemId?: string | null;
  data?: never;
  renderTooltip?: never;
};

export type RadarChartProps =
  | RadarChartSingleSeriesProps
  | RadarChartMultiSeriesProps;

type AxisLayout = {
  id: string;
  unitX: number;
  unitY: number;
  labelX: number;
  labelY: number;
  align: 'text-left' | 'text-center' | 'text-right';
  tooltipSide: 'top' | 'right' | 'bottom' | 'left';
  tooltipAlign: 'start' | 'center' | 'end';
};

const numberFormatter = new Intl.NumberFormat('en-US');
const formatNumber = (value: number) => numberFormatter.format(value);
const sanitize = (value: number | undefined) =>
  value !== undefined && Number.isFinite(value) ? Math.max(0, value) : 0;
// Layout uses SVG units, which scale together with the viewBox. This canvas
// fits the plot plus outside labels, with extra width for horizontal text.
const VIEWBOX_WIDTH = 440;
const VIEWBOX_HEIGHT = 340;
const CENTER_X = VIEWBOX_WIDTH / 2;
const CENTER_Y = VIEWBOX_HEIGHT / 2;
// A 96-unit plot leaves room for a 20-unit gap and the two-line label boxes.
const RADIUS = 96;
const LABEL_RADIUS = RADIUS + 20;
// Reserve 100 units for truncated names and 20 per text line: single-series
// labels pair the name with its value; multi-series labels show the name.
const LABEL_WIDTH = 100;
const LABEL_LINE_HEIGHT = 20;
// Labels left of center end at their axis; labels right of it start there.
const LABEL_SIDES = {
  left: { offset: LABEL_WIDTH, align: 'text-right', tooltipAlign: 'start' },
  center: {
    offset: LABEL_WIDTH / 2,
    align: 'text-center',
    tooltipAlign: 'center',
  },
  right: { offset: 0, align: 'text-left', tooltipAlign: 'end' },
} as const;
// Absorb trig rounding at alignment boundaries so mirrored labels line up.
const ALIGNMENT_EPSILON = 1e-6;
// Four equally spaced rings represent fractions of the shared axis maximum.
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];
// Overlapping areas lead with their outlines: a faint wash keeps stacked
// areas from mixing into a muddy tint. While one series is emphasized, it
// alone keeps a fill, and the other series recede to dimmed outlines.
const SERIES_FILL_OPACITY = 0.08;
const EMPHASIZED_SERIES_FILL_OPACITY = 0.2;

const getAxisLayouts = (
  axes: readonly { id: string }[],
  labelHeight: number
): AxisLayout[] =>
  axes.map(({ id }, index) => {
    const angle = (index * Math.PI * 2) / axes.length - Math.PI / 2;
    const unitX = Math.cos(angle);
    const unitY = Math.sin(angle);
    // Center labels within ~6 degrees of vertical (|cos| <= 0.1).
    const side =
      LABEL_SIDES[unitX < -0.1 ? 'left' : unitX > 0.1 ? 'right' : 'center'];
    // At 30 degrees or more above/below horizontal (|sin| >= 0.5), place the
    // whole label box outside the axis instead of straddling it.
    const isAbove = unitY <= -0.5 + ALIGNMENT_EPSILON;
    const isBelow = unitY >= 0.5 - ALIGNMENT_EPSILON;
    return {
      id,
      unitX,
      unitY,
      labelX: CENTER_X + unitX * LABEL_RADIUS - side.offset,
      labelY:
        CENTER_Y +
        unitY * LABEL_RADIUS -
        (isAbove ? labelHeight : isBelow ? 0 : labelHeight / 2),
      align: side.align,
      // Open outward, past the label and away from the plot.
      tooltipSide: isAbove
        ? 'top'
        : isBelow
          ? 'bottom'
          : unitX < 0
            ? 'left'
            : 'right',
      tooltipAlign: isAbove || isBelow ? side.tooltipAlign : 'center',
    };
  });

const getPoint = (axis: AxisLayout, ratio: number): [number, number] => [
  CENTER_X + axis.unitX * RADIUS * ratio,
  CENTER_Y + axis.unitY * RADIUS * ratio,
];

const toPoints = (points: readonly (readonly [number, number])[]) =>
  points.map(([x, y]) => `${x},${y}`).join(' ');

const getMaximum = (values: readonly number[], maxValue?: number) =>
  maxValue !== undefined && Number.isFinite(maxValue) && maxValue > 0
    ? maxValue
    : values.reduce((largest, value) => Math.max(largest, value), 0) || 1;

/**
 * A radar with a shared scale and clockwise, outside axis labels. Pass `data`
 * for one series with categorical points, or `axes` and `series` for
 * overlapping areas identified by an external legend.
 */
export const RadarChart = (props: RadarChartProps) => {
  // Mode-specific props are read from `props` so TypeScript narrows them by
  // mode; they are destructured here only to keep them off the wrapper div.
  const {
    data: _data,
    axes: _axes,
    series: _series,
    renderTooltip: _renderTooltip,
    renderAxisTooltip: _renderAxisTooltip,
    selectedIds,
    excludedIds,
    activeLegendItemId,
    maxValue,
    formatValue = formatNumber,
    className,
    'aria-label': ariaLabel = 'Radar chart',
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    ...divProps
  } = props;
  const summaryId = useId();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const isPointerDownRef = useRef(false);
  const tooltipZIndex = useZIndex(zIndices.tooltip);
  const isInteractive =
    (props.series !== undefined
      ? props.renderAxisTooltip
      : props.renderTooltip) !== undefined;

  const withTooltip = (
    id: string,
    mark: ReactElement,
    content: ReactNode,
    layout?: AxisLayout
  ) => (
    <TooltipPrimitive.Root
      key={id}
      open={activeTooltip === id}
      onOpenChange={(open) =>
        setActiveTooltip((active) =>
          open ? id : active === id ? null : active
        )
      }
    >
      <TooltipPrimitive.Trigger
        asChild
        onPointerDown={(event) => {
          isPointerDownRef.current = true;
          event.currentTarget.ownerDocument.addEventListener(
            'pointerup',
            () => {
              isPointerDownRef.current = false;
            },
            { once: true }
          );
        }}
        onFocus={(event) => {
          // Wait for keyboard focus to scroll an offscreen axis into
          // view; otherwise Radix closes the tooltip on that scroll.
          // Like Radix, focus from a pointer press stays closed.
          event.preventDefault();
          if (isPointerDownRef.current) return;
          const target = event.currentTarget;
          requestAnimationFrame(() => {
            if (target === target.ownerDocument.activeElement) {
              setActiveTooltip(id);
            }
          });
        }}
      >
        {mark}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          asChild
          side={layout?.tooltipSide}
          align={layout?.tooltipAlign}
          // Leave an 8px gap from the trigger and viewport edges.
          sideOffset={8}
          collisionPadding={8}
        >
          <ChartTooltip style={{ zIndex: tooltipZIndex }}>
            <ZIndexProvider value={tooltipZIndex}>{content}</ZIndexProvider>
          </ChartTooltip>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );

  const renderLabel = (
    layout: AxisLayout,
    height: number,
    summary: string,
    lines: ReactNode
  ) => (
    <foreignObject
      x={layout.labelX}
      y={layout.labelY}
      width={LABEL_WIDTH}
      height={height}
    >
      <div
        className={cn('flex h-full flex-col justify-center', layout.align)}
        title={isInteractive ? undefined : summary}
      >
        {lines}
      </div>
    </foreignObject>
  );

  const renderSingleSeries = (
    data: readonly RadarChartDatum[],
    renderDatumTooltip?: (datum: RadarChartDatum) => ReactNode
  ) => {
    const labelHeight = LABEL_LINE_HEIGHT * 2;
    const layouts = getAxisLayouts(data, labelHeight);
    const values = data.map(({ value }) => sanitize(value));
    const maximum = getMaximum(values, maxValue);
    const axes = data.map((datum, index) => {
      const value = values[index];
      const formattedValue = formatValue(value);
      return {
        layout: layouts[index],
        datum: {
          ...datum,
          value,
          color: datum.color ?? getCategoricalFillChartColor(index),
        },
        formattedValue,
        summary: `${datum.label}: ${formattedValue}`,
        point: getPoint(layouts[index], Math.min(1, value / maximum)),
      };
    });

    return {
      layouts,
      summary: axes.map(({ summary }) => summary).join('; '),
      marks: (
        <>
          <polygon
            aria-hidden="true"
            points={toPoints(axes.map(({ point }) => point))}
            fill={CHART_SINGLE_FILL_COLOR}
            // A light wash and subdued outline keep the category points prominent.
            // Dark surfaces need slightly more opacity to preserve the shape.
            className="dark:[fill-opacity:0.24] dark:[stroke-opacity:0.8]"
            fillOpacity={0.16}
            stroke={getCategoricalLineChartColor(0)}
            strokeOpacity={0.55}
            strokeWidth={1.25}
            strokeLinejoin="round"
          />
          {axes.map(({ layout, datum, formattedValue, summary, point }) => {
            const [pointX, pointY] = point;
            const mark = (
              <g
                key={datum.id}
                className="group outline-hidden"
                role={isInteractive ? 'img' : undefined}
                aria-label={isInteractive ? summary : undefined}
                aria-hidden={isInteractive ? undefined : true}
                tabIndex={isInteractive ? 0 : undefined}
              >
                {/* A 24-unit hit target surrounds the 8-unit point; the
                    16-unit ring shows hover in the axis color and keyboard
                    focus in the shared focus color without changing layout. */}
                <circle cx={pointX} cy={pointY} r={12} fill="transparent" />
                <circle
                  cx={pointX}
                  cy={pointY}
                  r={8}
                  fill="none"
                  stroke={datum.color}
                  strokeWidth={1.5}
                  className="opacity-0 group-hover:opacity-100 group-focus-visible:stroke-focus group-focus-visible:opacity-100"
                />
                <circle
                  cx={pointX}
                  cy={pointY}
                  r={4}
                  fill={datum.color}
                  // A thin surface-colored separator avoids heavy dark borders.
                  className="stroke-surface-level-1"
                  strokeWidth={1}
                />
                {renderLabel(
                  layout,
                  labelHeight,
                  summary,
                  <>
                    <Text variant="xs" className="truncate">
                      {datum.label}
                    </Text>
                    <Text
                      variant="xs"
                      color="secondary"
                      className="truncate tabular-nums"
                    >
                      {formattedValue}
                    </Text>
                  </>
                )}
              </g>
            );
            return renderDatumTooltip
              ? withTooltip(datum.id, mark, renderDatumTooltip(datum))
              : mark;
          })}
        </>
      ),
    };
  };

  const renderMultiSeries = (
    axes: readonly RadarChartAxis[],
    series: readonly RadarChartSeries[],
    renderAxisTooltip?: (axis: RadarChartAxisValues) => ReactNode
  ) => {
    const layouts = getAxisLayouts(axes, LABEL_LINE_HEIGHT);
    // Resolve colors before filtering so each series keeps its hue.
    const resolvedSeries = series.map((item, index) => {
      const color = item.color ?? getCategoricalLineChartColor(index);
      return {
        id: item.id,
        label: item.label,
        color,
        fill: getCategoricalFillColor(color),
        values: axes.map(({ id }) => sanitize(item.values[id])),
      };
    });
    const visibleSeries = resolvedSeries.filter(
      ({ id }) =>
        (selectedIds === undefined ||
          selectedIds.size === 0 ||
          selectedIds.has(id)) &&
        !excludedIds?.has(id)
    );
    const maximum = getMaximum(
      visibleSeries.flatMap(({ values }) => values),
      maxValue
    );
    const plottedSeries = visibleSeries.map((item) => ({
      ...item,
      points: item.values.map((value, index) =>
        getPoint(layouts[index], Math.min(1, value / maximum))
      ),
    }));
    const emphasizedId = plottedSeries.some(
      ({ id }) => id === activeLegendItemId
    )
      ? activeLegendItemId
      : null;
    const getSeriesOpacity = (id: string) =>
      emphasizedId != null && id !== emphasizedId ? CHART_DIMMED_OPACITY : 1;

    return {
      layouts,
      summary: plottedSeries
        .map(
          (item) =>
            `${item.label}: ${axes
              .map(
                (axis, index) =>
                  `${axis.label} ${formatValue(item.values[index])}`
              )
              .join(', ')}`
        )
        .join('; '),
      marks: (
        <>
          {/* Draw the emphasized series last so its outline sits on top. */}
          {[
            ...plottedSeries.filter(({ id }) => id !== emphasizedId),
            ...plottedSeries.filter(({ id }) => id === emphasizedId),
          ].map((item) => {
            const isEmphasized = item.id === emphasizedId;
            return (
              <polygon
                key={item.id}
                aria-hidden="true"
                points={toPoints(item.points)}
                fill={item.fill}
                fillOpacity={
                  isEmphasized
                    ? EMPHASIZED_SERIES_FILL_OPACITY
                    : emphasizedId == null
                      ? SERIES_FILL_OPACITY
                      : 0
                }
                className="transition-[opacity,fill-opacity] duration-fast motion-reduce:transition-none"
                opacity={getSeriesOpacity(item.id)}
                stroke={item.color}
                strokeWidth={1.5}
                strokeLinejoin="round"
              />
            );
          })}
          {axes.map((axis, index) => {
            const layout = layouts[index];
            const values = plottedSeries.map((item) => ({
              id: item.id,
              label: item.label,
              value: item.values[index],
              color: item.color,
            }));
            const summary = values.length
              ? `${axis.label}: ${values
                  .map(({ label, value }) => `${label} ${formatValue(value)}`)
                  .join(', ')}`
              : axis.label;
            const [outerX, outerY] = getPoint(layout, 1);
            const [previousX, previousY] = getPoint(
              layouts[(index - 1 + layouts.length) % layouts.length],
              1
            );
            const [nextX, nextY] = getPoint(
              layouts[(index + 1) % layouts.length],
              1
            );
            const mark = (
              <g
                key={axis.id}
                className="group outline-hidden"
                role={isInteractive ? 'img' : undefined}
                aria-label={isInteractive ? summary : undefined}
                aria-hidden={isInteractive ? undefined : true}
                tabIndex={isInteractive ? 0 : undefined}
              >
                {/* Each axis owns the sector between its neighbors' edge
                    midpoints, so hovering anywhere in the plot inspects the
                    nearest axis. */}
                <polygon
                  points={toPoints([
                    [CENTER_X, CENTER_Y],
                    [(previousX + outerX) / 2, (previousY + outerY) / 2],
                    [outerX, outerY],
                    [(outerX + nextX) / 2, (outerY + nextY) / 2],
                  ])}
                  fill="transparent"
                />
                {/* Hover strengthens the spoke and reveals each series'
                    vertex; keyboard focus uses the shared focus color. */}
                <g className="opacity-0 transition-opacity duration-fast group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                  <line
                    x1={CENTER_X}
                    y1={CENTER_Y}
                    x2={outerX}
                    y2={outerY}
                    stroke="var(--border-default)"
                    className="group-focus-visible:stroke-focus"
                  />
                  {plottedSeries.map((item) => (
                    <circle
                      key={item.id}
                      cx={item.points[index][0]}
                      cy={item.points[index][1]}
                      r={3.5}
                      fill={item.color}
                      opacity={getSeriesOpacity(item.id)}
                      // A surface-colored separator keeps coincident vertices distinct.
                      className="stroke-surface-level-1"
                      strokeWidth={1.5}
                    />
                  ))}
                </g>
                {renderLabel(
                  layout,
                  LABEL_LINE_HEIGHT,
                  summary,
                  <Text variant="xs" className="truncate">
                    {axis.label}
                  </Text>
                )}
              </g>
            );
            return renderAxisTooltip
              ? withTooltip(
                  axis.id,
                  mark,
                  renderAxisTooltip({ id: axis.id, label: axis.label, values }),
                  layout
                )
              : mark;
          })}
        </>
      ),
    };
  };

  const axisCount = (props.series !== undefined ? props.axes : props.data)
    .length;
  const chart =
    axisCount < 3
      ? null
      : props.series !== undefined
        ? renderMultiSeries(props.axes, props.series, props.renderAxisTooltip)
        : renderSingleSeries(props.data, props.renderTooltip);

  return (
    <div className={cn('w-full overflow-x-auto', className)} {...divProps}>
      {chart === null ? (
        <div className="flex h-80 items-center justify-center" role="status">
          <Text variant="sm" color="secondary">
            At least three axes are needed to display a radar chart.
          </Text>
        </div>
      ) : (
        <TooltipPrimitive.Provider
          // Brief hover delay avoids flashes when crossing between axes.
          delayDuration={150}
        >
          <svg
            viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
            className="block w-full"
            // Preserve the labels' base font size; narrow containers scroll.
            style={{ minWidth: VIEWBOX_WIDTH }}
            role={isInteractive ? 'group' : 'img'}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={[summaryId, ariaDescribedBy]
              .filter(Boolean)
              .join(' ')}
          >
            <desc id={summaryId}>{chart.summary}</desc>
            <g aria-hidden="true" fill="none" stroke="var(--border-subtle)">
              {GRID_LEVELS.map((level) => (
                <polygon
                  key={level}
                  points={toPoints(
                    chart.layouts.map((layout) => getPoint(layout, level))
                  )}
                />
              ))}
              {chart.layouts.map((layout) => {
                const [x, y] = getPoint(layout, 1);
                return (
                  <line
                    key={layout.id}
                    x1={CENTER_X}
                    y1={CENTER_Y}
                    x2={x}
                    y2={y}
                  />
                );
              })}
            </g>
            {chart.marks}
          </svg>
        </TooltipPrimitive.Provider>
      )}
    </div>
  );
};
