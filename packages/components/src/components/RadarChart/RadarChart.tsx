import { useId, useState, type HTMLAttributes, type ReactNode } from 'react';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import {
  CHART_SINGLE_FILL_COLOR,
  CHART_INTERACTION_CONTRAST_COLOR,
  getCategoricalLineChartColor,
} from '../../utils/chartColors';
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
  /** Semantic chart color; defaults to the categorical palette in axis order. */
  color?: string;
};

export type RadarChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children'
> & {
  /** Axes in clockwise order, beginning at the top. Supply at least three. */
  data: readonly RadarChartDatum[];
  /** Shared axis maximum; defaults to the largest finite positive value. */
  maxValue?: number;
  /** Formats labels and the accessible data summary. */
  formatValue?: (value: number) => string;
  /**
   * Content inside ChartTooltip on point or label hover and keyboard focus.
   * Receives the sanitized value and resolved color. Compose ChartTooltipHeader,
   * ChartTooltipBody, and ChartTooltipRow here; omit for a static chart.
   */
  renderTooltip?: (datum: RadarChartDatum) => ReactNode;
};

const numberFormatter = new Intl.NumberFormat('en-US');
const formatNumber = (value: number) => numberFormatter.format(value);
// Layout uses SVG units, which scale together with the viewBox. This canvas
// fits the plot plus outside labels, with extra width for horizontal text.
const VIEWBOX_WIDTH = 440;
const VIEWBOX_HEIGHT = 340;
const CENTER_X = VIEWBOX_WIDTH / 2;
const CENTER_Y = VIEWBOX_HEIGHT / 2;
// A 96-unit plot leaves room for a 20-unit gap and the two-line label boxes.
const RADIUS = 96;
const LABEL_RADIUS = RADIUS + 20;
// Reserve 100 units for truncated names and 40 for the name/value pair.
const LABEL_WIDTH = 100;
const LABEL_HEIGHT = 40;
// Absorb trig rounding at alignment boundaries so mirrored labels line up.
const ALIGNMENT_EPSILON = 1e-6;
// Four equally spaced rings represent fractions of the shared axis maximum.
const GRID_LEVELS = [0.25, 0.5, 0.75, 1];

/** A single-series radar with a shared scale and clockwise, outside axis labels. */
export const RadarChart = ({
  data,
  maxValue,
  formatValue = formatNumber,
  renderTooltip,
  className,
  'aria-label': ariaLabel = 'Radar chart',
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  ...props
}: RadarChartProps) => {
  const summaryId = useId();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipZIndex = useZIndex(zIndices.tooltip);
  const values = data.map(({ value }) =>
    Number.isFinite(value) ? Math.max(0, value) : 0
  );
  const maximum =
    maxValue !== undefined && Number.isFinite(maxValue) && maxValue > 0
      ? maxValue
      : values.reduce((largest, value) => Math.max(largest, value), 0) || 1;
  const axes = data.map((datum, index) => {
    const angle = (index * Math.PI * 2) / data.length - Math.PI / 2;
    const x = Math.cos(angle);
    const y = Math.sin(angle);
    const ratio = Math.min(1, values[index] / maximum);
    return {
      datum: {
        ...datum,
        value: values[index],
        color: datum.color ?? getCategoricalLineChartColor(index),
      },
      x: CENTER_X + x * RADIUS,
      y: CENTER_Y + y * RADIUS,
      pointX: CENTER_X + x * RADIUS * ratio,
      pointY: CENTER_Y + y * RADIUS * ratio,
      // Center labels within ~6 degrees of vertical (|cos| <= 0.1).
      // At 30 degrees or more above/below horizontal (|sin| >= 0.5), place
      // the whole label box outside the axis instead of straddling it.
      labelX:
        CENTER_X +
        x * LABEL_RADIUS -
        (x < -0.1 ? LABEL_WIDTH : x > 0.1 ? 0 : LABEL_WIDTH / 2),
      labelY:
        CENTER_Y +
        y * LABEL_RADIUS -
        (y <= -0.5 + ALIGNMENT_EPSILON
          ? LABEL_HEIGHT
          : y >= 0.5 - ALIGNMENT_EPSILON
            ? 0
            : LABEL_HEIGHT / 2),
      align: x < -0.1 ? 'text-right' : x > 0.1 ? 'text-left' : 'text-center',
    };
  });

  return (
    <div className={cn('w-full overflow-x-auto', className)} {...props}>
      {data.length < 3 ? (
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
            role={renderTooltip ? 'group' : 'img'}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={[summaryId, ariaDescribedBy]
              .filter(Boolean)
              .join(' ')}
          >
            <desc id={summaryId}>
              {axes
                .map(
                  ({ datum }) => `${datum.label}: ${formatValue(datum.value)}`
                )
                .join('; ')}
            </desc>
            <g aria-hidden="true" fill="none" stroke="var(--border-subtle)">
              {GRID_LEVELS.map((level) => (
                <polygon
                  key={level}
                  points={axes
                    .map(
                      ({ x, y }) =>
                        `${CENTER_X + (x - CENTER_X) * level},${CENTER_Y + (y - CENTER_Y) * level}`
                    )
                    .join(' ')}
                />
              ))}
              {axes.map(({ datum, x, y }) => (
                <line
                  key={datum.id}
                  x1={CENTER_X}
                  y1={CENTER_Y}
                  x2={x}
                  y2={y}
                />
              ))}
            </g>
            <polygon
              aria-hidden="true"
              points={axes
                .map(({ pointX, pointY }) => `${pointX},${pointY}`)
                .join(' ')}
              fill={CHART_SINGLE_FILL_COLOR}
              // Keep grid rings visible through the filled data polygon.
              fillOpacity={0.35}
              stroke={getCategoricalLineChartColor(0)}
              // Thin SVG strokes distinguish the polygon and point outlines.
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            {axes.map(({ datum, pointX, pointY, labelX, labelY, align }) => {
              const label = `${datum.label}: ${formatValue(datum.value)}`;
              const mark = (
                <g
                  key={datum.id}
                  className="group outline-none"
                  role={renderTooltip ? 'img' : undefined}
                  aria-label={renderTooltip ? label : undefined}
                  aria-hidden={renderTooltip ? undefined : true}
                  tabIndex={renderTooltip ? 0 : undefined}
                >
                  {/* A 24-unit hit target surrounds the 9-unit point; the
                      16-unit ring shows hover/focus without changing layout. */}
                  <circle cx={pointX} cy={pointY} r={12} fill="transparent" />
                  <circle
                    cx={pointX}
                    cy={pointY}
                    r={8}
                    fill="none"
                    stroke={datum.color}
                    strokeWidth={1.5}
                    className="opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                  />
                  <circle
                    cx={pointX}
                    cy={pointY}
                    r={4.5}
                    fill={datum.color}
                    stroke={CHART_INTERACTION_CONTRAST_COLOR}
                    strokeWidth={1.5}
                  />
                  <foreignObject
                    x={labelX}
                    y={labelY}
                    width={LABEL_WIDTH}
                    height={LABEL_HEIGHT}
                  >
                    <div
                      className={cn(
                        'flex h-full flex-col justify-center',
                        align
                      )}
                      title={renderTooltip ? undefined : label}
                    >
                      <Text variant="xs" className="truncate">
                        {datum.label}
                      </Text>
                      <Text
                        variant="xs"
                        color="secondary"
                        className="truncate tabular-nums"
                      >
                        {formatValue(datum.value)}
                      </Text>
                    </div>
                  </foreignObject>
                </g>
              );
              if (!renderTooltip) return mark;

              return (
                <TooltipPrimitive.Root
                  key={datum.id}
                  open={activeTooltip === datum.id}
                  onOpenChange={(open) =>
                    setActiveTooltip((active) =>
                      open ? datum.id : active === datum.id ? null : active
                    )
                  }
                >
                  <TooltipPrimitive.Trigger
                    asChild
                    onFocus={(event) => {
                      // Wait for keyboard focus to scroll an offscreen axis into
                      // view; otherwise Radix closes the tooltip on that scroll.
                      event.preventDefault();
                      const target = event.currentTarget;
                      requestAnimationFrame(() => {
                        if (target === target.ownerDocument.activeElement) {
                          setActiveTooltip(datum.id);
                        }
                      });
                    }}
                  >
                    {mark}
                  </TooltipPrimitive.Trigger>
                  <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                      asChild
                      // Leave an 8px gap from the trigger and viewport edges.
                      sideOffset={8}
                      collisionPadding={8}
                    >
                      <ChartTooltip style={{ zIndex: tooltipZIndex }}>
                        <ZIndexProvider value={tooltipZIndex}>
                          {renderTooltip(datum)}
                        </ZIndexProvider>
                      </ChartTooltip>
                    </TooltipPrimitive.Content>
                  </TooltipPrimitive.Portal>
                </TooltipPrimitive.Root>
              );
            })}
          </svg>
        </TooltipPrimitive.Provider>
      )}
    </div>
  );
};
