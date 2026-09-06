import {
  useState,
  type AriaAttributes,
  type FocusEvent,
  type FocusEventHandler,
  type HTMLAttributes,
  type PointerEvent,
  type PointerEventHandler,
  type ReactNode,
} from 'react';

import {
  animated,
  type SpringValue,
  useReducedMotion,
  useSpring,
} from '@react-spring/web';
import { Group } from '@visx/group';
import { Pie as Donut } from '@visx/shape';

import { CHART_DIMMED_OPACITY } from '../../utils/chartConstants';
import { cn } from '../../utils/cn';
import { ChartLegend, type ChartLegendProps } from '../ChartLegend';
import { Text } from '../Text';
import {
  collateDonutSegments,
  getDonutLegendItems,
  getDrawnSegments,
  sumSegmentValues,
} from './DonutChart.utils';

// Viewport-invariant units. The donut renders into a fixed-size viewBox and
// scales via `preserveAspectRatio="xMidYMid meet"`.
const DONUT_VIEWBOX = 200;
const DONUT_CENTER = DONUT_VIEWBOX / 2;
const DONUT_OUTER_RADIUS = DONUT_CENTER - 8;
const DONUT_INNER_RADIUS = DONUT_OUTER_RADIUS * 0.64;

const numberFormatter = new Intl.NumberFormat('en-US');

const formatSegmentValue = (value: number) => numberFormatter.format(value);

/**
 * Sizes the center number against the donut hole: `1cqi` is 1% of the hole's
 * width, so a longer value resolves to a smaller size, capped at the heading
 * size so short values do not balloon.
 */
const getFittedCenterFontSize = (value: string) =>
  `min(1.75rem, ${100 / (value.length * 0.7)}cqi)`;

export type DonutChartSegment = {
  id: string;
  label: ReactNode;
  value: number;
  /** Use DS CSS color token; typically a `var(--chart-...)` reference. */
  color: string;
  /**
   * Marks a segment that already stands for a group of others — a remainder the
   * data source rolled up, say. `otherCollationThreshold` merges it with the
   * tail it collates instead of drawing a second "Other" beside it.
   */
  isOther?: boolean;
};

type DonutArcDatumLike<Datum> = {
  data: Datum;
  value: number;
  index: number;
  startAngle: number;
  endAngle: number;
  padAngle: number;
};

/**
 * Everything `ChartLegend` accepts except `items`, which the donut derives from
 * `segments`. Namespacing these under `legendProps` keeps `className` and the
 * other DOM attributes on the chart root unambiguous.
 */
type DonutChartLegendProps = Omit<ChartLegendProps, 'items'>;

/**
 * `legendProps` only exists while there is a legend to configure: with
 * `showLegend={false}` it narrows to `never`, so autocomplete stops offering it
 * and passing it is a type error rather than a silently ignored prop.
 */
type DonutChartLegendConfig =
  | {
      /** Defaults to true. */
      showLegend?: true;
      /** Forwarded to the rendered `ChartLegend`. */
      legendProps?: DonutChartLegendProps;
    }
  | {
      showLegend: false;
      legendProps?: never;
    };

export type DonutChartProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'onPointerOut'
> &
  DonutChartLegendConfig & {
    segments: readonly DonutChartSegment[];
    /**
     * When provided and non-empty, only segments whose IDs are in the set are
     * rendered in the donut. Unselected segments stay in the legend with a 0%
     * share. IDs address the collated list, so the segments behind an "Other"
     * slice are selected as `DONUT_OTHER_SEGMENT_ID` rather than individually. A
     * set naming none of those IDs draws everything, so a selection outliving
     * the data it was made against cannot empty the chart.
     */
    selectedIds?: ReadonlySet<string>;
    /**
     * Number to render in the donut hole.
     */
    centerNumber?: string;
    /**
     * Descriptor for the number in the donut hole.
     */
    centerDescriptor?: string;
    /**
     * Scales `centerNumber` to the width of the donut hole.
     */
    scaleCenterNumberSize?: boolean;
    /** Emphasizes one segment and dims the rest. */
    activeSegmentId?: string | null;
    /** Emphasizes the segment represented by one external legend item. Built-in legends set this automatically. */
    activeLegendItemId?: string | null;
    /** Animates segments when they are drawn. Defaults to true. */
    shouldAnimate?: boolean;
    /** Names segments and makes them focusable. */
    getSegmentAriaLabel?: (
      segment: DonutChartSegment
    ) => AriaAttributes['aria-label'];
    /**
     * Set to false to skip drawing the donut. Use it to avoid the work while a
     * parent container is actively resizing. Defaults to true.
     */
    isRendering?: boolean;
    /**
     * Collates segments less than this set number to an "Other" slice, automatically merging any segment flagged `isOther`. Do not pass a value to render all segments, even if they are tiny.
     */
    otherCollationThreshold?: number;
    /**
     * Formats each segment's value for the legend. Defaults to a plain
     * `en-US` number; pass a unit-aware formatter for durations, bytes, cost.
     */
    formatValue?: (value: number) => ReactNode;
    onSegmentPointerMove?: (
      segment: DonutChartSegment,
      event: PointerEvent<SVGPathElement>
    ) => void;
    onSegmentPointerOut?: () => void;
    onSegmentPointerUp?: (
      segment: DonutChartSegment,
      event: PointerEvent<SVGPathElement>
    ) => void;
    onSegmentFocus?: (
      segment: DonutChartSegment,
      event: FocusEvent<SVGPathElement>
    ) => void;
    onSegmentBlur?: (
      segment: DonutChartSegment,
      event: FocusEvent<SVGPathElement>
    ) => void;
  };

type AnimatedDonutArcProps = {
  arc: DonutArcDatumLike<DonutChartSegment>;
  path: (arc: DonutArcDatumLike<DonutChartSegment>) => string | null;
  animationProgress: SpringValue<number>;
  animationStartAngle: number;
  animationEndAngle: number;
  'aria-label'?: AriaAttributes['aria-label'];
  isDimmed: boolean;
  onPointerMove?: PointerEventHandler<SVGPathElement>;
  onPointerOut?: () => void;
  onPointerUp?: PointerEventHandler<SVGPathElement>;
  onFocus?: FocusEventHandler<SVGPathElement>;
  onBlur?: FocusEventHandler<SVGPathElement>;
};

const AnimatedDonutArc = ({
  arc,
  path,
  animationProgress,
  animationStartAngle,
  animationEndAngle,
  isDimmed,
  onPointerMove,
  onPointerOut,
  onPointerUp,
  onFocus,
  onBlur,
  ...ariaProps
}: AnimatedDonutArcProps) => {
  const isInteractive =
    onPointerMove != null || onPointerOut != null || onPointerUp != null;

  return (
    <animated.path
      fill={arc.data.color}
      opacity={isDimmed ? CHART_DIMMED_OPACITY : 1}
      className={cn(
        'transition-opacity duration-fast motion-reduce:transition-none',
        isInteractive && 'cursor-pointer'
      )}
      d={animationProgress.to((progress) => {
        const revealAngle =
          animationStartAngle +
          (animationEndAngle - animationStartAngle) * progress;
        const endAngle = Math.min(
          arc.endAngle,
          Math.max(arc.startAngle, revealAngle)
        );
        return path({ ...arc, endAngle }) ?? '';
      })}
      tabIndex={ariaProps['aria-label'] == null ? undefined : 0}
      {...ariaProps}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
      onPointerUp={onPointerUp}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};

/**
 * DonutChart renders a donut and its `ChartLegend` from a flat list of
 * segments. Consumers own the segment palette and pair the chart
 * with `ChartCard` and their own tooltip.
 *
 * The legend sits below the donut in narrow containers and beside it once the
 * container passes 496px. Pass `showLegend={false}` for the donut alone,
 * `legendProps` to configure the legend, and `legendProps.onItemClick` with
 * `selectedIds` to make legend entries filter the donut. A long tail of tiny
 * slices collapses into one "Other" slice via `otherCollationThreshold`, which
 * absorbs any segment flagged `isOther`.

 */
export const DonutChart = ({
  segments,
  selectedIds,
  centerNumber,
  centerDescriptor,
  scaleCenterNumberSize = false,
  activeSegmentId,
  activeLegendItemId,
  shouldAnimate = true,
  getSegmentAriaLabel,
  isRendering = true,
  otherCollationThreshold,
  showLegend = true,
  legendProps,
  formatValue = formatSegmentValue,
  onSegmentPointerMove,
  onSegmentPointerOut,
  onSegmentPointerUp,
  onSegmentFocus,
  onSegmentBlur,
  className,
  ...rest
}: DonutChartProps) => {
  const [activeBuiltInLegendItemId, setActiveBuiltInLegendItemId] = useState<
    string | null
  >(null);
  const isReducedMotion = (useReducedMotion() ?? false) || !shouldAnimate;
  const ariaProps = { 'aria-label': rest['aria-label'] };
  const rootProps: HTMLAttributes<HTMLDivElement> = { ...rest };
  delete rootProps['aria-label'];

  // Collation happens before the selection, so the legend lists the same rows
  // the donut draws arcs for and neither reflows while filtering.
  const collatedSegments = collateDonutSegments(
    segments,
    otherCollationThreshold
  );
  const drawnSegments = getDrawnSegments(collatedSegments, selectedIds);
  const drawnTotal = sumSegmentValues(drawnSegments);
  const drawnIds = new Set(drawnSegments.map((segment) => segment.id));
  const drawnArcIds = new Set(
    drawnSegments
      .filter((segment) => segment.value > 0)
      .map((segment) => segment.id)
  );
  const hasDrawnSegments = isRendering && drawnTotal > 0;
  const segmentAnimationKey = JSON.stringify(
    drawnSegments.map((segment) => [segment.id, segment.value])
  );
  // A single sweep angle reveals the arcs in sequence, leaving only one moving
  // boundary regardless of how many colored segments the donut contains.
  const [animation] = useSpring(
    () => ({
      from: { progress: 0 },
      to: { progress: hasDrawnSegments ? 1 : 0 },
      reset: true,
      immediate: isReducedMotion,
    }),
    [segmentAnimationKey, hasDrawnSegments, isReducedMotion]
  );

  const legendItems = getDonutLegendItems({
    segments: collatedSegments,
    selectedIds,
    drawnIds,
    drawnTotal,
    formatValue,
  });
  const hasLegend = showLegend && collatedSegments.length > 0;
  const legendLayout = legendProps?.layout ?? 'list';
  const requestedActiveLegendItemId =
    (hasLegend ? activeBuiltInLegendItemId : null) ?? activeLegendItemId;
  const renderedActiveLegendItemId =
    requestedActiveLegendItemId != null &&
    drawnArcIds.has(requestedActiveLegendItemId)
      ? requestedActiveLegendItemId
      : null;
  const renderedActiveSegmentId =
    activeSegmentId != null && drawnArcIds.has(activeSegmentId)
      ? activeSegmentId
      : null;
  const activeId = renderedActiveLegendItemId ?? renderedActiveSegmentId;

  const donut = (
    <div className="relative flex size-full min-h-0 min-w-0 items-center justify-center [&>svg]:max-h-[22.5rem] [&>svg]:max-w-[22.5rem]">
      <svg
        viewBox={`0 0 ${DONUT_VIEWBOX} ${DONUT_VIEWBOX}`}
        preserveAspectRatio="xMidYMid meet"
        className="size-full"
        role="img"
        {...ariaProps}
      >
        {isRendering && (
          <>
            {drawnTotal > 0 && (
              <Group top={DONUT_CENTER} left={DONUT_CENTER}>
                <Donut
                  data={drawnSegments}
                  pieValue={(segment) => segment.value}
                  pieSort={null}
                  pieSortValues={null}
                  outerRadius={DONUT_OUTER_RADIUS}
                  innerRadius={DONUT_INNER_RADIUS}
                >
                  {(donut) => {
                    const animationStartAngle = donut.arcs[0]?.startAngle ?? 0;
                    const animationEndAngle =
                      donut.arcs.at(-1)?.endAngle ?? animationStartAngle;
                    return donut.arcs.map((arc) => (
                      <AnimatedDonutArc
                        key={arc.data.id}
                        arc={arc}
                        path={donut.path}
                        animationProgress={animation.progress}
                        animationStartAngle={animationStartAngle}
                        animationEndAngle={animationEndAngle}
                        aria-label={getSegmentAriaLabel?.(arc.data)}
                        isDimmed={activeId != null && activeId !== arc.data.id}
                        onPointerMove={
                          onSegmentPointerMove == null
                            ? undefined
                            : (event) => onSegmentPointerMove(arc.data, event)
                        }
                        onPointerOut={onSegmentPointerOut}
                        onPointerUp={
                          onSegmentPointerUp == null
                            ? undefined
                            : (event) => onSegmentPointerUp(arc.data, event)
                        }
                        onFocus={
                          onSegmentFocus == null
                            ? undefined
                            : (event) => onSegmentFocus(arc.data, event)
                        }
                        onBlur={
                          onSegmentBlur == null
                            ? undefined
                            : (event) => onSegmentBlur(arc.data, event)
                        }
                      />
                    ));
                  }}
                </Donut>
              </Group>
            )}
            {(centerNumber || centerDescriptor) != null && (
              <foreignObject
                x={DONUT_CENTER - DONUT_INNER_RADIUS}
                y={DONUT_CENTER - DONUT_INNER_RADIUS}
                width={DONUT_INNER_RADIUS * 2}
                height={DONUT_INNER_RADIUS * 2}
                className="pointer-events-none"
              >
                <div
                  className="flex size-full min-w-0 flex-col items-center justify-center"
                  style={{ containerType: 'inline-size' }}
                >
                  <Text
                    as="span"
                    variant="h2"
                    weight="semibold"
                    className={cn(
                      scaleCenterNumberSize && 'block w-full text-center'
                    )}
                    style={
                      scaleCenterNumberSize && centerNumber != null
                        ? { fontSize: getFittedCenterFontSize(centerNumber) }
                        : undefined
                    }
                  >
                    {centerNumber}
                  </Text>
                  <Text as="span" variant="xs" color="tertiary">
                    {centerDescriptor}
                  </Text>
                </div>
              </foreignObject>
            )}
          </>
        )}
      </svg>
    </div>
  );

  const legend = (
    <ChartLegend
      aria-label={
        ariaProps['aria-label'] == null
          ? undefined
          : `${ariaProps['aria-label']} legend`
      }
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
            'grid size-full min-h-0 min-w-0 grid-cols-1 items-center justify-stretch',
            legendLayout === 'list'
              ? 'grid-rows-[minmax(0,1fr)_minmax(0,45%)] gap-space-3 @[496px]:grid-cols-2 @[496px]:grid-rows-[minmax(0,1fr)] @[496px]:justify-center @[496px]:gap-space-5'
              : 'grid-rows-[minmax(0,1fr)_auto] gap-space-2'
          )}
        >
          {donut}
          {legendLayout === 'list' ? (
            <div className="scroll-mask-t scroll-mask-b h-full min-h-0 min-w-0 overflow-y-auto overflow-x-hidden">
              <div className="flex min-h-full flex-col">
                <div className="my-auto">{legend}</div>
              </div>
            </div>
          ) : (
            legend
          )}
        </div>
      ) : (
        donut
      )}
    </div>
  );
};
