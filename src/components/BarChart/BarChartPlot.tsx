import { useId, type KeyboardEvent, type PointerEvent } from 'react';

import { useReducedMotion, useSpring } from '@react-spring/web';
import { Group } from '@visx/group';
import { scaleBand } from '@visx/scale';

import { CHART_DASHED_STROKE_DASHARRAY } from '../../utils/chartConstants';
import {
  getChartTickValues,
  getNearestChartValue,
} from '../../utils/chartValues';
import { cn } from '../../utils/cn';
import { getAccessibleText } from '../ChartLegend';
import { AnimatedBar } from './AnimatedBar';
import type {
  BarChartCategory,
  BarChartCategoryAxis,
  BarChartDisplayAxis,
  BarChartDisplaySeries,
  BarChartGrid,
  BarChartInteractionBar,
  BarChartInteractionDatum,
  BarChartInteractionProps,
  BarChartLayoutBar,
  BarChartOrientation,
  BarChartRenderedBar,
  BarChartSelectionRange,
  BarChartSlots,
  BarChartValueBand,
} from './BarChart.types';
import {
  getBarAnimationRanges,
  getBarChartRenderedBars,
  toBarChartInteractionBar,
} from './BarChart.utils';
import { BarChartAxes } from './BarChartAxes';
import { BarChartGuides } from './BarChartGuides';
import {
  BAR_CHART_CATEGORY_ROW_TICK_SPACING,
  BAR_CHART_CATEGORY_TICK_SPACING,
} from './constants';

const defaultFormatCategory = (value: BarChartCategory) => String(value);
const getCategoryKey = (category: BarChartCategory) =>
  `${typeof category}:${category}`;

const groupBy = <Item,>(
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

export type BarChartPlotProps = BarChartInteractionProps & {
  width: number;
  height: number;
  innerWidth: number;
  innerHeight: number;
  chartMargin: { top: number; right: number; bottom: number; left: number };
  categories: readonly BarChartCategory[];
  series: readonly BarChartDisplaySeries[];
  bars: readonly BarChartLayoutBar[];
  axes: readonly BarChartDisplayAxis[];
  orientation: BarChartOrientation;
  categoryAxis?: BarChartCategoryAxis;
  categoryAxisThickness: number;
  categoryPadding: { inner: number; outer: number };
  groupPadding: number;
  minimumBarSize: number;
  shouldAnimate: boolean;
  grid?: BarChartGrid;
  valueBands: readonly BarChartValueBand[];
  activeCategory?: BarChartCategory | null;
  activeGuideBarId?: string | null;
  activeBarId?: string | null;
  selectionRange?: BarChartSelectionRange;
  slots?: BarChartSlots;
  isRendering: boolean;
  'aria-describedby'?: string;
  'aria-label': string;
};

export const BarChartPlot = ({
  width,
  height,
  innerWidth,
  innerHeight,
  chartMargin,
  categories,
  series,
  bars,
  axes,
  orientation,
  categoryAxis,
  categoryAxisThickness,
  categoryPadding,
  groupPadding,
  minimumBarSize,
  shouldAnimate,
  grid,
  valueBands,
  activeCategory,
  activeGuideBarId,
  activeBarId,
  selectionRange,
  slots,
  isRendering,
  'aria-describedby': ariaDescribedBy,
  'aria-label': ariaLabel,
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
}: BarChartPlotProps) => {
  const isVertical = orientation === 'vertical';
  // useId can emit characters that are not valid in a CSS identifier.
  const clipPathId = `bar-chart-${useId().replace(/[^\w-]/g, '')}`;
  const isReducedMotion = (useReducedMotion() ?? false) || !shouldAnimate;
  const primaryAxis = axes[0];
  const canDraw = innerWidth > 0 && innerHeight > 0 && primaryAxis != null;
  const categoryScale = scaleBand<BarChartCategory>({
    domain: Array.from(categories),
    range: [0, isVertical ? innerWidth : innerHeight],
    paddingInner: categoryPadding.inner,
    paddingOuter: categoryPadding.outer,
  });
  const axisById = new Map(axes.map((axis) => [axis.id, axis]));
  // Marks are the expensive half; `isRendering` exists to skip exactly this.
  const renderedBars: readonly BarChartRenderedBar[] =
    canDraw && isRendering
      ? getBarChartRenderedBars({
          bars,
          orientation,
          categoryScale,
          axisById,
          groupPadding,
          minimumBarSize,
          innerWidth,
          innerHeight,
        })
      : [];
  const renderedBarsBySeriesId = groupBy(renderedBars, (bar) => bar.seriesId);
  const animationRanges = getBarAnimationRanges(renderedBars, orientation);
  const hasRenderedBars = renderedBars.length > 0;
  const barAnimationKey = JSON.stringify([
    orientation,
    bars.map((bar) => [
      bar.id,
      bar.category,
      bar.valueAxisId,
      bar.groupIndex,
      bar.startValue,
      bar.endValue,
    ]),
  ]);
  // One chart-level spring keeps every stack on the same timeline. Individual
  // segments clamp that shared reveal edge to their own final geometry.
  const [animation] = useSpring(
    () => ({
      from: { progress: 0 },
      to: { progress: hasRenderedBars ? 1 : 0 },
      reset: true,
      immediate: isReducedMotion,
    }),
    [barAnimationKey, hasRenderedBars, isReducedMotion]
  );
  const formatCategory = categoryAxis?.formatValue ?? defaultFormatCategory;
  const categoryTickValues =
    categoryAxis?.tickValues ??
    getChartTickValues(
      categories,
      categoryAxis?.tickCount ??
        Math.max(
          1,
          Math.floor(
            isVertical
              ? innerWidth / BAR_CHART_CATEGORY_TICK_SPACING
              : innerHeight / BAR_CHART_CATEGORY_ROW_TICK_SPACING
          )
        )
    );
  const getCategoryPosition = (category: BarChartCategory) => {
    const start = categoryScale(category);
    return start == null ? undefined : start + categoryScale.bandwidth() / 2;
  };

  const hasCategoryTarget =
    getCategoryAriaLabel != null ||
    onDatumActivate != null ||
    onDatumFocus != null ||
    onDatumBlur != null;
  // One pass over the bars, rather than one scan of every bar per category.
  const interactionBarsByCategory = hasCategoryTarget
    ? groupBy(bars.map(toBarChartInteractionBar), (bar) =>
        getCategoryKey(bar.category)
      )
    : undefined;
  const getInteractionDatum = (
    category: BarChartCategory,
    pointerPosition?: { x: number; y: number }
  ): BarChartInteractionDatum => {
    const position = getCategoryPosition(category) ?? 0;
    const categoryBars: readonly BarChartInteractionBar[] =
      interactionBarsByCategory?.get(getCategoryKey(category)) ??
      bars
        .filter((bar) => bar.category === category)
        .map(toBarChartInteractionBar);
    return {
      category,
      categoryPosition:
        position + (isVertical ? chartMargin.left : chartMargin.top),
      xPosition:
        pointerPosition?.x ??
        (isVertical ? chartMargin.left + position : chartMargin.left),
      yPosition:
        pointerPosition?.y ??
        (isVertical ? chartMargin.top : chartMargin.top + position),
      bars: categoryBars,
    };
  };
  const getDatumFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    if (categories.length === 0) return null;
    const bounds = event.currentTarget.getBoundingClientRect();
    const plotX = event.clientX - bounds.left - chartMargin.left;
    const plotY = event.clientY - bounds.top - chartMargin.top;
    if (plotX < 0 || plotX > innerWidth || plotY < 0 || plotY > innerHeight) {
      return null;
    }
    const category = getNearestChartValue(
      categories,
      isVertical ? plotX : plotY,
      getCategoryPosition
    );
    return category == null
      ? null
      : getInteractionDatum(category, {
          x: isVertical
            ? chartMargin.left + (getCategoryPosition(category) ?? plotX)
            : chartMargin.left + plotX,
          y: isVertical
            ? chartMargin.top + plotY
            : chartMargin.top + (getCategoryPosition(category) ?? plotY),
        });
  };
  const handlePointerMove =
    onDatumPointerMove == null && onDatumPointerOut == null
      ? undefined
      : (event: PointerEvent<SVGSVGElement>) => {
          const datum = getDatumFromPointer(event);
          // Leaving the plot for an axis gutter must clear consumer tooltips.
          if (datum == null) onDatumPointerOut?.();
          else onDatumPointerMove?.(datum, event);
        };
  const handlePointerDown =
    onDatumPointerDown == null
      ? undefined
      : (event: PointerEvent<SVGSVGElement>) => {
          const datum = getDatumFromPointer(event);
          if (datum != null) onDatumPointerDown(datum, event);
        };
  const handlePointerUp =
    onDatumPointerUp == null && onDatumActivate == null
      ? undefined
      : (event: PointerEvent<SVGSVGElement>) => {
          const datum = getDatumFromPointer(event);
          if (datum == null) return;
          onDatumPointerUp?.(datum, event);
          const isBarActivation =
            onBarActivate != null &&
            event.target instanceof Element &&
            event.target.closest('[data-bar-id]') != null;
          if (event.button === 0 && !isBarActivation) {
            onDatumActivate?.(datum, event);
          }
        };

  const activeCategoryPosition =
    activeCategory == null ? undefined : getCategoryPosition(activeCategory);
  const activeGuideBar =
    activeGuideBarId == null
      ? undefined
      : renderedBars.find((bar) => bar.id === activeGuideBarId);
  const activeGuidePosition =
    activeGuideBar == null
      ? activeCategoryPosition
      : isVertical
        ? activeGuideBar.x + activeGuideBar.width / 2
        : activeGuideBar.y + activeGuideBar.height / 2;
  const plotSlotProps = {
    orientation,
    categories,
    bars: renderedBars,
    innerWidth,
    innerHeight,
    bandwidth: categoryScale.bandwidth(),
    getCategoryPosition,
    getValuePosition: (valueAxisId: string, value: number) =>
      axisById.get(valueAxisId)?.scale(value),
  };
  const isInteractive =
    hasCategoryTarget ||
    getBarAriaLabel != null ||
    onBarActivate != null ||
    onDatumPointerMove != null;
  const hasAccessibleGuides =
    selectionRange != null || valueBands.some((band) => band.ariaLabel != null);

  return (
    <svg
      width={width}
      height={height}
      // `img` makes descendants presentational, which would hide labeled
      // bars, category targets, and guides from assistive technology.
      role={isInteractive || hasAccessibleGuides ? 'group' : 'img'}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      className={cn(
        'block size-full',
        onDatumActivate != null
          ? 'cursor-pointer'
          : onDatumPointerMove != null && 'cursor-crosshair'
      )}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={onDatumPointerOut}
      onPointerUp={handlePointerUp}
    >
      {canDraw && (
        <Group left={chartMargin.left} top={chartMargin.top}>
          <defs>
            <clipPath id={clipPathId}>
              <rect width={innerWidth} height={innerHeight} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipPathId})`}>
            <BarChartGuides
              orientation={orientation}
              primaryAxis={primaryAxis}
              axisById={axisById}
              categoryScale={categoryScale}
              categoryTickValues={categoryTickValues}
              grid={grid}
              valueBands={valueBands}
              selectionRange={selectionRange}
              innerWidth={innerWidth}
              innerHeight={innerHeight}
              formatCategory={formatCategory}
            />
          </g>
          {slots?.background?.(plotSlotProps)}
          {hasCategoryTarget &&
            categories.map((category) => {
              const start = categoryScale(category);
              if (start == null) return null;
              const datum = getInteractionDatum(category);
              const categoryAriaLabel = getCategoryAriaLabel?.(datum);
              return (
                <rect
                  key={getCategoryKey(category)}
                  x={isVertical ? start : 0}
                  y={isVertical ? 0 : start}
                  width={isVertical ? categoryScale.bandwidth() : innerWidth}
                  height={isVertical ? innerHeight : categoryScale.bandwidth()}
                  fill="transparent"
                  // The plot-level pointer handlers own hit testing; these
                  // targets exist for keyboard and assistive technology.
                  pointerEvents="none"
                  className="focus-visible:stroke-focus focus-visible:stroke-2 focus-visible:outline-none"
                  tabIndex={categoryAriaLabel == null ? undefined : 0}
                  aria-label={categoryAriaLabel}
                  role={
                    categoryAriaLabel != null && onDatumActivate != null
                      ? 'button'
                      : undefined
                  }
                  onKeyDown={
                    onDatumActivate == null
                      ? undefined
                      : (event: KeyboardEvent<SVGRectElement>) => {
                          if (event.key !== 'Enter' && event.key !== ' ')
                            return;
                          event.preventDefault();
                          onDatumActivate(datum, event);
                        }
                  }
                  onFocus={
                    onDatumFocus == null
                      ? undefined
                      : (event) => onDatumFocus(datum, event)
                  }
                  onBlur={
                    onDatumBlur == null
                      ? undefined
                      : (event) => onDatumBlur(datum, event)
                  }
                />
              );
            })}
          {series.map((item) => (
            <g
              key={item.id}
              role="group"
              aria-label={`${item.ariaLabel ?? getAccessibleText(item.label) ?? item.id} series`}
              data-series-id={item.id}
            >
              {(renderedBarsBySeriesId.get(item.id) ?? []).map((bar) => {
                const animationRange = animationRanges.get(bar.id) ?? {
                  start: bar.baselinePosition,
                  end:
                    orientation === 'vertical'
                      ? bar.value < 0
                        ? bar.y + bar.height
                        : bar.y
                      : bar.value < 0
                        ? bar.x
                        : bar.x + bar.width,
                };
                return (
                  <AnimatedBar
                    key={bar.id}
                    bar={bar}
                    orientation={orientation}
                    animationProgress={animation.progress}
                    animationStart={animationRange.start}
                    animationEnd={animationRange.end}
                    ariaLabel={getBarAriaLabel?.(toBarChartInteractionBar(bar))}
                    isDimmed={activeBarId != null && activeBarId !== bar.id}
                    onPointerMove={onBarPointerMove}
                    onPointerOut={onBarPointerOut}
                    onActivate={onBarActivate}
                    onFocus={onBarFocus}
                    onBlur={onBarBlur}
                  />
                );
              })}
            </g>
          ))}
          {activeGuidePosition != null && (
            <line
              x1={isVertical ? activeGuidePosition : 0}
              x2={isVertical ? activeGuidePosition : innerWidth}
              y1={isVertical ? 0 : activeGuidePosition}
              y2={isVertical ? innerHeight : activeGuidePosition}
              stroke="currentColor"
              strokeDasharray={CHART_DASHED_STROKE_DASHARRAY}
              className="text-quaternary"
              pointerEvents="none"
            />
          )}
          {slots?.barLabel != null &&
            renderedBars.map((bar) => (
              <g key={`label:${bar.id}`}>{slots.barLabel?.(bar)}</g>
            ))}
          {slots?.overlay?.(plotSlotProps)}
          <BarChartAxes
            orientation={orientation}
            categories={categories}
            categoryAxis={categoryAxis}
            categoryAxisThickness={categoryAxisThickness}
            categoryScale={categoryScale}
            categoryTickValues={categoryTickValues}
            axes={axes}
            slots={slots}
            innerWidth={innerWidth}
            innerHeight={innerHeight}
            getCategoryPosition={getCategoryPosition}
            formatCategory={formatCategory}
          />
        </Group>
      )}
    </svg>
  );
};
